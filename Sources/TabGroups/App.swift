import AppKit
import ApplicationServices
import ServiceManagement

/// Launch at login, through the system's login items. Only an app bundle can
/// register; a bare `swift run` binary can't.
@MainActor
enum LoginItem {
    static var isAvailable: Bool { Bundle.main.bundleURL.pathExtension == "app" }
    static var isEnabled: Bool { isAvailable && SMAppService.mainApp.status == .enabled }

    static func toggle() {
        do {
            if isEnabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            NSLog("Launch at login: %@", error.localizedDescription)
        }
        // The user may have to allow it in System Settings ▸ General ▸ Login Items.
        if SMAppService.mainApp.status == .requiresApproval { SMAppService.openSystemSettingsLoginItems() }
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let tracker = WindowTracker()
    private lazy var groups = GroupManager(tracker: tracker)
    private lazy var drags = DragController(tracker: tracker, groups: groups)
    private var permissionTimer: Timer?
    private var signalSources: [DispatchSourceSignal] = []
    private var started = false
    private let settings = SettingsWindow()
    private var launchedAtLogin = false

    func applicationWillFinishLaunching(_ notification: Notification) {
        // Started as a login item: stay out of sight.
        let event = NSAppleEventManager.shared().currentAppleEvent
        launchedAtLogin = event?.eventID == kAEOpenApplication
            && event?.paramDescriptor(forKeyword: keyAEPropData)?.enumCodeValue == keyAELaunchedAsLogInItem
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        handleSignals()
        setUpMenu()
        Updates.shared.start()
        if !launchedAtLogin { settings.show() }

        let prompt = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        if AXIsProcessTrustedWithOptions(prompt) {
            start()
        } else {
            // Wait for the user to tick us in System Settings ▸ Privacy ▸ Accessibility.
            permissionTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
                MainActor.assumeIsolated {
                    guard AXIsProcessTrusted() else { return }
                    self?.permissionTimer?.invalidate()
                    self?.start()
                }
            }
        }
    }

    /// Opened again from Finder, Spotlight or the Dock (or its update badge).
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if Updates.shared.pending { Updates.shared.check() } else { settings.show() }
        return false
    }

    func applicationWillTerminate(_ notification: Notification) {
        // Never leave windows parked in a corner; bring the groups back next time.
        groups.save()
        groups.ungroupAll()
    }

    private func start() {
        guard !started else { return }
        started = true
        tracker.delegate = groups
        tracker.start()
        drags.start()
        groups.restore()
    }

    /// Only on screen with the Dock icon shown, but its shortcuts work either way.
    private func setUpMenu() {
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Settings…", action: #selector(showSettings), keyEquivalent: ",").target = self
        appMenu.addItem(withTitle: "Check for Updates…", action: #selector(checkForUpdates), keyEquivalent: "").target = self
        appMenu.addItem(withTitle: "Close Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Quit TabGroups", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        let root = NSMenuItem()
        root.submenu = appMenu
        NSApp.mainMenu = NSMenu()
        NSApp.mainMenu?.addItem(root)
    }

    @objc private func showSettings() { settings.show() }
    @objc private func checkForUpdates() { Updates.shared.check() }

    /// Ctrl-C from `swift run` skips applicationWillTerminate; route it through terminate.
    private func handleSignals() {
        for sig in [SIGINT, SIGTERM] {
            signal(sig, SIG_IGN)
            let source = DispatchSource.makeSignalSource(signal: sig, queue: .main)
            source.setEventHandler { MainActor.assumeIsolated { NSApp.terminate(nil) } }
            source.resume()
            signalSources.append(source)
        }
    }
}

@main
enum TabGroupsApp {
    @MainActor
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()   // run() never returns, so this stays alive
        app.delegate = delegate
        SettingsWindow.applyDockPolicy()   // no Dock icon unless asked for
        app.run()
    }
}
