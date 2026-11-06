import AppKit

enum Style {
    static let stripHeight: CGFloat = 34
    static let cornerRadius: CGFloat = 10
}

/// Several windows (from any apps) sharing one frame under one strip.
/// `active` is shown; the rest wait right behind it, in the same frame.
@MainActor
final class TabGroup {
    var tabs: [CGWindowID]
    var active: CGWindowID
    /// The whole group, strip included, in AX coordinates.
    var frame: CGRect
    let strip: TabStripPanel
    /// The hidden tabs are out of view while the shown one is dragged or resized.
    var parked = false

    init(tabs: [CGWindowID], active: CGWindowID, frame: CGRect, strip: TabStripPanel) {
        self.tabs = tabs
        self.active = active
        self.frame = frame
        self.strip = strip
    }

    var stripFrame: CGRect {
        CGRect(x: frame.minX, y: frame.minY, width: frame.width, height: Style.stripHeight)
    }

    var windowFrame: CGRect {
        CGRect(x: frame.minX, y: frame.minY + Style.stripHeight,
               width: frame.width, height: max(0, frame.height - Style.stripHeight))
    }
}

@MainActor
final class GroupManager {
    private let tracker: WindowTracker
    private(set) var groups: [TabGroup] = []

    /// Our own AX writes come back as Moved/Resized notifications; ignore those.
    private var ignoreUntil: [CGWindowID: Date] = [:]
    /// Each window's size before it joined, so a torn-off tab gets it back.
    private var sizeBeforeGrouping: [CGWindowID: CGSize] = [:]
    private var settle: DispatchWorkItem?
    private var tileDone: DispatchWorkItem?
    private var refitUntil: Date?
    /// The shown tab being dragged by its title bar; its strip follows the pointer.
    private var liveDrag: CGWindowID?
    /// Since the last settle, the shown tab's size changed while a mouse
    /// button was held: the user is resizing it, not the system.
    private var userResized = false
    /// The focused window of the active app, if we track it (for ⌘1…⌘9).
    private(set) var focused: CGWindowID?

    init(tracker: WindowTracker) {
        self.tracker = tracker
    }

    func group(of id: CGWindowID) -> TabGroup? {
        groups.first { $0.tabs.contains(id) }
    }

    func group(atStrip p: CGPoint) -> TabGroup? {
        groups.first { $0.strip.isVisible && $0.stripFrame.contains(p) }
    }

    // MARK: Making and changing groups

    /// Drop `source` (or its whole group) onto `target` (or its group).
    func join(_ source: Win, onto target: Win) {
        guard source.id != target.id else { return }

        var incoming = [source.id]
        if let old = group(of: source.id) {
            if old === group(of: target.id) { return }
            incoming = old.tabs
            discard(old)
        } else if let f = source.frame {
            sizeBeforeGrouping[source.id] = f.size
        }

        let g: TabGroup
        if let existing = group(of: target.id) {
            g = existing
        } else {
            guard let f = target.frame else { return }
            sizeBeforeGrouping[target.id] = f.size
            let strip = TabStripPanel()
            strip.stripDelegate = self
            g = TabGroup(tabs: [target.id], active: target.id, frame: f, strip: strip)
            groups.append(g)
        }

        let insertAt = (g.tabs.firstIndex(of: g.active) ?? g.tabs.count - 1) + 1
        g.tabs.insert(contentsOf: incoming.filter { !g.tabs.contains($0) }, at: insertAt)
        select(source.id, in: g)
    }

    func select(_ id: CGWindowID, in g: TabGroup) {
        guard let w = tracker.windows[id] else { return }
        g.active = id
        // The tabs share one frame, so switching is a raise: nothing moves.
        // (Only a window just dropped on the group isn't in place yet.)
        if w.frame != g.windowFrame { place(w, g.windowFrame) }
        w.raise()
        layout(g)
        reorderStrip(g)
    }

