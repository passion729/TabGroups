import AppKit
import ApplicationServices

/// Private but stable for a decade: maps an AX window element to its CGWindowID.
@_silgen_name("_AXUIElementGetWindow")
@discardableResult
func _AXUIElementGetWindow(_ element: AXUIElement, _ wid: inout CGWindowID) -> AXError

/// `GetProcessForPID` without its deprecation warning.
@_silgen_name("GetProcessForPID")
func _GetProcessForPID(_ pid: pid_t, _ psn: UnsafeMutablePointer<ProcessSerialNumber>) -> OSStatus

/// Make a window the key window of its app, and that app frontmost: what a
/// click in the window does. AX alone can't do it: `kAXMainAttribute` +
/// `kAXFrontmostAttribute` raise the window, but the app gives keyboard focus
/// back to the window it had key before (the previous tab). The SkyLight
/// calls are the ones yabai and AltTab use.
@MainActor
enum Focus {
    private typealias SetFront = @convention(c) (UnsafeMutablePointer<ProcessSerialNumber>, CGWindowID, UInt32) -> CGError
    private typealias PostEvent = @convention(c) (UnsafeMutablePointer<ProcessSerialNumber>, UnsafeMutablePointer<UInt8>) -> CGError

    private static let skyLight = dlopen("/System/Library/PrivateFrameworks/SkyLight.framework/SkyLight", RTLD_LAZY)
    private static let setFront = dlsym(skyLight, "_SLPSSetFrontProcessWithOptions").map { unsafeBitCast($0, to: SetFront.self) }
    private static let postEvent = dlsym(skyLight, "SLPSPostEventRecordTo").map { unsafeBitCast($0, to: PostEvent.self) }

    /// False when SkyLight isn't there (the caller falls back to AX).
    static func focus(_ wid: CGWindowID, pid: pid_t) -> Bool {
        guard let setFront, let postEvent else { return false }
        var psn = ProcessSerialNumber()
        guard _GetProcessForPID(pid, &psn) == noErr else { return false }
        _ = setFront(&psn, wid, 0x200)   // kCPSUserGenerated
        // A synthetic "window became key" event record.
        var bytes = [UInt8](repeating: 0, count: 0xf8)
        bytes[0x04] = 0xf8
        bytes[0x3a] = 0x10
        withUnsafeBytes(of: wid) { bytes.replaceSubrange(0x3c..<0x40, with: $0) }
        for i in 0x20..<0x30 { bytes[i] = 0xff }
        bytes[0x08] = 0x01
        _ = postEvent(&psn, &bytes)
        bytes[0x08] = 0x02
        _ = postEvent(&psn, &bytes)
        return true
    }
}

/// Thin helpers over the Accessibility C API.
@MainActor
enum AX {
    static func attr(_ el: AXUIElement, _ name: String) -> CFTypeRef? {
        var value: CFTypeRef?
        return AXUIElementCopyAttributeValue(el, name as CFString, &value) == .success ? value : nil
    }

    static func string(_ el: AXUIElement, _ name: String) -> String? {
        attr(el, name) as? String
    }

    static func bool(_ el: AXUIElement, _ name: String) -> Bool? {
        (attr(el, name) as? NSNumber)?.boolValue
    }

    static func element(_ el: AXUIElement, _ name: String) -> AXUIElement? {
        guard let v = attr(el, name), CFGetTypeID(v) == AXUIElementGetTypeID() else { return nil }
        return (v as! AXUIElement)
    }

    static func elements(_ el: AXUIElement, _ name: String) -> [AXUIElement] {
        (attr(el, name) as? [AXUIElement]) ?? []
    }

    /// The window shows a tab bar of its own with 2+ tabs (native window
    /// tabs: Ghostty, Safari, Finder…). Browsers that draw their own tabs
    /// don't expose one here.
    static func hasOwnTabs(_ window: AXUIElement) -> Bool {
        elements(window, kAXChildrenAttribute).contains { el in
            string(el, kAXRoleAttribute) == kAXTabGroupRole
                && elements(el, kAXChildrenAttribute).filter { string($0, kAXRoleAttribute) == kAXRadioButtonRole }.count > 1
        }
    }

