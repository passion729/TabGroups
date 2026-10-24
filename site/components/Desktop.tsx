"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fill, type Content } from "@/lib/content";
import { AppGlyph, Lights, TitleText, WindowBody, type AppId } from "./Windows";

// A pretend desktop that groups windows the way the app does: drag one onto the middle of
// another (inset 25%), hold still (4 px, 0.35 s) until the highlight shows, let go.

type Point = { x: number; y: number };
type Frame = { x: number; y: number; w: number; h: number };
type Group = Frame & { id: string; tabs: AppId[]; active: AppId };
type Drag = { kind: "group" | "tab"; gid: string; tab?: AppId; dx: number; dy: number };

const STRIP = 34; // the strip sits in this band above a group's windows
const TEAR = 24; // drag a tab this far off the strip to pull it out
const DWELL = 350;
const STILL = 4;

// The desktop, and a narrower, taller one for phones so its text stays readable once scaled down.
type Layout = { w: number; h: number; size: Record<AppId, Frame> };
const WIDE: Layout = {
  w: 720,
  h: 520,
  size: {
    browser: { x: 24, y: 64, w: 440, h: 300 },
    mail: { x: 352, y: 300, w: 340, h: 196 },
    notes: { x: 470, y: 26, w: 226, h: 240 },
  },
};
const NARROW: Layout = {
  w: 420,
  h: 540,
  size: {
    browser: { x: 12, y: 40, w: 396, h: 262 },
    mail: { x: 12, y: 336, w: 272, h: 192 },
    notes: { x: 206, y: 250, w: 202, h: 232 },
  },
};
const start = (l: Layout): Group[] =>
  (["browser", "mail", "notes"] as AppId[]).map((id) => ({ id, tabs: [id], active: id, ...l.size[id] }));

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const raise = (gs: Group[], gid: string) => [...gs.filter((g) => g.id !== gid), ...gs.filter((g) => g.id === gid)];

/** The group to join when the pointer is at `p`: its middle zone or its strip, if nothing covers it. */
function targetAt(gs: Group[], p: Point, exclude: string): string | null {
  for (let i = gs.length - 1; i >= 0; i--) {
    const g = gs[i];
    if (g.id === exclude) continue;
    const top = g.tabs.length > 1 ? g.y - STRIP : g.y;
    const inside = p.x > g.x && p.x < g.x + g.w && p.y > top && p.y < g.y + g.h;
    if (!inside) continue;
    const middle = p.x > g.x + g.w / 4 && p.x < g.x + (g.w * 3) / 4 && p.y > g.y + g.h / 4 && p.y < g.y + (g.h * 3) / 4;
    return middle || p.y < g.y ? g.id : null;
  }
  return null;
}

