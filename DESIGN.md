---
name: TabGroups
description: Tabs for any window, from any app. A black-and-paper product page whose laptop acts out the gesture.
colors:
  night: "#05060f"
  panel: "#0e1022"
  night-body: "#b4b7d3"
  night-dim: "#8f92b0"
  night-quiet: "#5f6285"
  paper: "#f4f4f7"
  card: "#ffffff"
  paper-ink: "#111114"
  paper-body: "#5f5f69"
  paper-quiet: "#8b8b95"
  accent: "#8f97ff"
  accent-hi: "#b0b5ff"
  on-accent: "#0b0d2a"
  grad-mist: "#cdd0ff"
  grad-violet: "#c48cff"
  grad-ember: "#ff9f70"
  glow: "#3b40b4"
  wall-top: "#182057"
  wall-mid: "#2b2b88"
  wall-low: "#4b2f90"
  apricot: "#ff8f55"
  sky: "#3fa9ff"
  wall-glass: "#0f144073"
  hint-dim: "#b8bcf2"
  indigo: "#5561f2"
  indigo-hi: "#7c85ff"
  ink: "#1d1d1f"
  ink-2: "#5b5c66"
  surface: "#f7f7f9"
  bar-top: "#f1f1f4"
  bar-bottom: "#e6e6eb"
  hair: "#00000017"
  strip: "#23262fee"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "clamp(54px, 9.4vw, 138px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  display-close:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "clamp(44px, 7vw, 100px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "clamp(40px, 5.4vw, 74px)"
    fontWeight: 750
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  stat:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "clamp(56px, 6.4vw, 96px)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "\"tnum\" 1"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  lede:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\" 1"
  chrome:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", system-ui, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
rounded:
  control: "6px"
  mini: "7px"
  keycap: "8px"
  strip: "9px"
  window: "11px"
  art: "14px"
  hint: "16px"
  tile: "18px"
  card: "24px"
  panel: "28px"
  pill: "999px"
spacing:
  strip-gap: "3px"
  strip-band: "34px"
  grid-tight: "16px"
  grid: "20px"
  grid-wide: "36px"
  gutter: "40px"
  head-gap: "64px"
  section: "136px"
  close: "160px"
components:
  nav:
    backgroundColor: "#05060f80"
    textColor: "#ffffffb3"
    typography: "{typography.label}"
    height: "56px"
    padding: "0 40px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hi}"
    textColor: "{colors.on-accent}"
  button-small:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "32px"
  text-link:
    textColor: "{colors.accent-hi}"
  bento-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.card}"
    padding: "24px 26px 30px"
  shortcut-tile:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.night-body}"
    rounded: "{rounded.tile}"
    padding: "22px 24px"
  keycap:
    backgroundColor: "#272a3e"
    textColor: "#ffffff"
    rounded: "{rounded.keycap}"
    padding: "0 11px"
    height: "34px"
  try-panel:
    rounded: "{rounded.panel}"
    padding: "44px 40px 32px"
  window:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.window}"
  titlebar:
    backgroundColor: "{colors.bar-top}"
    textColor: "#3c3d45"
    typography: "{typography.chrome}"
    height: "30px"
  tab-strip:
    backgroundColor: "{colors.strip}"
    rounded: "{rounded.strip}"
    padding: "3px"
    height: "30px"
  tab:
    textColor: "#ffffffa3"
    rounded: "{rounded.control}"
    padding: "0 30px 0 10px"
  tab-selected:
    backgroundColor: "#ffffff29"
    textColor: "#ffffff"
  mac-bar:
    backgroundColor: "{colors.wall-glass}"
    textColor: "#ffffff"
    height: "24px"
    padding: "0 14px"
  hint-bar:
    backgroundColor: "#0f144066"
    textColor: "#ffffff"
    rounded: "{rounded.hint}"
    padding: "10px 10px 10px 18px"
---

# Design System: TabGroups

## Overview

**Creative North Star: "The Desk Under Glass"**

