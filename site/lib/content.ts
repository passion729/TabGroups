// Every string on the page, in both languages. `{v}`-style placeholders are filled in by the page;
// `*word*` in a headline marks the part drawn in the brand gradient.

const en = {
  lang: "en",
  meta: {
    title: "TabGroups: tabs for every window on your Mac",
    description:
      "A free, open-source Mac app. Hold ⌘ and drop one window onto another: they stack under one strip of tabs, whatever app they come from.",
  },
  nav: {
    features: "Features",
    how: "How it works",
    faq: "FAQ",
    github: "Source on GitHub",
    download: "Download",
    other: "中文",
    otherHref: "/zh/",
    otherLang: "zh-CN",
  },
  hero: {
    title: ["Tabs for", "*every* window."],
    lede: "Hold ⌘ and drop one window onto another. They stack under one strip of tabs, whatever app they come from. Click to switch, drag out to split.",
    download: "Download for Mac",
    see: "See how it works",
    meta: "Version {version} for Apple silicon · macOS 14 or later · {open}",
    open: "Free and open source",
  },
  story: {
    steps: [
      {
        title: "Drop one on another, and they stack.",
        lines: ["Hold ⌘ and drag a window onto the middle of another.", "Pause until it lights up, then let go. Any app works."],
      },
      {
        title: "Click a tab. Or keep your hands on the keys.",
        lines: ["Click a tab to bring its window forward.", "Or press ⌥1 to ⌥8. ⌥9 is always the last one."],
      },
      {
        title: "Drag it out, and it’s a window again.",
        lines: ["Pull a tab off the strip.", "It goes back to the size it had before."],
      },
    ],
    menu: ["Finder", "File", "Edit", "View", "Window"],
    clock: "Fri 9:41",
  },
  features: {
    title: "Everything for one task, in one place.",
    subtitle: "Whichever app it lives in.",
    cards: [
      { title: "Any app, one strip.", body: "Browser, notes, terminal, chat: windows from different apps share one strip of tabs." },
      { title: "⌥ and a number.", body: "⌥1 to ⌥8 jump to that tab, ⌥9 to the last. Each tab shows its number." },
      { title: "Pull it back out.", body: "Drag a tab off the strip and it’s a window again, at its old size." },
      { title: "Grab anywhere.", body: "Hold ⌘ and drag a window by any spot, not just its title bar." },
      { title: "The strip follows.", body: "Move it, resize it, tile it to a screen edge. The tabs stay on top." },
      { title: "Back where you left it.", body: "Groups are saved when you quit and put back together next time." },
      { title: "Sort and close.", body: "Drag tabs along the strip to reorder. Hover one and click × to close its window." },
      { title: "Your keys.", body: "Drag with ⌘, ⌥, ⌃ or fn. Switch with ⌥, ⌃, ⌘ or ⌃⌥." },
    ],
  },
  hands: {
    title: "Made for your hands.",
    subtitle: "Quick on the keys. Easy on the mouse.",
    shortcuts: [
      { keys: ["⌘", "drag"], label: "Move a window by any spot" },
      { keys: ["⌘", "drop", "pause"], label: "Stack it with another" },
      { keys: ["⌥", "1…8"], label: "Show that tab" },
      { keys: ["⌥", "9"], label: "Show the last tab" },
      { keys: ["drag a tab out"], label: "Make it a window again" },
      { keys: ["right-click a tab"], label: "Remove it, or ungroup all" },
    ],
    stats: [
      { value: "0.35", unit: "s", body: "The pause that groups. Long enough to be sure, short enough not to wait." },
      { value: "9", unit: "", body: "Tabs one keystroke away, from ⌥1 to ⌥9." },
      { value: "1", unit: "", body: "Permission: Accessibility. That’s all it asks for." },
      { value: "0", unit: "", body: "Windows lost. Quit, and every window goes back on the desktop." },
    ],
  },
  built: {
    title: "Native. Quiet. Open.",
    subtitle: "Respectful of your Mac.",
    points: [
      { title: "Written in Swift.", body: "A native Mac app on AppKit and the Accessibility API. Small and fast, with no web view inside." },
      { title: "Out of sight.", body: "No menu-bar icon, and no Dock icon unless you want one. Open it again for its one settings window." },
      { title: "One permission.", body: "Accessibility, to move other apps’ windows. It records nothing. Its only trip online is a daily update check." },
      { title: "Free and open source.", body: "Every line is on GitHub. New versions download and install by themselves." },
    ],
  },
  try: {
    title: "Try it right here.",
    subtitle: "No install needed.",
  },
  demo: {
    label: "A pretend desktop you can try TabGroups on",
    start: "Drag Packing list onto the middle of the browser and hold still.",
    startNote: "On your Mac, hold ⌘ while you drag.",
    hold: "Hold still…",
    release: "Now let go.",
    grouped: "Grouped. Click a tab, or press {keys}.",
    more: "Drop Booking confirmed in too, or drag a tab off the strip to pull it back out.",
    torn: "A window of its own again, at its old size. Drop it back in whenever you like.",
    watch: "Watch it",
    reset: "Start over",
    tabHint: "Show {title}",
    browser: {
      title: "3 days in Lisbon",
      url: "lisbon-guide.example",
      heading: "3 days in Lisbon",
      text: "Trams, tiled façades and custard tarts. Start in Alfama, end at the river.",
    },
    notes: {
      title: "Packing list",
      items: ["Passport", "Phone charger", "Sunscreen", "Camera", "Plug adapter"],
      done: [true, true, false, false, false],
    },
    mail: {
      title: "Booking confirmed",
      from: "Atlantic Air",
      subject: "Your booking is confirmed",
      body: "Fri 6 Nov · 08:40 → 11:15",
      text: "Seat 14A. Check-in opens 24 hours before departure.",
    },
  },
  faq: {
    title: "Questions",
    more: "Something else? Write to {email}.",
    moreLink: "me",
    items: [
      {
        q: "Safari and Finder already have tabs. Why this?",
        a: "Their tabs only hold their own windows. TabGroups stacks windows from any app under one strip: a web page, your notes and a terminal, side by side. Windows that have their own tabs keep them.",
      },
      {
        q: "Isn’t that what ⌘Tab and Mission Control are for?",
        a: "⌘Tab switches between apps, and Mission Control spreads out every window at once. Neither keeps the windows of one task together. A group does, one click or one ⌥ number apart.",
      },
      { q: "Which Macs does it run on?", a: "Macs with Apple silicon, on macOS 14 Sonoma or later." },
      {
        q: "Which apps does it work with?",
        a: "The standard windows of ordinary apps. Full-screen windows, sheets and windows with their own tabs get no special handling yet, and tabs stacked behind a see-through window can show through it.",
      },
      {
        q: "Why does it need Accessibility access?",
        a: "Moving and raising other apps’ windows goes through the Accessibility API. It’s also why TabGroups can’t be on the Mac App Store.",
      },
      {
        q: "What happens when I quit?",
        a: "Every group comes apart and every window goes back on the desktop. Your groups are saved, and they’re put back together the next time TabGroups starts.",
      },
      { q: "Is it really free?", a: "Yes. It’s open source on GitHub, with no account, no trial and no paid tier." },
    ],
  },
  cta: {
    title: ["Stop hunting for windows.", "*Give them tabs.*"],
    lede: "Free, open source, and ready for your Mac.",
    meta: "Version {version} · {size} · Apple silicon · macOS 14 or later · No account",
  },
  footer: {
    note: "TabGroups requires a Mac with Apple silicon and macOS 14 Sonoma or later. The desktop on this page is a browser simulation.",
    credit: "Inspired by Tab groups in {trellis}.",
    contact: "Contact",
    released: "Version {version}, released {date}.",
  },
};