    /// The raise lands asynchronously in the other app: re-assert the
    /// strip's z-order once it has.
    private func reorderStrip(_ g: TabGroup) {
        g.strip.order(.above, relativeTo: Int(g.active))
        for delay in [0.08, 0.25] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self, weak g] in
                MainActor.assumeIsolated {
                    guard let self, let g, self.groups.contains(where: { $0 === g }) else { return }
                    g.strip.order(.above, relativeTo: Int(g.active))
                }
            }
        }
    }

    /// Take a tab out of its group at its old size: under the pointer when
    /// dropped at `p`, otherwise cascaded off the group's corner.
    func tearOff(_ id: CGWindowID, at p: CGPoint?) {
        guard let g = group(of: id), let w = tracker.windows[id] else { return }
        let size = sizeBeforeGrouping.removeValue(forKey: id) ?? g.windowFrame.size
        let origin = p.map { CGPoint(x: $0.x - size.width / 2, y: $0.y - 12) }
            ?? CGPoint(x: g.frame.minX + 28, y: g.frame.minY + 28)
        remove(id, from: g)
        place(w, CGRect(origin: origin, size: size))
        w.raise()
    }

    /// Put every window back on screen. Must run before we quit, or parked
    /// windows stay stranded in the screen corner.
    func ungroupAll() {
        for g in groups { dissolve(g) }
    }

    private func remove(_ id: CGWindowID, from g: TabGroup) {
        guard let i = g.tabs.firstIndex(of: id) else { return }
        g.tabs.remove(at: i)
        if g.tabs.count < 2 { dissolve(g); return }
        if g.active == id {
            select(g.tabs[min(i, g.tabs.count - 1)], in: g)
        } else {
            refreshTabs(g)
        }
    }

    /// Whether the window owns a native tab bar with at least one tab.
    private func isTabbedWindow(_ el: AXUIElement) -> Bool {
        AX.elements(el, kAXChildrenAttribute).contains { tabGroup in
            guard AX.string(tabGroup, kAXRoleAttribute) == kAXTabGroupRole else { return false }
            return AX.elements(tabGroup, kAXChildrenAttribute).contains {
                AX.string($0, kAXRoleAttribute) == kAXRadioButtonRole
            }
        }
    }

    /// `w` went off screen or closed, but its window's native tab group may
    /// live on at another window element (Finder's tabs): point the group's
    /// entry at the focused sibling tab instead of dropping the window.
    private func swapToFocusedTab(_ w: Win, in g: TabGroup) -> Bool {
        let appEl = AXUIElementCreateApplication(w.pid)
        guard let fEl = AX.element(appEl, kAXFocusedWindowAttribute),
              let fid = AX.windowID(fEl), fid != w.id,
              let fw = tracker.windows[fid], group(of: fid) == nil,
              isTabbedWindow(fEl) || AX.hasOwnTabs(w.element),
              let f = fw.frame,
              g.windowFrame.insetBy(dx: -16, dy: -16).intersects(f),
              let i = g.tabs.firstIndex(of: w.id)
        else { return false }
        g.tabs[i] = fid
        if g.active == w.id { g.active = fid }
        if let s = sizeBeforeGrouping.removeValue(forKey: w.id) { sizeBeforeGrouping[fid] = s }
        if f != g.windowFrame { place(fw, g.windowFrame) }
        refreshTabs(g)
        reorderStrip(g)
        return true
    }

    /// End a group: the last window takes the whole space, strip included;
    /// if several are left (ungroup all / quit) they cascade.
    private func dissolve(_ g: TabGroup) {
        discard(g)
        let order = g.tabs.filter { $0 == g.active } + g.tabs.filter { $0 != g.active }
        for (n, id) in order.enumerated() {
            guard let w = tracker.windows[id] else { continue }
            let step = CGFloat(n) * 28
            place(w, g.frame.offsetBy(dx: step, dy: step))
        }
    }

    private func discard(_ g: TabGroup) {
        groups.removeAll { $0 === g }
        g.strip.orderOut(nil)
    }

    // MARK: Across restarts

    private struct SavedGroup: Codable {
        struct Tab: Codable {
            var id: CGWindowID
            var bundleID: String?
            var title: String
            var sizeBeforeGrouping: CGSize?
        }
        var tabs: [Tab]
        var active: Int
        var frame: CGRect
    }

    private static let savedKey = "savedGroups"

    /// On quit (before `ungroupAll`), so an update or a restart brings the
    /// groups back. Not on "Ungroup all": that's meant.
    func save() {
        let saved = groups.map { g in
            SavedGroup(tabs: g.tabs.compactMap { id in
                tracker.windows[id].map {
                    SavedGroup.Tab(id: id, bundleID: NSRunningApplication(processIdentifier: $0.pid)?.bundleIdentifier,
                                   title: $0.title, sizeBeforeGrouping: sizeBeforeGrouping[id])
                }
            }, active: g.tabs.firstIndex(of: g.active) ?? 0, frame: g.frame)
        }
        UserDefaults.standard.set(try? JSONEncoder().encode(saved), forKey: Self.savedKey)
    }

    /// The other apps kept running while we restarted, so their windows
    /// still have the same IDs. One that doesn't (its app restarted too) is
    /// looked up by app and title, if that's unambiguous.
    func restore() {
        guard let data = UserDefaults.standard.data(forKey: Self.savedKey),
              let saved = try? JSONDecoder().decode([SavedGroup].self, from: data) else { return }
        UserDefaults.standard.removeObject(forKey: Self.savedKey)
        func bundle(_ w: Win) -> String? { NSRunningApplication(processIdentifier: w.pid)?.bundleIdentifier }
        var used = Set<CGWindowID>()
        func find(_ t: SavedGroup.Tab) -> Win? {
            if let w = tracker.windows[t.id], !used.contains(w.id), bundle(w) == t.bundleID { return w }
            let same = tracker.windows.values.filter { !used.contains($0.id) && bundle($0) == t.bundleID && $0.title == t.title }
            return same.count == 1 ? same[0] : nil
        }

        let front = NSWorkspace.shared.frontmostApplication
        for s in saved {
            var tabs: [CGWindowID] = []
            var active: CGWindowID?
            for (i, t) in s.tabs.enumerated() {
                guard let w = find(t) else { continue }
                used.insert(w.id)
                tabs.append(w.id)
                if let size = t.sizeBeforeGrouping { sizeBeforeGrouping[w.id] = size }
                if i == s.active { active = w.id }
            }
            guard tabs.count >= 2 else { continue }
            let strip = TabStripPanel()
            strip.stripDelegate = self
            let g = TabGroup(tabs: tabs, active: active ?? tabs[0], frame: s.frame, strip: strip)
            groups.append(g)
            select(g.active, in: g)
        }
        // Showing each group's tab activated its app: give focus back.
        front?.activate()
    }

    // MARK: Apps that restart

    /// A tab that went away (an app update relaunches it, a crash, ⌘Q). If
    /// its app comes back soon, as another process, its new window takes the
    /// old one's place; the same process opening a window again doesn't
    /// count (⌘W, then ⌘N).
    private struct Lost {
        var id: CGWindowID
        var pid: pid_t
        var bundleID: String
        var title: String
        /// Its group's tabs in order, itself included.
        var order: [CGWindowID]
        var until: Date
    }
    private var lost: [Lost] = []
    /// Lost windows that came back, old ID → new: a partner may be one.
    private var returned: [CGWindowID: CGWindowID] = [:]

    private func remember(_ w: Win) {
        lost.removeAll { $0.until < Date() }
        if lost.isEmpty { returned.removeAll() }
        guard let bundleID = w.bundleID, !lost.contains(where: { $0.id == w.id }) else { return }
        let order: [CGWindowID]
        if let g = group(of: w.id) {
            order = g.tabs
        } else if let other = lost.first(where: { $0.order.contains(w.id) }) {
            // Its group ended when a tab of the same app went first.
            order = other.order
        } else { return }
        // Long enough for an updater to install and relaunch.
        lost.append(Lost(id: w.id, pid: w.pid, bundleID: bundleID, title: w.title,
                         order: order, until: Date().addingTimeInterval(120)))
    }

    private func bringBack(_ w: Win) {
        guard tracker.windows[w.id] === w, group(of: w.id) == nil else { return }
        let title = w.title
        let mine = lost.indices.filter { lost[$0].bundleID == w.bundleID && lost[$0].pid != w.pid }
        guard let i = mine.first(where: { lost[$0].title == title }) ?? mine.first else { return }
        let l = lost.remove(at: i)
        returned[l.id] = w.id
        let order = l.order.map { returned[$0] ?? $0 }
        let partners = order.compactMap { tracker.windows[$0] }.filter { $0.id != w.id }
        guard let target = partners.first(where: { group(of: $0.id) != nil }) ?? partners.first else { return }
        // Showing the tab activates its app; an update may relaunch it behind.
        let front = NSWorkspace.shared.frontmostApplication
        join(w, onto: target)
        // Back to its old place: after the nearest tab that was before it,
        // else before the nearest one that was after it.
        if let g = group(of: w.id), let k = order.firstIndex(of: w.id) {
            g.tabs.removeAll { $0 == w.id }
            let at = order[..<k].reversed().lazy.compactMap { g.tabs.firstIndex(of: $0) }.first.map { $0 + 1 }
                ?? order[(k + 1)...].lazy.compactMap { g.tabs.firstIndex(of: $0) }.first
                ?? g.tabs.count
            g.tabs.insert(w.id, at: at)
            refreshTabs(g)
        }
        if let front, front.processIdentifier != w.pid { front.activate() }
    }

    // MARK: Placement

    private func place(_ w: Win, _ r: CGRect) {
        ignore(w.id)
        w.setFrame(r)
    }

    /// The hidden tabs wait right behind the shown one, in the same frame:
    /// Mission Control shows them as they are, and switching moves nothing.
    /// (Parked off screen instead, Mission Control shrinks every thumbnail
    /// to fit them, and swapping two windows flickers their shadows.)
    private func stack(_ g: TabGroup) {
        g.parked = false
        for id in g.tabs where id != g.active {
            if let w = tracker.windows[id], w.frame != g.windowFrame { place(w, g.windowFrame) }
        }
    }

    /// While the shown tab is dragged or resized the ones behind it would
    /// show: park them until it settles, one pixel left on screen in a corner
    /// with no neighbouring display (AeroSpace's trick).
    private func parkHidden(_ g: TabGroup) {
        guard !g.parked else { return }
        g.parked = true
        let spot = parkSpot(in: g)
        moveTogether(g.tabs.filter { $0 != g.active }.compactMap { tracker.windows[$0] }.map { ($0, spot) })
    }

    private func parkSpot(in g: TabGroup) -> CGPoint {
        let size = g.windowFrame.size
        let screen = Coords.screenFrame(containing: g.frame)
        let others = Coords.screenFrames().filter { $0 != screen }
        let corners = [
            CGPoint(x: screen.maxX - 1, y: screen.maxY - 1),                // bottom-right
            CGPoint(x: screen.minX - size.width + 1, y: screen.maxY - 1),   // bottom-left
        ]
        return corners.first { c in
            !others.contains { $0.intersects(CGRect(origin: c, size: size)) }
        } ?? corners[0]
    }

    /// Back-to-back position writes; AXEnhancedUserInterface (see
    /// `AX.withoutEnhancedUI`) is switched off around all of them, not each.
    private func moveTogether(_ moves: [(Win, CGPoint)]) {
        var enhanced: [AXUIElement] = []
        for (w, _) in moves where !enhanced.contains(where: { CFEqual($0, w.appElement) })
            && AX.bool(w.appElement, "AXEnhancedUserInterface") == true {
            AX.set(w.appElement, "AXEnhancedUserInterface", kCFBooleanFalse)
            enhanced.append(w.appElement)
        }
        for (w, p) in moves {
            ignore(w.id)
            AX.setPosition(w.element, p)
        }
        for app in enhanced { AX.set(app, "AXEnhancedUserInterface", kCFBooleanTrue) }
    }

    private func ignore(_ id: CGWindowID) {
        ignoreUntil[id] = Date().addingTimeInterval(0.5)
    }

    /// Keep the strip on top of the window, below the menu bar, and in front.
    private func layout(_ g: TabGroup) {
        let visible = Coords.visibleFrame(containing: g.frame)
        if g.frame.minY < visible.minY {
            let bottom = g.frame.maxY
            g.frame.origin.y = visible.minY
            // A maximised window: the strip takes its room from the window,
            // not from the Dock (a bottom already past it stays where it was).
            g.frame.size.height = min(g.frame.height, max(visible.maxY, bottom) - visible.minY)
            if let w = tracker.windows[g.active] { place(w, g.windowFrame) }
        }
        stack(g)
        refreshTabs(g)
        g.strip.show(at: g.stripFrame, above: g.active)
    }

    private func refreshTabs(_ g: TabGroup) {
        let items = g.tabs.compactMap { id in
            tracker.windows[id].map { TabItem(id: id, title: $0.title, icon: $0.icon) }
        }
        // The key goes to the shown tab's own tabs then: no hints.
        let hints = tracker.windows[g.active].map { !SwitchKey.current.yields(to: $0) } ?? true
        g.strip.update(items: items, active: g.active, hints: hints)
    }

    /// The user moved or resized the shown tab: the group follows it.
    /// The strip tracks the window live; the full layout (screen clamp,
    /// z-order) waits until the mouse is released.
    private func follow(_ w: Win) {
        // Right after a tile is fitted, the system puts the window back over
        // the strip once (to exactly the tile); only a second write sticks.
        if let until = refitUntil, until > Date(), let g = group(of: w.id), g.active == w.id,
           w.frame == g.frame {
            place(w, g.windowFrame)
            return
        }
        if let until = ignoreUntil[w.id], until > Date() { return }
        guard w.id != liveDrag, let g = group(of: w.id), g.active == w.id, let f = w.frame else { return }
        if NSEvent.pressedMouseButtons & 1 != 0 { parkHidden(g) }
        if f.size != g.windowFrame.size {
            if NSEvent.pressedMouseButtons & 1 != 0 { userResized = true }
            else if !userResized { followTile(g, w, f); return }
        }
        fit(g, to: f)
        g.strip.setFrame(Coords.toAppKit(g.stripFrame), display: true)
        scheduleSettle(g)
    }

    private func fit(_ g: TabGroup, to f: CGRect) {
        g.frame = CGRect(x: f.minX, y: f.minY - Style.stripHeight,
                         width: f.width, height: f.height + Style.stripHeight)
    }

    /// Title-bar drag of a shown tab, with the WindowServer's frame: the
    /// app's kAXMoved notifications are coalesced during a drag. (Dragging a
    /// tile out also restores its old size here.)
    func dragMoved(_ id: CGWindowID, frame f: CGRect) {
        guard let g = group(of: id), g.active == id else { return }
        parkHidden(g)
        liveDrag = id
        fit(g, to: f)
        g.strip.setFrame(Coords.toAppKit(g.stripFrame), display: true)
        scheduleSettle(g)
    }

    func dragEnded() { liveDrag = nil }

    /// The system is sizing the shown tab: edge tiling (it animates, a dozen
    /// notifications over ~0.3 s), Fill, a shortcut. Its frame is the space
    /// for the whole group: the strip rides the top edge, and once the frame
    /// holds still the window makes room for it. (Writing mid-animation would
    /// be undone by the animation's later frames.)
    private func followTile(_ g: TabGroup, _ w: Win, _ f: CGRect) {
        settle?.cancel()
        g.frame = f
        g.strip.setFrame(Coords.toAppKit(g.stripFrame), display: true)
        tileDone?.cancel()
        let work = DispatchWorkItem { [weak self, weak g] in
            MainActor.assumeIsolated {
                guard let self, let g, g.active == w.id, self.groups.contains(where: { $0 === g }) else { return }
                self.userResized = false
                self.place(w, g.windowFrame)
                self.refitUntil = Date().addingTimeInterval(1)
                self.layout(g)
            }
        }
        tileDone = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: work)
    }

    private func scheduleSettle(_ g: TabGroup) {
        settle?.cancel()
        let work = DispatchWorkItem { [weak self, weak g] in
            MainActor.assumeIsolated {
                guard let self, let g, self.groups.contains(where: { $0 === g }) else { return }
                if NSEvent.pressedMouseButtons & 1 != 0 { self.scheduleSettle(g); return } // still dragging
                if let w = self.tracker.windows[g.active], let f = w.frame {
                    // A tile on releasing a title-bar drag: follow skipped it.
                    if !self.userResized && f.size != g.windowFrame.size { self.followTile(g, w, f); return }
                    self.fit(g, to: f)   // the pointer only approximated it (menu-bar clamp)
                }
                self.userResized = false
                self.layout(g)
            }
        }
        settle = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15, execute: work)
    }
}

