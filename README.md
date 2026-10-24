# TabGroups

Cross-app window tabs for macOS, as a small native Swift app. Drop one window onto the middle of another, pause for a moment, and the two stack under a single strip of tabs, whichever apps they belong to. Inspired by the Tab groups feature of [TrellisWM](https://trelliswm.app).

[简体中文](README.zh-CN.md)

## What it does

- **Group:** drag a window by its title bar onto the middle of another window (or onto a group's strip) and hold still for about 0.35 s. A highlight appears; let go and they become tabs. Dropping a grouped window brings its whole group along.
- **Switch:** click a tab. Only the shown tab sits in the group's frame; the others are parked in a screen corner.
- **Reorder:** drag a tab along the strip.
- **Tear off:** drag a tab more than 24 px off the strip. It becomes its own window again, at the size it had before it joined.
- **Close:** hover a tab and click ✕.
- **Context menu:** right-click a tab for *Remove from Group* or *Ungroup All*.
- **Settings window:** opening TabGroups (or opening it again while it runs) shows a small Liquid Glass window with *Launch at login*, *Show in Dock* and *Quit TabGroups*. *Launch at login* registers the app as a login item, so it needs `TabGroups.app`; a launch at login stays out of sight.
- The strip follows its window live while you move or resize it, makes room for itself when macOS tiles the window to a screen edge, and is hidden in Mission Control.

## Requirements

- macOS 14 or later, Swift 5.9 or later (Xcode 15+ or the command-line tools).
- Accessibility permission. The app moves other apps' windows through the Accessibility API, which doesn't work in a sandbox, so it can't ship on the Mac App Store.

## Build and run

```bash
# A: run from the terminal (the Accessibility grant goes to your terminal app)
swift run

# B: build an app bundle (the grant goes to TabGroups.app)
./make-app.sh && open build/TabGroups.app
```

On first launch macOS asks for Accessibility access: tick TabGroups (or your terminal) in **System Settings ▸ Privacy & Security ▸ Accessibility**. The app checks every second and starts as soon as it's allowed; no restart needed. `make-app.sh` signs ad hoc, so the grant may need re-ticking after each rebuild. It compiles the Liquid Glass app icon (`Support/AppIcon.icon`, an Icon Composer file) with `actool`, which comes with Xcode; with only the command-line tools the app gets a generic icon.

## Quitting

By default TabGroups has no Dock icon and no menu-bar item. Open it again to bring up its window and click **Quit TabGroups** (or press ⌘Q there); Ctrl-C in its terminal and `pkill -INT TabGroups` work too. Every group is dissolved first and parked windows are put back on screen. Avoid *Force Quit*: it leaves parked windows in the corner (bring them back with the app's *Window ▸ Zoom* or Mission Control).

## How it works

| File | Role |
|---|---|
| `AX.swift` | Accessibility helpers, the private `_AXUIElementGetWindow` (AX element → `CGWindowID`), conversion between AX (top-left) and AppKit (bottom-left) coordinates |
| `WindowTracker.swift` | One `AXObserver` per app; a table of standard windows; hit-testing in real z-order via `CGWindowListCopyWindowInfo` |
| `DragController.swift` | Global mouse monitors; detects title-bar drags from the WindowServer's frame, the middle-of-window drop zone and the hold; the drop highlight |
| `GroupManager.swift` | The group model: join, switch, park, tear off, follow moves/resizes and edge tiling, ungroup |
| `TabStrip.swift` | The strip: a non-activating panel ordered just above the shown window; drawing, clicks, reorder, tear-off chip, context menu, upward shadow |
| `App.swift` | Entry point, permission prompt, SIGINT/SIGTERM → orderly quit |

"Parking" moves a window so that a single pixel stays on screen, in a corner with no neighbouring display. Unlike minimising or hiding, it has no animation, leaves the app's other windows alone, and the window stays live.

## Website

The landing page lives in `site/` (Next.js, static export): `cd site && pnpm install && pnpm build` writes `site/out/`, which any static host can serve. It reads the latest version from `appcast.xml`, so rebuild it after each release.

## Known limitations

- Parked windows still show up in Mission Control, and on leaving it you can see them fly back to the corner.
- Switching tabs sometimes darkens the window shadow for a frame or two: the app applies the two window moves in different frames.
- Finder won't go fully off screen, so a parked Finder window leaves about 20 px visible.
- Minimising the shown tab takes it out of its group.
- Groups aren't saved; they're gone after a restart.
- Windows with native tabs, full-screen windows and sheets get no special handling.
- Dragging a window out of an edge tile can't drop it onto another group (its size changes during that drag).

## License

[MIT](LICENSE). Not covered: `site/public/macbook-pro.webp` is Apple's MacBook Pro product bezel, used under the Apple Design Resources license; it may not be redistributed on its own.