export type Content = typeof en;

const zh: Content = {
  lang: "zh-CN",
  meta: {
    title: "TabGroups：给 Mac 上的每个窗口加上标签",
    description: "免费开源的 Mac 小工具。按住 ⌘ 把一个窗口拖到另一个上面，它们就会叠成一组、共用一排标签，不管来自哪个 app。",
  },
  nav: {
    features: "功能",
    how: "怎么用",
    faq: "常见问题",
    github: "在 GitHub 查看源码",
    download: "下载",
    other: "English",
    otherHref: "/",
    otherLang: "en",
  },
  hero: {
    title: ["给每个窗口", "都加上*标签*。"],
    lede: "按住 ⌘，把一个窗口拖到另一个上面，它们就叠成一组，共用一排标签，不管来自哪个 app。点标签切换，拖出来就分开。",
    download: "下载 Mac 版",
    see: "看看怎么用",
    meta: "版本 {version} · Apple 芯片 · macOS 14 及以上 · {open}",
    open: "免费开源",
  },
  story: {
    steps: [
      {
        title: "拖过去，停一下，就叠成一组。",
        lines: ["按住 ⌘，把窗口拖到另一个窗口中间。", "等它亮起来再松手。哪个 app 的窗口都行。"],
      },
      {
        title: "点标签切换，手不离键盘也行。",
        lines: ["点一下标签，那个窗口就到最前面。", "也可以按 ⌥1 到 ⌥8，⌥9 永远是最后一个。"],
      },
      {
        title: "拖出来，又是一个独立窗口。",
        lines: ["把标签拖离标签栏。", "它会回到成组之前的大小。"],
      },
    ],
    menu: ["访达", "文件", "编辑", "显示", "窗口"],
    clock: "周五 9:41",
  },
  features: {
    title: "同一件事的窗口，收在同一处。",
    subtitle: "不管它属于哪个 app。",
    cards: [
      { title: "任何 app，同一排标签。", body: "浏览器、备忘录、终端、聊天，不同 app 的窗口也能共用一排标签。" },
      { title: "⌥ 加数字。", body: "⌥1 到 ⌥8 直达对应标签，⌥9 直达最后一个。每个标签上都标着数字。" },
      { title: "随时拆开。", body: "把标签拖出标签栏，它就变回独立窗口，还是原来的大小。" },
      { title: "哪里都能抓。", body: "按住 ⌘，从窗口任意位置都能拖动，不用去找标题栏。" },
      { title: "标签栏跟着走。", body: "移动、缩放，或者贴到屏幕边缘，标签栏都待在窗口上方。" },
      { title: "下次打开还在。", body: "退出时记住每个组，下次启动自动重新组好。" },
      { title: "排序和关闭。", body: "沿标签栏拖动可以调整顺序；鼠标移到标签上点 ×，就关掉那个窗口。" },
      { title: "按键随你选。", body: "拖动可以用 ⌘、⌥、⌃ 或 fn，切换可以用 ⌥、⌃、⌘ 或 ⌃⌥。" },
    ],
  },
  hands: {
    title: "键盘鼠标，都顺手。",
    subtitle: "常用操作，一下就到。",
    shortcuts: [
      { keys: ["⌘", "拖动"], label: "从任意位置移动窗口" },
      { keys: ["⌘", "拖到另一个窗口", "停一下"], label: "叠成一组" },
      { keys: ["⌥", "1…8"], label: "显示对应的标签" },
      { keys: ["⌥", "9"], label: "显示最后一个标签" },
      { keys: ["把标签拖出来"], label: "变回独立窗口" },
      { keys: ["右键点标签"], label: "移出组，或解散所有组" },
    ],
    stats: [
      { value: "0.35", unit: "秒", body: "停这么一下就成组。够你确认，又不用干等。" },
      { value: "9", unit: "", body: "个标签一键直达，从 ⌥1 到 ⌥9。" },
      { value: "1", unit: "", body: "项权限：辅助功能。除此之外什么都不要。" },
      { value: "0", unit: "", body: "个窗口会丢。退出时，所有窗口都回到桌面上。" },
    ],
  },
  built: {
    title: "原生，安静，开源。",
    subtitle: "不给你的 Mac 添乱。",
    points: [
      { title: "用 Swift 写成。", body: "原生 Mac app，基于 AppKit 和辅助功能接口。体积小，反应快，里面没有网页。" },
      { title: "平时看不见。", body: "菜单栏没有图标，Dock 里也没有（除非你想要）。再打开一次 app，就能看到它唯一的设置窗口。" },
      { title: "只要一项权限。", body: "用「辅助功能」移动其他 app 的窗口。它不记录任何内容，唯一的联网是每天检查一次更新。" },
      { title: "免费，开源。", body: "每一行代码都在 GitHub 上。新版本会自己下载安装。" },
    ],
  },
  try: {
    title: "就在这里试试。",
    subtitle: "不用安装。",
  },
  demo: {
    label: "一张可以试用 TabGroups 的模拟桌面",
    start: "把「行李清单」拖到浏览器窗口中间，停住不动。",
    startNote: "在你的 Mac 上，拖动时要按住 ⌘。",
    hold: "别动，再等一下…",
    release: "松手吧。",
    grouped: "成组了。点标签，或按 {keys} 切换。",
    more: "把「预订确认」也拖进来；或者把某个标签拖出标签栏，它就变回独立窗口。",
    torn: "它又是独立窗口了，大小和原来一样。想放回去，再拖进来就行。",
    watch: "看演示",
    reset: "复原",
    tabHint: "切换到「{title}」",
    browser: {
      title: "里斯本三日游",
      url: "lisbon-guide.example",
      heading: "里斯本三日游",
      text: "坐老电车，看瓷砖墙，吃蛋挞。从阿尔法玛出发，傍晚走到河边。",
    },
    notes: {
      title: "行李清单",
      items: ["护照", "手机充电器", "防晒霜", "相机", "转换插头"],
      done: [true, true, false, false, false],
    },
    mail: {
      title: "预订确认",
      from: "Atlantic Air",
      subject: "您的机票已预订成功",
      body: "11 月 6 日 周五 · 08:40 → 11:15",
      text: "座位 14A。起飞前 24 小时开放网上值机。",
    },
  },
  faq: {
    title: "常见问题",
    more: "还有别的问题？{email}。",
    moreLink: "发邮件给我",
    items: [
      {
        q: "Safari 和访达本来就有标签，为什么还要它？",
        a: "它们的标签只能装自己的窗口。TabGroups 能把任何 app 的窗口叠到同一排标签下：网页、笔记、终端放在一起。本来就有标签的窗口，原有的标签照常保留。",
      },
      {
        q: "⌘Tab 和调度中心不就是干这个的吗？",
        a: "⌘Tab 按 app 切换，调度中心一次摊开所有窗口，但它们都不会把同一件事的窗口放在一起。一组标签可以，点一下或按一个 ⌥ 数字就到。",
      },
      { q: "支持哪些 Mac？", a: "搭载 Apple 芯片的 Mac，macOS 14 Sonoma 或更新版本。" },
      {
        q: "支持哪些 app？",
        a: "普通 app 的标准窗口都可以。全屏窗口、弹出的表单和自带标签的窗口目前还没有特别处理；叠在半透明窗口后面的标签，会从它后面透出来。",
      },
      {
        q: "为什么需要「辅助功能」权限？",
        a: "移动和前置其他 app 的窗口，要通过辅助功能接口完成。这也是 TabGroups 没法上架 Mac App Store 的原因。",
      },
      {
        q: "退出以后会怎样？",
        a: "所有组都会拆开，每个窗口都回到桌面上。你的组会被记住，下次启动 TabGroups 时自动重新组好。",
      },
      { q: "真的免费吗？", a: "真的。代码开源在 GitHub 上，不用注册账号，没有试用期，也没有付费版。" },
    ],
  },
  cta: {
    title: ["别再到处找窗口了。", "*给它们加上标签。*"],
    lede: "免费、开源，现在就能装到你的 Mac 上。",
    meta: "版本 {version} · {size} · Apple 芯片 · macOS 14 及以上 · 无需账号",
  },
  footer: {
    note: "TabGroups 需要搭载 Apple 芯片、运行 macOS 14 Sonoma 或更新版本的 Mac。本页的桌面是在浏览器里模拟的。",
    credit: "灵感来自 {trellis} 的 Tab groups。",
    contact: "联系我",
    released: "版本 {version}，{date} 发布。",
  },
};

export const content = { en, zh };

export const EMAIL = "oscarpassion36@gmail.com";

export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