The page is a product page in black and paper; the Mac desktop is the exhibit inside it. Full-width bands alternate between Night and Paper, with no third background. The desktop world (indigo wallpaper with an apricot horizon, light macOS windows, the app's dark tab strip with ⌥N hints) appears only inside frames: the laptop screen in the scroll story, the art at the top of each bento card, and the try-it panel. The page around those frames is quiet: heavy system type, one periwinkle accent, and a single gradient phrase in the two biggest headlines.

Structure and presentation follow trelliswm.app because the user pinned it as the reference. The order is a centred black hero, a sticky scroll story, a light feature bento, a black shortcuts-and-numbers band, light "built" points, a black try-it panel, a light FAQ, and a black closing call. The gradient headline word and the card bento are this surface's choices, adopted from that reference. They are not rules for other TabGroups surfaces.

The motion carries the product's gesture. In the story, scroll progress drives the desktop frame by frame, so scrolling back plays it in reverse. In the bento, three art loops replay group, switch and pull out. In the try-it panel the desktop is real and can be dragged. Every motion has a still, readable frame when reduced motion is on.

**Key Characteristics:**
- Two bands, Night and Paper, strictly alternating from the features section down.
- The desktop lives inside frames: laptop screen, bento art, try panel.
- One page accent (periwinkle) for actions, live progress and numbers; indigo stays inside the desktop.
- One system family, set heavy (750–800) and tight (-0.04em) for headlines.
- The app's own strip, windows and drop highlight are reproduced faithfully at real macOS sizes.

## Colors

A black-and-paper page with one periwinkle accent. Inside its frames is a night-blue desktop lit by an apricot horizon.

### Primary
- **Periwinkle** (accent): the page's one accent. It fills the Download pill (full size and the nav's small one), marks the live step's number and progress bar in the story, sets the unit after each stat, and draws the focus ring on Night.
- **Lit Periwinkle** (accent-hi): the hover fill of the pill, the "See how it works" text link, and the big stat numbers.
- **Periwinkle Ink** (on-accent): text on the periwinkle pill.

### Secondary
- **Headline Gradient** (grad-mist → accent → grad-violet → grad-ember, 92°): clipped to the text of one marked phrase in the hero headline and one in the closing headline. Nothing else carries it.
- **Stage Glow** (glow): a soft radial pool behind the hero and the closing call. The closing call also takes a faint ember pool from below. It is atmosphere and never sits behind body text alone.

### Tertiary (desktop world, inside frames only)
- **Night Wall / Deep Ultramarine / Violet Dusk** (wall-top, wall-mid, wall-low): the wallpaper's 168° base. The laptop screen and the try panel layer apricot, sky and violet glows on it. The bento art uses a 160° variant with a single apricot glow.
- **Apricot Horizon / Morning Sky** (apricot, sky): light in the wallpaper. Never text, never a control.
- **Signal Indigo / Lit Indigo** (indigo, indigo-hi): selection and highlight inside the desktop: the drop highlight (a Lit Indigo border with a 17% fill of itself), pressed keycaps in the art, the restore badge, the mail avatar, `::selection`, and focus on Paper (the FAQ).
- **Wall Glass** (wall-glass): the laptop's menu bar. The hint bar under the try desktop uses the same hue at 40%, with its secondary text in Hint Periwinkle (hint-dim).
- **Window Ink / Window Grey / Window Paper / Bar Light / Bar Shade / Hairline** (ink, ink-2, surface, bar-top, bar-bottom, hair): macOS window bodies, text and the title-bar gradient. Notes windows warm the paper to #fffdf6.
- **Strip Graphite** (strip): the app's tab strip, 93% opaque over a 20px blur. In the bento art it is solid #23262f.

### Neutral
- **Night** (night): the body, the hero, story, hands, try, closing call and footer. The nav is Night at 50% under a frosted blur.
- **Raised Night** (panel): shortcut tiles, the only raised surface on Night.
- **Night Body / Night Dim / Night Quiet** (night-body, night-dim, night-quiet): ledes, stat and shortcut captions in Body; meta lines in Dim; the quieter half of two-tone headings in Quiet. Nav links sit at 70% white, footer links at 65%.
- **Paper / Card** (paper, card): the light bands, and the white bento cards on them.
- **Paper Ink / Paper Body / Paper Quiet** (paper-ink, paper-body, paper-quiet): headings, body copy, and the quieter half of two-tone headings on Paper. Dividers on Paper are black at 10–12%; on Night they are white at 7%.

### Named Rules
**The Two Bands Rule.** A section is Night or Paper, nothing else. Raised Night is the only tonal step, and the wallpaper is never a band.

**The Desktop Inside Rule.** The wallpaper, light windows, the strip and indigo appear only inside a frame: the laptop screen, the art at the top of a bento card, or the try panel. The page never imitates a desktop around them.

**The One Accent Rule.** Periwinkle is the page's only accent. Indigo belongs to the desktop, and apricot and sky are light in the wallpaper, never ink.

## Typography

**Display Font:** the system stack, SF Pro Display on a Mac (then Segoe UI, system-ui, and PingFang SC / Hiragino Sans GB / Microsoft YaHei for Chinese)
**Body Font:** the same stack with SF Pro Text first
**Label/Mono Font:** none; keycaps and ⌥N hints use the body face, with tabular numerals where digits line up

