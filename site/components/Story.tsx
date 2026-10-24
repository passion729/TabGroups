"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Content } from "@/lib/content";
import { AppGlyph, Lights, TitleText, WindowBody, type AppId } from "./Windows";

// The scroll story: a laptop whose desktop acts out the three moves while the section scrolls by.
// The whole scene is a pure function of scroll progress, so scrolling back plays it backwards.

type Pt = { x: number; y: number };
type Frame = Pt & { w: number; h: number };
type Scene = {
  frames: Record<AppId, Frame>;
  tabs: AppId[];
  active: AppId | null;
  moving: AppId | null;
  top: AppId | null; // a window just pulled out stays above the group
  drop: boolean;
  cursor: Pt | null;
  keys: string[] | null;
};

const W = 960;
const H = 624; // the MacBook Pro 14" display, 3024 × 1964, at 960 wide
const STRIP = 34;
const HOME: Record<AppId, Frame> = {
  browser: { x: 70, y: 100, w: 480, h: 330 },
  notes: { x: 640, y: 56, w: 250, h: 262 },
  mail: { x: 520, y: 352, w: 380, h: 214 },
};
const GROUP = HOME.browser;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const seg = (p: number, a: number, b: number) => ease((p - a) / (b - a));
const mix = (a: Pt, b: Pt, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const titleOf = (f: Frame) => ({ x: f.x + f.w / 2, y: f.y + 14 });
const middleOf = (f: Frame) => ({ x: f.x + f.w / 2, y: f.y + f.h / 2 });
const tabOf = (i: number, n: number) => ({ x: GROUP.x + ((i + 0.5) * GROUP.w) / n, y: GROUP.y - STRIP / 2 });
const heldAt = (home: Frame, c: Pt): Frame => ({ ...home, x: c.x - home.w / 2, y: c.y - 14 });

// Step boundaries in scroll progress; the copy column uses the same numbers.
const STEPS = [0, 0.49, 0.72, 1];

function scene(p: number): Scene {
  const s: Scene = { frames: { ...HOME }, tabs: [], active: null, moving: null, top: null, drop: false, cursor: null, keys: null };
  const middle = middleOf(GROUP);

  // 1. Packing list goes onto the browser, waits for the highlight, joins.
  if (p < 0.27) {
    const c = mix(titleOf(HOME.notes), middle, seg(p, 0.06, 0.2));
    if (p > 0.03) s.cursor = c;
    if (p > 0.06) {
      s.moving = "notes";
      s.frames.notes = heldAt(HOME.notes, c);
    }
    s.drop = p > 0.23;
    return s;
  }
  s.tabs = ["browser", "notes"];
  s.active = "notes";
  s.frames.notes = GROUP;

  // ...then Booking confirmed joins too.
  if (p < 0.47) {
    const c =
      p < 0.31 ? mix(middle, titleOf(HOME.mail), seg(p, 0.27, 0.31)) : mix(titleOf(HOME.mail), middle, seg(p, 0.31, 0.41));
    s.cursor = c;
    if (p > 0.31) {
      s.moving = "mail";
      s.frames.mail = heldAt(HOME.mail, c);
    }
    s.drop = p > 0.44;
    return s;
  }
  s.tabs = ["browser", "notes", "mail"];
  s.active = "mail";
  s.frames.mail = GROUP;

  // 2. Click the first tab, then ⌥2 and ⌥3.
  if (p < 0.72) {
    s.cursor = p < 0.5 ? null : mix(middle, tabOf(0, 3), seg(p, 0.5, 0.54));
    if (p > 0.54) s.active = "browser";
    if (p > 0.58) {
      s.active = "notes";
      s.keys = ["⌥", "2"];
    }
    if (p > 0.64) {
      s.active = "mail";
      s.keys = ["⌥", "3"];
    }
    if (p > 0.7) s.keys = null;
    return s;
  }

  // 3. Pull Booking confirmed back out.
  const from = tabOf(2, 3);
  const to = { x: from.x + 80, y: from.y + 250 };
  const c = p < 0.78 ? mix(tabOf(0, 3), from, seg(p, 0.72, 0.78)) : mix(from, to, seg(p, 0.78, 0.9));
  s.cursor = p < 0.95 ? c : null;
  if (c.y > GROUP.y + 24) {
    s.tabs = ["browser", "notes"];
    s.active = "notes";
    s.frames.mail = heldAt(HOME.mail, c);
    s.moving = p < 0.9 ? "mail" : null;
    s.top = "mail";
  }
  return s;
}

export default function Story({ c, app }: { c: Content["story"]; app: Content["demo"] }) {
  const ref = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [scale, setScale] = useState(0.8);

  // Fit the stage to the screen before the first client paint.
  useLayoutEffect(() => setScale(screenRef.current!.getBoundingClientRect().width / W), []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = ref.current!.getBoundingClientRect();
      setP(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))));
    };
    const onScroll = () => (frame ||= requestAnimationFrame(update));
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(screenRef.current!);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const s = scene(p);
  const step = STEPS.findIndex((end, i) => i > 0 && p < end) - 1;
  const current = step < 0 ? STEPS.length - 2 : step;
  const z = (a: AppId) =>
    s.moving === a || s.top === a ? 40 : s.tabs.includes(a) ? (s.active === a ? 21 : 20) : (["browser", "mail", "notes"] as AppId[]).indexOf(a) + 1;

  return (
    <section className="story" id="how" ref={ref} aria-label={c.steps.map((x) => x.title).join(" ")}>
      <div className="story-sticky">
        <ol className="steps">
          {c.steps.map((st, i) => {
            const a = STEPS[i];
            const b = STEPS[i + 1];
            const local = Math.min(1, Math.max(0, (p - a) / (b - a)));
            return (
              <li key={st.title} data-state={i === current ? "on" : i < current ? "done" : "next"}>
                <span className="step-no">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{st.title}</h3>
                  <div className="step-lines">
                    <i className="step-bar" style={{ transform: `scaleY(${i === current ? local : i < current ? 1 : 0})` }} />
                    {st.lines.map((line, k) => (
                      <p key={line} data-lit={i < current || (i === current && local >= k / st.lines.length) || undefined}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="laptop" aria-hidden>
          <div className="screen" ref={screenRef}>
              <div className="stage story-stage" style={{ width: W, height: H, transform: `scale(${scale})` }}>
                <div className="mac-bar">
                  <svg className="apple-menu" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                  <b>TabGroups</b>
                  {c.menu.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                  <span className="mac-clock">{c.clock}</span>
                </div>
                {(["browser", "notes", "mail"] as AppId[]).map((a) => {
                  const f = s.frames[a];
                  return (
                    <div
                      key={a}
                      className="win"
                      data-moving={s.moving === a || undefined}
                      style={{ left: f.x, top: f.y, width: f.w, height: f.h, zIndex: z(a) }}
                    >
                      <div className="titlebar">
                        <Lights />
                        <TitleText app={a} c={app} />
                      </div>
                      <WindowBody app={a} c={app} />
                    </div>
                  );
                })}
                {s.tabs.length > 1 && (
                  <div className="strip" style={{ left: GROUP.x, top: GROUP.y - STRIP, width: GROUP.w, zIndex: 25 }}>
                    {s.tabs.map((a, k) => (
                      <span key={a} className="tab" aria-selected={a === s.active}>
                        <AppGlyph app={a} />
                        <span>{app[a].title}</span>
                        <kbd>⌥{k + 1}</kbd>
                      </span>
                    ))}
                  </div>
                )}
                {s.drop && (
                  <div
                    className="drop"
                    style={{
                      left: GROUP.x - 5,
                      top: GROUP.y - (s.tabs.length > 1 ? STRIP : 0) - 5,
                      width: GROUP.w + 10,
                      height: GROUP.h + (s.tabs.length > 1 ? STRIP : 0) + 10,
                      zIndex: 30,
                    }}
                  />
                )}
                {s.keys && (
                  <div className="key-hud">
                    {s.keys.map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </div>
                )}
                {s.cursor && (
                  <svg className="cursor" viewBox="0 0 22 32" style={{ left: s.cursor.x - 3, top: s.cursor.y - 2 }}>
                    <path d="M2 2v24l6-6 4 10 4-2-4-10h8Z" />
                  </svg>
                )}
              </div>
          </div>
          {/* Apple's MacBook Pro (M5) 14" Space Black product bezel, from Apple Design Resources. */}
          <img className="bezel" src="/macbook-pro.webp" alt="" width={1930} height={1270} />
        </div>
      </div>
    </section>
  );
}