export default function Desktop({ c }: { c: Content["demo"] }) {
  const [lay, setLay] = useState(WIDE);
  const [groups, setGroups] = useState(() => start(WIDE));
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [lit, setLit] = useState<string | null>(null);
  const [last, setLast] = useState<"start" | "grouped" | "torn">("start");
  const [cursor, setCursor] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false); // measured: until then the stage stays hidden, transitions off

  const layRef = useRef(lay);
  layRef.current = lay;
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const litRef = useRef(lit);
  litRef.current = lit;
  const drag = useRef<Drag | null>(null);
  const still = useRef<Point>({ x: 0, y: 0 });
  const timer = useRef(0);
  const nextId = useRef(0);
  const demo = useRef(0); // bumped to cancel a running demo
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useRef(false);

  // --- The gesture, shared by the real pointer and the demo ---

  function down(el: HTMLElement | null, p: Point) {
    const handle = el?.closest<HTMLElement>("[data-handle]");
    const tab = el?.closest<HTMLElement>("[data-tab]");
    const gid = (tab ?? handle)?.dataset.gid;
    const g = groupsRef.current.find((x) => x.id === gid);
    if (!g) return false;
    if (tab) {
      const app = tab.dataset.tab as AppId;
      setGroups((gs) => raise(gs.map((x) => (x.id === g.id ? { ...x, active: app } : x)), g.id));
      drag.current = { kind: "tab", gid: g.id, tab: app, dx: 0, dy: 0 };
    } else {
      setGroups((gs) => raise(gs, g.id));
      drag.current = { kind: "group", gid: g.id, dx: p.x - g.x, dy: p.y - g.y };
      setDragging(g.id);
    }
    still.current = p;
    return true;
  }

  function move(p: Point) {
    const d = drag.current;
    if (!d) return;
    if (d.kind === "group") {
      setGroups((gs) =>
        gs.map((g) =>
          g.id === d.gid
            ? {
                ...g,
                x: clamp(p.x - d.dx, 100 - g.w, layRef.current.w - 100),
                y: clamp(p.y - d.dy, g.tabs.length > 1 ? STRIP : 0, layRef.current.h - 40),
              }
            : g,
        ),
      );
      const target = targetAt(groupsRef.current, p, d.gid);
      setOver(target);
      if (Math.hypot(p.x - still.current.x, p.y - still.current.y) > STILL) {
        still.current = p;
        window.clearTimeout(timer.current);
        if (litRef.current) setLit(null);
        timer.current = window.setTimeout(() => setLit(targetAt(groupsRef.current, still.current, d.gid)), DWELL);
      }
      return;
    }
    // A tab: reorder along the strip, or pull it out once it's far enough off.
    const g = groupsRef.current.find((x) => x.id === d.gid);
    if (!g || !d.tab) return;
    const off = p.y < g.y - STRIP - TEAR || p.y > g.y + TEAR || p.x < g.x - TEAR || p.x > g.x + g.w + TEAR;
    if (off) {
      const app = d.tab;
      const id = `torn-${nextId.current++}`;
      const { w, h, size: sizes } = layRef.current;
      const size = sizes[app];
      const dx = Math.min(size.w / 2, 90);
      const frame = { ...size, x: clamp(p.x - dx, 100 - size.w, w - 100), y: clamp(p.y - 14, 0, h - 40) };
      drag.current = { kind: "group", gid: id, dx, dy: 14 };
      still.current = p;
      setDragging(id);
      setLast("torn");
      setGroups((gs) => [
        ...gs.flatMap((x) => {
          if (x.id !== g.id) return [x];
          const tabs = x.tabs.filter((t) => t !== app);
          const at = x.tabs.indexOf(app);
          return [{ ...x, tabs, active: x.active === app ? tabs[Math.max(0, at - 1)] : x.active }];
        }),
        { id, tabs: [app], active: app, ...frame },
      ]);
      return;
    }
    const n = g.tabs.length;
    const at = clamp(Math.floor(((p.x - g.x) / g.w) * n), 0, n - 1);
    if (g.tabs.indexOf(d.tab) !== at) {
      const app = d.tab;
      setGroups((gs) =>
        gs.map((x) => {
          if (x.id !== g.id) return x;
          const tabs = x.tabs.filter((t) => t !== app);
          tabs.splice(at, 0, app);
          return { ...x, tabs };
        }),
      );
    }
  }

  function up() {
    window.clearTimeout(timer.current);
    const d = drag.current;
    const target = litRef.current;
    drag.current = null;
    setDragging(null);
    setOver(null);
    setLit(null);
    if (d?.kind !== "group" || !target) return;
    setLast("grouped");
    setGroups((gs) => {
      const src = gs.find((g) => g.id === d.gid);
      const dst = gs.find((g) => g.id === target);
      if (!src || !dst) return gs;
      const joined = { ...dst, y: Math.max(dst.y, STRIP), tabs: [...dst.tabs, ...src.tabs], active: src.active };
      return [...gs.filter((g) => g !== src && g !== dst), joined];
    });
  }

  function select(gid: string, app: AppId) {
    setGroups((gs) => raise(gs.map((g) => (g.id === gid ? { ...g, active: app } : g)), gid));
  }

  function reset() {
    demo.current++;
    drag.current = null;
    setCursor(null);
    setDragging(null);
    setLit(null);
    setOver(null);
    setLast("start");
    setGroups(start(layRef.current));
  }

  // --- Real pointer ---

  function local(e: { clientX: number; clientY: number }): Point {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    demo.current++;
    setCursor(null);
    if (down(e.target as HTMLElement, local(e))) {
      stageRef.current!.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }

  // --- The scripted demo: the same gesture with a pretend pointer ---

  async function play() {
    reset();
    const run = demo.current;
    let at: Point = { x: layRef.current.w - 40, y: layRef.current.h - 30 };
    const alive = () => demo.current === run;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glide = (to: Point, ms: number) =>
      new Promise<void>((resolve) => {
        const from = at;
        const t0 = performance.now();
        const step = (now: number) => {
          if (!alive()) return resolve();
          const t = reduced ? 1 : Math.min(1, (now - t0) / ms);
          const e = 1 - Math.pow(1 - t, 3);
          at = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
          setCursor(at);
          move(at);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    const find = (app: AppId) => groupsRef.current.find((g) => g.tabs.includes(app))!;
    const titleOf = (app: AppId) => {
      const g = find(app);
      return { x: g.x + g.w / 2, y: g.y + 14 };
    };
    const middleOf = (app: AppId) => {
      const g = find(app);
      return { x: g.x + g.w / 2, y: g.y + g.h / 2 };
    };
    const tabOf = (app: AppId) => {
      const g = find(app);
      return { x: g.x + ((g.tabs.indexOf(app) + 0.5) * g.w) / g.tabs.length, y: g.y - STRIP / 2 };
    };
    const press = (app: AppId, kind: "handle" | "tab") =>
      down(stageRef.current!.querySelector(`[data-${kind}="${kind === "tab" ? app : find(app).id}"]`), at);

    setCursor(at);
    await wait(300);
    for (const app of ["notes", "mail"] as AppId[]) {
      await glide(titleOf(app), 700);
      if (!alive()) return;
      press(app, "handle");
      await glide(middleOf("browser"), 1000);
      await wait(DWELL + 450);
      if (!alive()) return;
      up();
      await wait(900);
    }
    for (const app of ["browser", "notes"] as AppId[]) {
      await glide(tabOf(app), 600);
      if (!alive()) return;
      press(app, "tab");
      drag.current = null;
      await wait(800);
    }
    await glide(tabOf("mail"), 600);
    if (!alive()) return;
    press("mail", "tab");
    await glide({ x: at.x + 40, y: at.y + 170 }, 900);
    if (!alive()) return;
    up();
    await wait(1200);
    if (alive()) setCursor(null);
  }

  // --- Scale to fit, keyboard switching ---

  // Pick the layout and scale before the first paint, so a phone never sees the wide desktop slide into place.
  useLayoutEffect(() => {
    const width = wrapRef.current!.getBoundingClientRect().width;
    const l = width < 560 ? NARROW : WIDE;
    if (l !== WIDE) {
      layRef.current = l;
      setLay(l);
      setGroups(start(l));
    }
    setScale(Math.min(1, width / l.w));
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => setReady(true))));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const l = width < 560 ? NARROW : WIDE;
      if (l !== layRef.current) {
        layRef.current = l;
        setLay(l);
        reset();
      }
      setScale(Math.min(1, width / l.w));
    });
    ro.observe(wrap);
    // ⌥N only drives this desktop while it's on screen.
    const io = new IntersectionObserver(([entry]) => (inView.current = entry.intersectionRatio > 0.5), {
      threshold: [0, 0.5, 1],
    });
    io.observe(wrap);
    // The app's switch key: ⌥1…8 picks that tab, ⌥9 the last. `code`, since ⌥ changes `key` on a Mac.
    const onKey = (e: KeyboardEvent) => {
      const digit = /^Digit([1-9])$/.exec(e.code)?.[1];
      if (!digit || !e.altKey || e.metaKey || e.ctrlKey || !inView.current) return;
      const g = [...groupsRef.current].reverse().find((x) => x.tabs.length > 1);
      if (!g) return;
      e.preventDefault();
      const n = Number(digit);
      const app = n === 9 ? g.tabs.at(-1) : g.tabs[n - 1];
      if (app) select(g.id, app);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      demo.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Render ---

  const biggest = Math.max(...groups.map((g) => g.tabs.length));
  const keys = groups
    .find((g) => g.tabs.length === biggest)!
    .tabs.map((_, i) => `⌥${i + 1}`)
    .join(" · ");
  const idle =
    last === "torn" ? c.torn : biggest > 1 ? `${fill(c.grouped, { keys })} ${biggest < 3 ? c.more : ""}` : null;
  const hint = dragging && lit ? c.release : dragging && over ? c.hold : idle;
  const target = groups.find((g) => g.id === lit);
  const initial = start(lay);
  const changed = last !== "start" || groups.some((g, i) => g.x !== initial[i]?.x || g.y !== initial[i]?.y);

  return (
    <div className="desktop">
      <div className="stage-wrap" ref={wrapRef} data-ready={ready || undefined} style={{ height: lay.h * scale }}>
        <div
          className="stage"
          ref={stageRef}
          role="group"
          aria-label={c.label}
          style={{ width: lay.w, height: lay.h, transform: `scale(${scale})` }}
          onPointerDown={onPointerDown}
          onPointerMove={(e) => drag.current && move(local(e))}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {groups.map((g, i) =>
            g.tabs.map((app) => {
              const shown = app === g.active;
              return (
                <div
                  key={app}
                  className="win"
                  data-app={app}
                  data-moving={dragging === g.id || undefined}
                  aria-hidden={!shown || undefined}
                  style={{ left: g.x, top: g.y, width: g.w, height: g.h, zIndex: i * 10 + (shown ? 5 : 1) }}
                >
                  <div className="titlebar" data-handle={g.id} data-gid={g.id}>
                    <Lights />
                    <TitleText app={app} c={c} />
                  </div>
                  <WindowBody app={app} c={c} />
                </div>
              );
            }),
          )}
          {groups.map(
            (g, i) =>
              g.tabs.length > 1 && (
                <div
                  key={g.id}
                  className="strip"
                  role="tablist"
                  data-moving={dragging === g.id || undefined}
                  style={{ left: g.x, top: g.y - STRIP, width: g.w, zIndex: i * 10 + 6 }}
                >
                  {g.tabs.map((app, k) => (
                    <button
                      key={app}
                      type="button"
                      role="tab"
                      className="tab"
                      aria-selected={app === g.active}
                      aria-label={fill(c.tabHint, { title: c[app].title })}
                      data-tab={app}
                      data-gid={g.id}
                      onClick={() => select(g.id, app)}
                    >
                      <AppGlyph app={app} />
                      <span>{c[app].title}</span>
                      <kbd>⌥{k + 1}</kbd>
                    </button>
                  ))}
                </div>
              ),
          )}
          {target && (
            <div
              className="drop"
              style={{
                left: target.x - 5,
                top: target.y - (target.tabs.length > 1 ? STRIP : 0) - 5,
                width: target.w + 10,
                height: target.h + (target.tabs.length > 1 ? STRIP : 0) + 10,
                zIndex: groups.indexOf(target) * 10 + 8,
              }}
            />
          )}
          {cursor && (
            <svg className="cursor" viewBox="0 0 22 32" style={{ left: cursor.x - 3, top: cursor.y - 2 }} aria-hidden>
              <path d="M2 2v24l6-6 4 10 4-2-4-10h8Z" />
            </svg>
          )}
        </div>
      </div>
      <div className="hint" aria-live="polite">
        <p>
          {hint ?? (
            <>
              {c.start} <span>{c.startNote}</span>
            </>
          )}
        </p>
        <div className="hint-actions">
          <button type="button" onClick={play}>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M5 3.5v9l7.5-4.5Z" />
            </svg>
            {c.watch}
          </button>
          {changed && (
            <button type="button" onClick={reset}>
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.25M4.5 2.5v2.5H7" />
              </svg>
              {c.reset}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