**Character:** one family, as on the desktop it presents. Headlines get their voice from weight (750–800) and tight tracking (-0.04em) at very large sizes. Copy stays at a calm 16–21px.

The system face as the display voice was accepted for this site as an adaptation to the macOS world. It is recorded because the build uses it, not adopted as a rule: a future surface should choose its display face on its own merits.

### Hierarchy
- **Display** (800, clamp(54px, 9.4vw, 138px), 0.98): the two-line hero headline only.
- **Display Close** (800, clamp(44px, 7vw, 100px), 1.02): the two-line closing call.
- **Headline** (750, clamp(40px, 5.4vw, 74px), 1.03, max 16em): two-tone section headings. The FAQ heading is a one-tone variant at clamp(40px, 5vw, 64px).
- **Stat** (750, clamp(56px, 6.4vw, 96px), 1, tabular): the four numbers in the hands section, with the unit at 0.4em.
- **Title** (700, 22px, 1.2): bento card titles. Story step titles are 22px / 650 / 1.25, built points 19px / 700, FAQ questions 21px / 650 (18px under 640px).
- **Lede** (400, 21px, 1.5, max 34em): the hero and closing ledes, in Night Body; 18px under 640px.
- **Body** (400, 16px, 1.55): card bodies, built points, stat and shortcut captions, story lines (1.5). FAQ answers take 17px / 1.6, max 44em.
- **Label** (400, 14px, 1.5, tabular): meta/version lines and nav links. Footer notes are 13px / 1.6.
- **Chrome** (600, 12–12.5px): window titles, the mac menu bar (500), and tab labels. The ⌥N hints are 11px / 500.

### Named Rules
**The One Gradient Phrase Rule.** In this surface, a big headline (hero, closing call) may mark one phrase, written `*like this*` in content, for the Headline Gradient. Section headings never take it; they use two tones. This came from the pinned reference and is not a house rule.

**The Two-Tone Rule.** A section heading states the claim in full ink, followed by a quieter half in Paper Quiet or Night Quiet. It is one heading element, not a heading plus a subtitle.

**The Real Chrome Rule.** Anything that imitates macOS chrome inside a frame (title bars, tabs, menu bar, address field) uses macOS sizes: 11–13px, weight 500–600, no negative tracking. Miniatures shrink with their scale and never grow.

**The CJK Tracking Rule.** Under `:lang(zh)`, h1–h3 drop to -0.01em and set `word-break: keep-all; overflow-wrap: anywhere`, so they break at punctuation rather than mid-phrase.

## Layout

The content column is 1180px with 40px gutters (860px for the FAQ). The story is wider (1320px). Bands are 136px tall top and bottom (96px under 640px). The hero is 112px above and 136px below, and the closing call 160px each way (112px under 640px). A section heading sits 64px above its grid.

- **Nav:** sticky, 56px. Brand on the left; Features, How it works, FAQ, GitHub and the language toggle 26px apart on the right, then the small Download pill. Under 640px only the language toggle and the pill stay.
- **Hero:** centred column: a 96px icon, the two-line headline 28px below, the lede 32px below, the actions row (pill + text link, 18×30px gaps) 40px below, and the meta line.
- **Story:** a 420vh section (380vh at ≤900px) with a sticky grid pinned under the nav, filling the viewport: a 260–340px column of numbered steps beside a laptop up to 980px wide, 56px apart. Only the live step shows its lines, with a 2px progress bar to their left. At ≤900px the laptop moves above and only the live step shows.
- **Bento:** a 3-column grid with 20px gaps. The first card spans two columns and splits into 360px of art beside its text. 2 columns at ≤1060px (the wide card stacks), 1 column at ≤640px.
- **Hands:** 3 columns of shortcut tiles (16px gaps), then 4 stats 96px below (36px gaps). 2 columns at ≤1060px, and the tiles go to 1 column at ≤640px.
- **Built:** 4 points across (36px gaps), each topped by a hairline with 20px above its text. 2 columns at ≤1060px, 1 at ≤640px.
- **Try:** the heading, then the panel 56px below, holding the live desktop centred (720×520 laid out, 420×540 on narrow screens). The desktop is laid out at fixed pixel size and scaled with a transform, never reflowed.
- **FAQ:** a single narrow column of disclosures.

## Elevation & Depth

The page is flat; depth belongs to the objects. On Night, depth comes from glow (radial pools behind the hero and closing call, an indigo blur under the laptop) and from the one raised tone (Raised Night with a white 8% inset ring). On Paper, cards are flat white held by a hairline ring. Inside the frames, the desktop keeps its own depth: windows float on a layered, night-tinted shadow and chrome is frosted glass.

