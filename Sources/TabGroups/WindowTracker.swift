import AppKit
import ApplicationServices

/// One standard window of another app.
@MainActor
final class Win {
    let id: CGWindowID
    let pid: pid_t
    let element: AXUIElement
    let appElement: AXUIElement
    let appName: String
    let icon: NSImage?

    init(id: CGWindowID, pid: pid_t, element: AXUIElement, appElement: AXUIElement) {
        self.id = id
        self.pid = pid
        self.element = element
        self.appElement = appElement
        let app = NSRunningApplication(processIdentifier: pid)
        appName = app?.localizedName ?? "App"
        icon = app?.icon
    }

    var title: String {
        let t = AX.string(element, kAXTitleAttribute) ?? ""
        return t.isEmpty ? appName : t
    }

    var frame: CGRect? { AX.frame(element) }

    /// The WindowServer's bounds: current even mid-drag, while the app's AX
    /// position lags behind it.
    var serverFrame: CGRect? {
        guard let info = (CGWindowListCopyWindowInfo(.optionIncludingWindow, id) as? [[String: Any]])?.first,
              let bounds = info[kCGWindowBounds as String] as? NSDictionary else { return nil }
        return CGRect(dictionaryRepresentation: bounds)
    }

    func setFrame(_ r: CGRect) {
        AX.withoutEnhancedUI(appElement) { AX.setFrame(element, r) }
    }

    /// Bring this window (and its app) to the front, with keyboard focus.
    func raise() {
        let focused = Focus.focus(id, pid: pid)
        AX.set(element, kAXMainAttribute, kCFBooleanTrue)
        AX.perform(element, kAXRaiseAction)
        if !focused { AX.set(appElement, kAXFrontmostAttribute, kCFBooleanTrue) }
    }

    func close() {
        if let button = AX.element(element, kAXCloseButtonAttribute) {
            AX.perform(button, kAXPressAction)
        }
    }
}

@MainActor
protocol WindowTrackerDelegate: AnyObject {
    func windowMoved(_ w: Win)
    func windowResized(_ w: Win)
    func windowDestroyed(_ id: CGWindowID)
    func windowTitleChanged(_ w: Win)
    func windowFocused(_ w: Win)
    func windowMinimized(_ w: Win)
    /// An app was activated or focus moved to another window (or none).
    func focusMoved()
}

/// Keeps an AXObserver per running app and a table of every standard window.
@MainActor
final class WindowTracker {
    weak var delegate: WindowTrackerDelegate?
    private(set) var windows: [CGWindowID: Win] = [:]

    private var observers: [pid_t: AXObserver] = [:]
    private var appElements: [pid_t: AXUIElement] = [:]
    private var tokens: [NSObjectProtocol] = []

    private static let appNotifications = [
        kAXWindowCreatedNotification,
        kAXFocusedWindowChangedNotification,
    ]
    private static let windowNotifications = [
        kAXUIElementDestroyedNotification,
        kAXMovedNotification,
        kAXResizedNotification,
        kAXTitleChangedNotification,
        kAXWindowMiniaturizedNotification,
    ]