    static func set(_ el: AXUIElement, _ name: String, _ value: CFTypeRef) {
        AXUIElementSetAttributeValue(el, name as CFString, value)
    }

    static func perform(_ el: AXUIElement, _ action: String) {
        AXUIElementPerformAction(el, action as CFString)
    }

    static func windowID(_ el: AXUIElement) -> CGWindowID? {
        var id: CGWindowID = 0
        return _AXUIElementGetWindow(el, &id) == .success && id != 0 ? id : nil
    }

    // MARK: Geometry (AX uses global, top-left-origin coordinates)

    static func frame(_ el: AXUIElement) -> CGRect? {
        guard let p = axValue(el, kAXPositionAttribute, .cgPoint, CGPoint.zero),
              let s = axValue(el, kAXSizeAttribute, .cgSize, CGSize.zero) else { return nil }
        return CGRect(origin: p, size: s)
    }

    static func setPosition(_ el: AXUIElement, _ point: CGPoint) {
        var p = point
        if let v = AXValueCreate(.cgPoint, &p) { set(el, kAXPositionAttribute, v) }
    }

    static func setSize(_ el: AXUIElement, _ size: CGSize) {
        var s = size
        if let v = AXValueCreate(.cgSize, &s) { set(el, kAXSizeAttribute, v) }
    }

    /// size → position → size: the second size wins when the first was clamped
    /// by the screen the window was on before it moved.
    static func setFrame(_ el: AXUIElement, _ r: CGRect) {
        setSize(el, r.size)
        setPosition(el, r.origin)
        setSize(el, r.size)
    }

    /// Chromium/Electron apps animate (slowly) every AX frame change while
    /// AXEnhancedUserInterface is on. Turn it off around our writes.
    static func withoutEnhancedUI(_ app: AXUIElement, _ body: () -> Void) {
        let enhanced = bool(app, "AXEnhancedUserInterface") == true
        if enhanced { set(app, "AXEnhancedUserInterface", kCFBooleanFalse) }
        body()
        if enhanced { set(app, "AXEnhancedUserInterface", kCFBooleanTrue) }
    }

    private static func axValue<T>(_ el: AXUIElement, _ name: String, _ type: AXValueType, _ initial: T) -> T? {
        guard let v = attr(el, name), CFGetTypeID(v) == AXValueGetTypeID() else { return nil }
        var out = initial
        let ok = withUnsafeMutableBytes(of: &out) { AXValueGetValue(v as! AXValue, type, $0.baseAddress!) }
        return ok ? out : nil
    }
}

/// AppKit uses bottom-left origin on the primary screen; AX / CGWindowList /
/// CGEvent use top-left. Everything in the model is kept in AX coordinates.
@MainActor
enum Coords {
    static var primaryHeight: CGFloat { NSScreen.screens.first?.frame.height ?? 0 }

    static func toAppKit(_ r: CGRect) -> NSRect {
        NSRect(x: r.minX, y: primaryHeight - r.maxY, width: r.width, height: r.height)
    }

    static func toAX(_ r: NSRect) -> CGRect {
        CGRect(x: r.minX, y: primaryHeight - r.maxY, width: r.width, height: r.height)
    }

    static func toAX(_ p: NSPoint) -> CGPoint {
        CGPoint(x: p.x, y: primaryHeight - p.y)
    }

    static func cursor() -> CGPoint { toAX(NSEvent.mouseLocation) }

    static func screenFrames() -> [CGRect] { NSScreen.screens.map { toAX($0.frame) } }

    static func screen(containing r: CGRect) -> NSScreen? {
        func overlap(_ s: NSScreen) -> CGFloat {
            let i = toAX(s.frame).intersection(r)
            return i.isNull ? 0 : i.width * i.height
        }
        return NSScreen.screens.max { overlap($0) < overlap($1) } ?? NSScreen.main
    }

    static func screenFrame(containing r: CGRect) -> CGRect {
        screen(containing: r).map { toAX($0.frame) } ?? .zero
    }

    static func visibleFrame(containing r: CGRect) -> CGRect {
        screen(containing: r).map { toAX($0.visibleFrame) } ?? .zero
    }
}
