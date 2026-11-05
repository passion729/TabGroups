import AppKit
import Sparkle

/// Sparkle: checks `SUFeedURL` (appcast.xml in the repo) every 6 hours and
/// downloads updates by itself. Each release is signed with the EdDSA key
/// kept in Infisical; see release.sh. A background app rarely quits (when
/// Sparkle would install) and its alerts go unseen, so a found update puts
/// a badged icon in the Dock; clicking it shows Sparkle's update window.
@MainActor
final class Updates: NSObject, SPUUpdaterDelegate, SPUStandardUserDriverDelegate {
    static let shared = Updates()

    static var current: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0"
    }

    private var controller: SPUStandardUpdaterController?

    /// Only as an app bundle: a `swift run` binary has no Info.plist (no
    /// feed URL, no key) and Sparkle would complain at once.
    func start() {
        guard LoginItem.isAvailable, controller == nil else { return }
        controller = SPUStandardUpdaterController(startingUpdater: true, updaterDelegate: self,
                                                  userDriverDelegate: self)
    }

    /// Checks every 6 hours (`SUScheduledCheckInterval`); off leaves only "Check for Updates…". Both switches
    /// default to on (`SUEnableAutomaticChecks`, `SUAutomaticallyUpdate` in
    /// Info.plist) and Sparkle keeps the user's choice.
    var autoCheck: Bool {
        get { controller?.updater.automaticallyChecksForUpdates ?? false }
        set { controller?.updater.automaticallyChecksForUpdates = newValue }
    }

    /// Install what a scheduled check finds; off: Sparkle asks first.
    var autoInstall: Bool {
        get { controller?.updater.automaticallyDownloadsUpdates ?? false }
        set { controller?.updater.automaticallyDownloadsUpdates = newValue }
    }

    /// An update is waiting for the user: the Dock icon stays until they look.
    private(set) var pending = false

    private func remind(_ on: Bool) {
        guard pending != on else { return }
        pending = on
        SettingsWindow.applyDockPolicy()
        NSApp.dockTile.badgeLabel = on ? "1" : nil
        if on { NSApp.requestUserAttention(.informationalRequest) }
    }

    /// Also brings up an update that's already downloaded ("Install and Relaunch").
    func check() {
        remind(false)
        NSApp.activate(ignoringOtherApps: true)
        controller?.checkForUpdates(nil)
    }

    /// A background app: Sparkle may show its scheduled update alerts
    /// without nagging the user in front of whatever they're doing.
    nonisolated var supportsGentleScheduledUpdateReminders: Bool { true }

    /// Scheduled finds always go to the Dock; the Dock click calls `check()`.
    nonisolated func standardUserDriverShouldHandleShowingScheduledUpdate(_ update: SUAppcastItem,
                                                                          andInImmediateFocus immediateFocus: Bool) -> Bool { false }

    nonisolated func standardUserDriverWillHandleShowingUpdate(_ handleShowingUpdate: Bool, forUpdate update: SUAppcastItem,
                                                               state: SPUUserUpdateState) {
        guard !handleShowingUpdate else { return }
        MainActor.assumeIsolated { remind(true) }
    }

    /// Downloaded by itself, to install on quit: tell the user it's there.
    nonisolated func updater(_ updater: SPUUpdater, willInstallUpdateOnQuit item: SUAppcastItem,
                             immediateInstallationBlock immediateInstallHandler: @escaping () -> Void) -> Bool {
        MainActor.assumeIsolated { remind(true) }
        return false
    }
}
