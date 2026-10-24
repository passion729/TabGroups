import type { Content } from "@/lib/content";

export type AppId = "browser" | "notes" | "mail";

/** The traffic lights every window carries. */
export function Lights() {
  return (
    <span className="lights" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

/** Small line icons for the three pretend apps, one stroke weight. */
export function AppGlyph({ app }: { app: AppId }) {
  return (
    <svg className="glyph" viewBox="0 0 16 16" aria-hidden>
      {app === "browser" && (
        <>
          <circle cx="8" cy="8" r="6.25" />
          <path d="M10.6 5.4 9.1 9.1 5.4 10.6 6.9 6.9Z" />
        </>
      )}
      {app === "notes" && (
        <>
          <rect x="3" y="1.75" width="10" height="12.5" rx="2" />
          <path d="M5.75 5.5h4.5M5.75 8h4.5M5.75 10.5h2.5" />
        </>
      )}
      {app === "mail" && (
        <>
          <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="2" />
          <path d="m2.5 4.5 5.5 4.25 5.5-4.25" />
        </>
      )}
    </svg>
  );
}

/** What the title bar shows: the browser has an address field, the others a title. */
export function TitleText({ app, c }: { app: AppId; c: Content["demo"] }) {
  if (app === "browser")
    return (
      <span className="address">
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="4" y="7" width="8" height="6" rx="1.5" />
          <path d="M5.75 7V5.5a2.25 2.25 0 0 1 4.5 0V7" />
        </svg>
        {c.browser.url}
      </span>
    );
  return <span className="title">{c[app].title}</span>;
}

export function WindowBody({ app, c }: { app: AppId; c: Content["demo"] }) {
  if (app === "browser")
    return (
      <div className="body browser">
        <Lisbon />
        <h3>{c.browser.heading}</h3>
        <p>{c.browser.text}</p>
        <div className="skeleton" aria-hidden>
          <i style={{ width: "92%" }} />
          <i style={{ width: "78%" }} />
          <i style={{ width: "64%" }} />
        </div>
      </div>
    );
  if (app === "notes")
    return (
      <div className="body notes">
        <h3>{c.notes.title}</h3>
        <ul>
          {c.notes.items.map((item, i) => (
            <li key={item} data-done={c.notes.done[i] || undefined}>
              <span className="check" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="body mail">
      <div className="from">
        <span className="avatar" aria-hidden>
          AA
        </span>
        <div>
          <b>{c.mail.from}</b>
          <span>{c.mail.subject}</span>
        </div>
      </div>
      <p className="flight">{c.mail.body}</p>
      <p>{c.mail.text}</p>
    </div>
  );
}

/** The browser's page photo, drawn: hills of Lisbon, a yellow tram, the river. */
function Lisbon() {
  return (
    <svg className="photo" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lisbon-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb8ff" />
          <stop offset="1" stopColor="#ffe0b5" />
        </linearGradient>
      </defs>
      <rect width="400" height="140" fill="url(#lisbon-sky)" />
      <circle cx="322" cy="36" r="15" fill="#fff3d1" />
      <path d="M0 88 Q70 52 140 70 T270 60 T400 74 V140 H0Z" fill="#e7a97e" />
      <g>
        <rect x="18" y="72" width="30" height="40" fill="#f4dcbc" />
        <rect x="48" y="62" width="26" height="50" fill="#d9705a" />
        <rect x="74" y="76" width="34" height="36" fill="#f7efe2" />
        <rect x="108" y="66" width="24" height="46" fill="#7aa8c9" />
        <rect x="236" y="62" width="28" height="50" fill="#f2c46d" />
        <rect x="264" y="70" width="34" height="42" fill="#f7efe2" />
        <rect x="298" y="58" width="26" height="54" fill="#d9705a" />
        <rect x="324" y="72" width="36" height="40" fill="#9cc4a4" />
        <rect x="360" y="66" width="40" height="46" fill="#f4dcbc" />
      </g>
      <g fill="#ffffffaa">
        <rect x="26" y="80" width="6" height="8" />
        <rect x="56" y="72" width="6" height="8" />
        <rect x="84" y="84" width="6" height="8" />
        <rect x="244" y="72" width="6" height="8" />
        <rect x="274" y="80" width="6" height="8" />
        <rect x="306" y="68" width="6" height="8" />
        <rect x="334" y="80" width="6" height="8" />
        <rect x="370" y="76" width="6" height="8" />
      </g>
      <rect y="112" width="400" height="6" fill="#8d7562" />
      <g transform="translate(150 86)">
        <path d="M30 0 L30 -14" stroke="#4a3b30" strokeWidth="1.5" />
        <rect width="66" height="26" rx="5" fill="#ffc531" />
        <rect y="19" width="66" height="7" rx="2" fill="#e09a12" />
        <rect x="6" y="5" width="10" height="10" rx="1.5" fill="#fff6dc" />
        <rect x="20" y="5" width="10" height="10" rx="1.5" fill="#fff6dc" />
        <rect x="34" y="5" width="10" height="10" rx="1.5" fill="#fff6dc" />
        <rect x="50" y="5" width="10" height="14" rx="1.5" fill="#fff6dc" />
      </g>
      <rect y="118" width="400" height="22" fill="#4f93cf" />
      <path d="M20 128h40M120 132h56M250 127h44M330 133h40" stroke="#ffffff88" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
