import { Lights } from "./Windows";

// Small desktop scenes for the feature cards. The first three loop; they hold their first frame
// when motion is reduced.

export type IllustrationKind = "group" | "switch" | "tear" | "grab" | "follow" | "restore" | "sort" | "keys";

const Mini = ({ cls = "", lines = 3 }: { cls?: string; lines?: number }) => (
  <div className={`mini ${cls}`}>
    <div className="mini-bar">
      <Lights />
    </div>
    {Array.from({ length: lines }, (_, i) => (
      <i key={i} style={{ width: `${82 - i * 14}%` }} />
    ))}
  </div>
);

const Pointer = () => (
  <svg className="mini-cursor" viewBox="0 0 22 32" aria-hidden>
    <path d="M2 2v24l6-6 4 10 4-2-4-10h8Z" />
  </svg>
);

export function Illustration({ kind }: { kind: IllustrationKind }) {
  return (
    <div className={`ill ill-${kind}`} aria-hidden>
      {kind === "group" && (
        <>
          <Mini cls="a" lines={4} />
          <div className="mini-strip">
            <span className="on" />
            <span />
          </div>
          <div className="mini-drop" />
          <div className="mover">
            <Mini cls="b" />
            <Pointer />
          </div>
        </>
      )}
      {kind === "switch" && (
        <>
          <div className="mini-strip shown">
            <b className="pill" />
            <span />
            <span />
            <span />
          </div>
          <div className="mini a pages">
            <div className="mini-bar">
              <Lights />
            </div>
            <div className="page p1" />
            <div className="page p2" />
            <div className="page p3" />
          </div>
          <div className="keys">
            <kbd>⌥</kbd>
            <kbd className="k1">1</kbd>
            <kbd className="k2">2</kbd>
            <kbd className="k3">3</kbd>
          </div>
        </>
      )}
      {kind === "tear" && (
        <>
          <Mini cls="a" lines={4} />
          <div className="mini-strip shown">
            <span className="on keep" />
            <span className="leaving" />
          </div>
          <div className="mover">
            <div className="chip" />
            <Mini cls="b" />
            <Pointer />
          </div>
        </>
      )}
      {kind === "grab" && (
        <>
          <div className="grabbed">
            <Mini cls="a" lines={4} />
            <Pointer />
          </div>
          <div className="keys">
            <kbd className="lit">⌘</kbd>
          </div>
        </>
      )}
      {kind === "follow" && (
        <>
          <div className="half" />
          <div className="mini-strip shown tiled">
            <span className="on" />
            <span />
          </div>
          <Mini cls="tiled" lines={5} />
        </>
      )}
      {kind === "restore" && (
        <>
          <div className="mini-strip shown">
            <span className="on" />
            <span />
            <span />
          </div>
          <Mini cls="a" lines={4} />
          <svg className="badge" viewBox="0 0 24 24">
            <path d="M5 12a7 7 0 1 0 2.05-4.95M5 4.5v3.2h3.2" />
          </svg>
        </>
      )}
      {kind === "sort" && (
        <>
          <div className="mini-strip shown labelled">
            <span>A</span>
            <span className="on hover">
              <em>×</em>B
            </span>
            <span>C</span>
          </div>
          <Mini cls="a" lines={4} />
          <Pointer />
        </>
      )}
      {kind === "keys" && (
        <div className="keyset">
          {["⌘", "⌥", "⌃", "fn"].map((k, i) => (
            <kbd key={k} className={i === 0 ? "lit" : undefined}>
              {k}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
}
