import AppKit
import Sparkle

/// Sparkle: checks `SUFeedURL` (appcast.xml in the repo) once a day, then
/// downloads and installs updates by itself. Each release is signed with the
/// EdDSA key kept in the login keychain; see release.sh.
@MainActor
final class Updates: NSObject, SPUStandardUserDriverDelegate {
    static let shared = Updates()

    static var current: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0"
    }

    private var controller: SPUStandardUpdaterController?

    /// Only as an app bundle: a `swift run` binary has no Info.plist (no
    /// feed URL, no key) and Sparkle would complain at once.
    func start() {
        guard LoginItem.isAvailable, controller == nil else { return }
        controller = SPUStandardUpdaterController(startingUpdater: true, updaterDelegate: nil,
                                                  userDriverDelegate: self)
    }

    /// Daily checks; off leaves only "Check for Updates…". Both switches
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

    func check() {
        NSApp.activate(ignoringOtherApps: true)
        controller?.checkForUpdates(nil)
    }

    /// A background app: Sparkle may show its scheduled update alerts
    /// without nagging the user in front of whatever they're doing.
    nonisolated var supportsGentleScheduledUpdateReminders: Bool { true }
}