// MARK: - Window events

extension GroupManager: WindowTrackerDelegate {
    func windowMoved(_ w: Win) { follow(w) }
    func windowResized(_ w: Win) { follow(w) }

    func windowDestroyed(_ w: Win) {
        // A closed native tab leaves its tab group alive, focused at its
        // sibling. Finder only moves focus just after the destroy: give it a
        // beat, then let the group follow the sibling. Otherwise the window
        // is really gone.
        if let g = group(of: w.id) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self, weak g] in
                MainActor.assumeIsolated {
                    guard let self, let g, self.groups.contains(where: { $0 === g }),
                          g.tabs.contains(w.id), !self.swapToFocusedTab(w, in: g) else { return }
                    self.remember(w)
                    self.sizeBeforeGrouping[w.id] = nil
                    self.remove(w.id, from: g)
                }
            }
        } else {
            remember(w)
            sizeBeforeGrouping[w.id] = nil
        }
    }

    func windowAppeared(_ w: Win) {
        guard lost.contains(where: { $0.bundleID == w.bundleID && $0.pid != w.pid }) else { return }
        // A relaunched app puts its windows where it left them just after
        // creating them: let it, or the group would follow that move.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            MainActor.assumeIsolated { self?.bringBack(w) }
        }
    }

    func windowTitleChanged(_ w: Win) {
        if let g = group(of: w.id) { refreshTabs(g) }
    }

    func windowFocused(_ w: Win) {
        focused = w.id
        guard let g = group(of: w.id) else { return }
        if g.active == w.id {
            reorderStrip(g)
        } else {
            // ⌘` or the app itself brought a hidden tab forward: switch to it.
            select(w.id, in: g)
        }
    }

    func focusMoved() {
        focused = nil   // windowFocused follows when a tracked window has focus
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            MainActor.assumeIsolated {
                guard let self, !self.groups.isEmpty,
                      let list = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[String: Any]]
                else { return }
                let order = list.compactMap { ($0[kCGWindowNumber as String] as? Int).map { CGWindowID($0) } }
                let onScreen = Set(order)
                // ⌘W often only hides a window (apps that stay open with no
                // windows, the last in-window tab of a browser): it's closed
                // as far as the group goes. Not when the app is hidden (⌘H),
                // nor when the whole group is off screen (another Space).
                for g in self.groups where !g.parked && g.tabs.contains(where: onScreen.contains) {
                    for id in g.tabs where !onScreen.contains(id) {
                        guard self.groups.contains(where: { $0 === g }),   // not dissolved meanwhile
                              let w = self.tracker.windows[id] else { continue }
                        let hidden = NSRunningApplication(processIdentifier: w.pid)?.isHidden ?? true
                        let min = AX.bool(w.element, kAXMinimizedAttribute) ?? false
                        guard hidden == false, min != true else { continue }
                        // Off screen but not closed: a native tab's sibling
                        // took focus (Finder "Open in New Tab"). Follow it
                        // instead of dropping the window.
                        if self.swapToFocusedTab(w, in: g) { continue }
                        self.remember(w)
                        self.remove(id, from: g)
                    }
                }
                // Activating an app (⌘Tab, the Dock) can bring all its windows
                // forward, hidden tabs included, without focusing them: the
                // group then shows whichever tab ended up on top.
                for g in self.groups where !g.parked {
                    guard let top = order.first(where: g.tabs.contains), top != g.active else { continue }
                    g.active = top
                    self.refreshTabs(g)
                    self.reorderStrip(g)
                }
            }
        }
    }

    func windowMinimized(_ w: Win) {
        // Prototype choice: a minimised tab leaves its group.
        // (TrellisWM minimises the whole group from the strip instead.)
        if let g = group(of: w.id) { remove(w.id, from: g) }
    }
}

// MARK: - Strip events

extension GroupManager: TabStripDelegate {
    private func group(for strip: TabStripPanel) -> TabGroup? {
        groups.first { $0.strip === strip }
    }

    func tabStrip(_ strip: TabStripPanel, didSelect id: CGWindowID) {
        if let g = group(for: strip) { select(id, in: g) }
    }

    func tabStrip(_ strip: TabStripPanel, didClose id: CGWindowID) {
        guard let g = group(for: strip), let w = tracker.windows[id] else { return }
        // Show it first: a "Save changes?" sheet on a parked window would be invisible.
        if g.active != id { select(id, in: g) }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            MainActor.assumeIsolated { w.close() }
        }
    }

    func tabStrip(_ strip: TabStripPanel, didMove id: CGWindowID, to index: Int) {
        guard let g = group(for: strip), let from = g.tabs.firstIndex(of: id) else { return }
        g.tabs.remove(at: from)
        g.tabs.insert(id, at: min(index, g.tabs.count))
        refreshTabs(g)
    }

    func tabStrip(_ strip: TabStripPanel, didTearOff id: CGWindowID, at point: CGPoint?) {
        tearOff(id, at: point)
    }

    func tabStripUngroupAll(_ strip: TabStripPanel) { ungroupAll() }
}