    func start() {
        for app in NSWorkspace.shared.runningApplications { watch(app) }

        let nc = NSWorkspace.shared.notificationCenter
        tokens.append(nc.addObserver(forName: NSWorkspace.didLaunchApplicationNotification, object: nil, queue: .main) { [weak self] n in
            guard let app = n.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication else { return }
            // A just-launched app's AX tree isn't ready yet.
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                MainActor.assumeIsolated { self?.watch(app) }
            }
        })
        tokens.append(nc.addObserver(forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main) { [weak self] n in
            guard let app = n.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication else { return }
            MainActor.assumeIsolated { self?.activated(app) }
        })
        tokens.append(nc.addObserver(forName: NSWorkspace.didTerminateApplicationNotification, object: nil, queue: .main) { [weak self] n in
            guard let app = n.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication else { return }
            MainActor.assumeIsolated { self?.unwatch(app.processIdentifier) }
        })
    }

    // MARK: Apps

    private func watch(_ app: NSRunningApplication, attempt: Int = 0) {
        let pid = app.processIdentifier
        guard pid != getpid(), observers[pid] == nil, !app.isTerminated, app.activationPolicy == .regular else { return }

        let appEl = AXUIElementCreateApplication(pid)
        AXUIElementSetMessagingTimeout(appEl, 1.0) // a hung app must not hang us

        var created: AXObserver?
        guard AXObserverCreate(pid, axCallback, &created) == .success, let observer = created else { return }
        let results = Self.appNotifications.map { AXObserverAddNotification(observer, appEl, $0 as CFString, refcon) }
        // A launching app is activated before it answers AX (Electron apps
        // for a second or so): watched now, it would never report its windows.
        if results.contains(.cannotComplete) {
            // ponytail: gives up after 10 s; the next activation tries again.
            if attempt < 20 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    MainActor.assumeIsolated { self?.watch(app, attempt: attempt + 1) }
                }
            }
            return
        }
        CFRunLoopAddSource(CFRunLoopGetMain(), AXObserverGetRunLoopSource(observer), .commonModes)

        observers[pid] = observer
        appElements[pid] = appEl
        rescan(pid)
    }

    /// Activating an app with the same focused window sends no
    /// FocusedWindowChanged, but its window still jumps over our strips.
    private func activated(_ app: NSRunningApplication) {
        let pid = app.processIdentifier
        watch(app)
        rescan(pid)
        delegate?.focusMoved()
        if let appEl = appElements[pid], let el = AX.element(appEl, kAXFocusedWindowAttribute),
           let w = win(for: el) { delegate?.windowFocused(w) }
    }

    private func unwatch(_ pid: pid_t) {
        if let observer = observers.removeValue(forKey: pid) {
            CFRunLoopRemoveSource(CFRunLoopGetMain(), AXObserverGetRunLoopSource(observer), .commonModes)
        }
        appElements[pid] = nil
        for (id, w) in windows where w.pid == pid {
            windows[id] = nil
            delegate?.windowDestroyed(id)
        }
    }

    private func rescan(_ pid: pid_t) {
        guard let appEl = appElements[pid] else { return }
        for el in AX.elements(appEl, kAXWindowsAttribute) { add(el, pid: pid) }
    }

    // MARK: Windows

    @discardableResult
    private func add(_ el: AXUIElement, pid: pid_t) -> Win? {
        guard AX.string(el, kAXRoleAttribute) == kAXWindowRole,
              AX.string(el, kAXSubroleAttribute) == kAXStandardWindowSubrole,
              let id = AX.windowID(el),
              let appEl = appElements[pid] else { return nil }
        if let known = windows[id] { return known }

        let w = Win(id: id, pid: pid, element: el, appElement: appEl)
        windows[id] = w
        if let observer = observers[pid] {
            for n in Self.windowNotifications {
                AXObserverAddNotification(observer, el, n as CFString, refcon)
            }
        }
        return w
    }

    private func win(for el: AXUIElement) -> Win? {
        if let id = AX.windowID(el), let w = windows[id] { return w }
        return windows.values.first { CFEqual($0.element, el) }
    }

    fileprivate func handle(_ el: AXUIElement, _ notification: String) {
        switch notification {
        case kAXWindowCreatedNotification:
            var pid: pid_t = 0
            AXUIElementGetPid(el, &pid)
            add(el, pid: pid)

        case kAXFocusedWindowChangedNotification:
            delegate?.focusMoved()
            var focused = el
            if AX.string(el, kAXRoleAttribute) == kAXApplicationRole,
               let f = AX.element(el, kAXFocusedWindowAttribute) { focused = f }
            var pid: pid_t = 0
            AXUIElementGetPid(focused, &pid)
            if let w = win(for: focused) ?? add(focused, pid: pid) { delegate?.windowFocused(w) }

        case kAXUIElementDestroyedNotification:
            // The element is already dead, so match it by identity.
            if let entry = windows.first(where: { CFEqual($0.value.element, el) }) {
                windows[entry.key] = nil
                delegate?.windowDestroyed(entry.key)
            }

        case kAXMovedNotification:
            if let w = win(for: el) { delegate?.windowMoved(w) }
        case kAXResizedNotification:
            if let w = win(for: el) { delegate?.windowResized(w) }
        case kAXTitleChangedNotification:
            if let w = win(for: el) { delegate?.windowTitleChanged(w) }
        case kAXWindowMiniaturizedNotification:
            if let w = win(for: el) { delegate?.windowMinimized(w) }
        default:
            break
        }
    }

    private var refcon: UnsafeMutableRawPointer { Unmanaged.passUnretained(self).toOpaque() }

    // MARK: Hit testing

    /// The front-most tracked window under a point (AX coordinates), using the
    /// WindowServer's real z-order. Our own panels are looked through.
    func topWindow(at p: CGPoint, excluding: Set<CGWindowID> = []) -> Win? {
        let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
        guard let list = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] else { return nil }
        for info in list {
            guard (info[kCGWindowLayer as String] as? Int) == 0,
                  let number = info[kCGWindowNumber as String] as? Int,
                  let boundsDict = info[kCGWindowBounds as String] as? NSDictionary,
                  let bounds = CGRect(dictionaryRepresentation: boundsDict as CFDictionary),
                  bounds.contains(p) else { continue }
            let id = CGWindowID(number)
            if excluding.contains(id) { continue }
            if (info[kCGWindowOwnerPID as String] as? Int32) == getpid() { continue }
            // The first real window under the point covers anything behind it.
            return windows[id]
        }
        return nil
    }
}

/// C trampoline for AXObserver. Sources are on the main run loop.
private func axCallback(_ observer: AXObserver, _ element: AXUIElement, _ notification: CFString, _ refcon: UnsafeMutableRawPointer?) {
    guard let refcon else { return }
    let tracker = Unmanaged<WindowTracker>.fromOpaque(refcon).takeUnretainedValue()
    let name = notification as String
    MainActor.assumeIsolated { tracker.handle(element, name) }
}