### Shadow Vocabulary
- **Window** (`box-shadow: 0 0 0 0.5px #0000004d, 0 24px 56px #0a0e3a80, 0 4px 14px #0a0e3a40`): every window in the laptop and the try desktop.
- **Miniature window** (`box-shadow: 0 0 0 0.5px #00000040, 0 10px 24px #0a0e3a66`): the windows in the bento art.
- **Strip** (`box-shadow: 0 0 0 0.5px #ffffff26, 0 -4px 18px #0a0e3a40`): the tab strip, cast upward onto the wallpaper.
- **Laptop** (Apple's product bezel image carries its own render; the page adds only a 40px-blurred indigo pool beneath).
- **Card ring** (`box-shadow: 0 0 0 1px #0000000d, 0 1px 2px #0000000a`): bento cards on Paper.
- **Night ring** (`box-shadow: inset 0 0 0 1px #ffffff14` to `#ffffff1a`): shortcut tiles and the try panel.
- **Keycap** (dark `inset 0 1px 0 #ffffff1f, 0 2px 0 #00000080`; light `0 2px 0 #9fa1ad, 0 3px 6px #0a0e3a40`): a key's own bottom edge. Pressed keys sink 1px and swap the edge for a 2px Lit Indigo ring.
- **Icon glow** (`filter: drop-shadow(0 18px 40px #5561f266)`): the app icon in the hero and closing call.

### Named Rules
**The Flat Paper Rule.** On Paper nothing lifts: cards are white on a hairline ring, and points are separated by a top rule. Lifted shadows belong to windows and the laptop.

**The Night Shadow Rule.** Inside the desktop, every soft shadow is tinted #0a0e3a so windows belong to the wallpaper. Pure black appears only in hairline outlines and on the laptop, which sits on the page rather than in the desktop.

## Shapes

Corners nest from small to large. Controls inside chrome are 6px, miniature windows 7px, keycaps 8px (13px for the story's HUD keys, 12px for the big ones in the keys art), the strip 9px, windows 11px, bento art 14px, the hint bar 16px, shortcut tiles 18px, bento cards 24px, the try panel 28px (20px on phones), and buttons and the language toggle are full pills. Traffic lights and avatars are circles. The drop highlight is the target's outline grown by 5px, with a 15px radius and a 3px Lit Indigo border. Borders are hairlines (0.5–1px), and the bento art bleeds to the card's edge, clipped by the card's top corners (or left corners on the wide card).

## Components

### Buttons
Rounded, solid, and only two kinds.
- **Shape:** full pill, 52px tall with 28px side padding (48px / 24px under 640px), 17px / 650 label, an 18px line icon (1.8 stroke).
- **Primary:** Periwinkle fill, Periwinkle Ink text. This is Download, in the hero, the closing call and (small: 32px, 14px label) the nav.
- **Hover / Focus:** fills to Lit Periwinkle and lifts 1px over 0.25s on the shared ease, then presses 0.5px. Focus is a 2px Periwinkle outline 3px out (Signal Indigo on Paper).
- **Text link:** Lit Periwinkle 17px / 600 with a circled-arrow icon, going white on hover. It is the hero's secondary action.

### Cards / Containers
- **Bento card:** white on Paper, 24px corners, the Card ring, 24×26px padding (30px at the bottom). The art strip runs full bleed across the top: the wallpaper with a 360×240 miniature desktop centred in it. Below it are a 22px / 700 title and a 16px Paper Body line. The first card is wide.
- **Shortcut tile:** Raised Night, 18px corners, 22×24px padding, a keycap combo above a 16px Night Body label.
- **Try panel:** the wallpaper at 28px corners with a white 10% inset ring and 44×40px padding, holding the live desktop and its hint bar.

### Chips (keycaps)
- **Dark keycap:** 34px tall (min 34px wide, 11px padding), 8px corners, a #272a3e → #1b1e2e gradient, 15px / 600 white legend, and the dark Keycap edge. Grouped with 6px gaps.
- **Light keycap (desktop art):** a #fdfdfc → #ececea gradient with Window Ink legend. When pressed it turns #eef0ff with a 2px Lit Indigo ring.

### Navigation
- **Nav bar:** sticky, 56px, Night at 50% with a 30px blur and saturate 1.8 (frosted glass: what scrolls under it shows through as colour) and a white 8% bottom line. The brand is a 22px icon plus the 17px / 700 name. Links are 14px at 70% white, going white over 0.15s. The language toggle is a pill with a white 18% inset ring. A GitHub pill (mark + "GitHub", same ring, icon only under 640px) sits between the links and the Download pill; the hero meta line links "Free and open source" to the repo.
- **Footer:** Night, a white 7% top line, the brand, the same anchors at 65% white, then 13px notes in Night Dim tones. The notes carry the Accessibility note, the TrellisWM credit and the release line.

### Story Laptop (signature)
Apple's MacBook Pro (M5) 14" Space Black product bezel (`public/macbook-pro.webp`, from Apple Design Resources under its license, unaltered apart from size) sits on top; the screen beneath it is a 960×624 desktop (the 3024×1964 display, notch included) placed in the bezel's display opening at (10.829%, 11.339%, 78.342% × 77.323%) and scaled to fit before first paint. Inside are a 24px Wall Glass menu bar, three light windows, the strip, the drop highlight, the cursor, and a centred HUD of 56px keycaps for ⌥2 / ⌥3. Scroll progress (0 to 1) is the only input: steps 01–03 cover 0–0.49, 0.49–0.72 and 0.72–1. The step number turns Periwinkle and the 2px bar fills as the step plays. The laptop is `aria-hidden`, and the section label carries the step titles.

### The Tab Strip
The app's own UI, reproduced faithfully.
- **Strip:** Strip Graphite over a 20px blur, 9px corners, 3px padding and gap, 30px tall, in the 34px band directly above its window and exactly as wide.
- **Tab:** equal width, 6px corners, 12px / 600 at 64% white, a 14px line glyph (1.4 stroke) and the ellipsised title. The ⌥N hint sits 9px from the right at 11px / 500, 40% white, tabular. On touch screens the hints in the story hide.
- **States:** hover is white at 7%. Selected is white at 16% with a 0.5px white 20% inset ring and full-white text, changing over 0.15s.

### Drop Highlight
When the pointer holds still over the middle of a window, the window's outline grown by 5px lights up: a 3px Lit Indigo border and a 17% fill, 15px corners, scaling in from 0.98 over 0.2s. It also covers the strip when the target is already a group. The miniature version in the art is 2px and 10px.

### Bento Art
360×240 desktops, 14px corners, on a 160° wallpaper with an apricot glow. The windows are 7px-radius minis with a 16px title bar, 6px traffic lights and skeleton lines. There are eight scenes: group, switch and pull out loop over 6s; grab nudges over 4s; follow, restore, sort and keys are still. Under 640px the art zooms to 0.86. Under reduced motion the loops hold a readable first frame.

### FAQ
Native `details` / `summary` disclosures in the narrow column: 21px / 650 questions with 26px vertical padding, a black 10% bottom rule, and a drawn 14px plus that turns 45° to a cross over 0.3s. Answers are 17px / 1.6 Paper Body.

### Hint Bar
The caption under the try desktop: a 16px-rounded glass bar (Wall Glass hue at 40%, 16px blur, white 12% inset ring). The 14px / 1.45 text has its secondary half in Hint Periwinkle, and 34px pill actions sit on the right (white 12%, 20% on hover). It is a polite live region.

### Motion
One easing for everything that travels: cubic-bezier(0.16, 1, 0.3, 1). Windows and strips glide over 0.5s, buttons settle over 0.25s, tabs and links change over 0.15s, story steps fade over 0.4s and their lines light over 0.3s. Dragging switches transitions off so the window tracks the pointer. Reduced motion removes smooth scroll, transitions and loops, and leaves every illustration on a still frame.

## Do's and Don'ts

### Do:
- **Do** alternate Night and Paper bands; use Raised Night only for tiles on Night.
- **Do** keep the desktop (wallpaper, windows, strip, indigo) inside a frame: the laptop screen, the bento art, the try panel.
- **Do** keep the strip attached to its window: the 34px band above it, the same width, ⌥N hints on the right.
- **Do** set big headings in the system face at 750–800 with -0.04em tracking, and split section headings into a full-ink claim and a quieter half.
- **Do** use Periwinkle for the page's actions, live progress and numbers, and Signal Indigo for focus on Paper.
- **Do** tint soft shadows inside the desktop with #0a0e3a.
- **Do** give every looping, gliding or scroll-driven motion a still, readable reduced-motion state.

### Don't:
- **Don't** paint a band in the wallpaper or a third background tone.
- **Don't** put the Headline Gradient on more than one phrase per headline, or on section headings, body copy or controls.
- **Don't** use indigo, apricot or sky on the page outside the frames.
- **Don't** lift cards on Paper with a drop shadow; use the Card ring.
- **Don't** use the strip's graphite for anything but the strip.
- **Don't** set window chrome larger than 13px or track it negatively.
