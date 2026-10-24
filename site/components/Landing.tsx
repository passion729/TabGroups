import { EMAIL, fill, type Content } from "@/lib/content";
import { latestRelease } from "@/lib/release";
import Desktop from "./Desktop";
import { Illustration, type IllustrationKind } from "./Illustrations";
import Story from "./Story";

const GITHUB = "https://github.com/passion729/TabGroups";
const TRELLIS = "https://trelliswm.app";
const CARD_ART: IllustrationKind[] = ["group", "switch", "tear", "grab", "follow", "restore", "sort", "keys"];

/** A headline line; the part between asterisks gets the brand gradient. */
function Line({ text }: { text: string }) {
  return (
    <span className="line">
      {text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
    </span>
  );
}

/** Two-tone section heading: the claim, then the quieter half. */
function Heading({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <h2 id={id} className="two-tone">
      <span>{title}</span> <span className="quiet">{subtitle}</span>
    </h2>
  );
}

export default function Landing({ c }: { c: Content }) {
  const release = latestRelease();
  const home = c.nav.otherHref === "/" ? "/zh/" : "/";

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href={home}>
            <img src="/icon.png" alt="" width={22} height={22} />
            TabGroups
          </a>
          <nav aria-label="TabGroups">
            <a href="#features">{c.nav.features}</a>
            <a href="#how">{c.nav.how}</a>
            <a href="#faq">{c.nav.faq}</a>
            <a className="lang" href={c.nav.otherHref} hrefLang={c.nav.otherLang} lang={c.nav.otherLang}>
              {c.nav.other}
            </a>
          </nav>
          <a className="gh" href={GITHUB} title={c.nav.github} aria-label={c.nav.github}>
            <GitHubMark />
            <span>GitHub</span>
          </a>
          <a className="button small" href={release.url}>
            {c.nav.download}
          </a>
        </div>
      </header>

      <main>
        <section className="hero dark">
          <img className="app-icon" src="/icon.png" alt="" width={96} height={96} />
          <h1>
            {c.hero.title.map((t) => (
              <Line key={t} text={t} />
            ))}
          </h1>
          <p className="lede">{c.hero.lede}</p>
          <div className="actions">
            <Download href={release.url} label={c.hero.download} />
            <a className="text-link" href="#how">
              {c.hero.see}
              <svg viewBox="0 0 16 16" aria-hidden>
                <circle cx="8" cy="8" r="7" />
                <path d="M8 4.5v7M4.75 8.25 8 11.5l3.25-3.25" />
              </svg>
            </a>
          </div>
          <p className="meta">
            {fill(c.hero.meta, release).split("{open}")[0]}
            <a href={GITHUB}>{c.hero.open}</a>
          </p>
        </section>

        <Story c={c.story} app={c.demo} />

        <section className="features light" id="features" aria-labelledby="features-title">
          <div className="wrap">
            <Heading id="features-title" title={c.features.title} subtitle={c.features.subtitle} />
            <ul className="bento">
              {c.features.cards.map((card, i) => (
                <li key={card.title} className={i === 0 ? "wide" : undefined}>
                  <div className="art">
                    <Illustration kind={CARD_ART[i]} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hands dark" aria-labelledby="hands-title">
          <div className="wrap">
            <Heading id="hands-title" title={c.hands.title} subtitle={c.hands.subtitle} />
            <ul className="shortcuts">
              {c.hands.shortcuts.map((s) => (
                <li key={s.label}>
                  <span className="combo">
                    {s.keys.map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
            <dl className="stats">
              {c.hands.stats.map((s) => (
                <div key={s.body}>
                  <dt>
                    {s.value}
                    {s.unit && <small>{s.unit}</small>}
                  </dt>
                  <dd>{s.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="built light" aria-labelledby="built-title">
          <div className="wrap">
            <Heading id="built-title" title={c.built.title} subtitle={c.built.subtitle} />
            <dl className="points">
              {c.built.points.map((pt) => (
                <div key={pt.title}>
                  <dt>{pt.title}</dt>
                  <dd>{pt.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="try dark" aria-labelledby="try-title">
          <div className="wrap">
            <Heading id="try-title" title={c.try.title} subtitle={c.try.subtitle} />
            <div className="try-panel">
              <Desktop c={c.demo} />
            </div>
          </div>
        </section>

        <section className="faq light" id="faq" aria-labelledby="faq-title">
          <div className="wrap narrow">
            <h2 id="faq-title">{c.faq.title}</h2>
            {c.faq.items.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
            <p className="faq-more">
              {c.faq.more.split("{email}")[0]}
              <a href={`mailto:${EMAIL}`} title={EMAIL}>
                {c.faq.moreLink}
              </a>
              {c.faq.more.split("{email}")[1]}
            </p>
          </div>
        </section>

        <section className="cta dark" aria-labelledby="cta-title">
          <img className="app-icon" src="/icon.png" alt="" width={88} height={88} />
          <h2 id="cta-title">
            {c.cta.title.map((t) => (
              <Line key={t} text={t} />
            ))}
          </h2>
          <p className="lede">{c.cta.lede}</p>
          <Download href={release.url} label={c.hero.download} />
          <p className="meta">{fill(c.cta.meta, release)}</p>
        </section>
      </main>

      <footer className="footer dark">
        <div className="wrap">
          <a className="brand" href={home}>
            <img src="/icon.png" alt="" width={22} height={22} />
            TabGroups
          </a>
          <nav aria-label="TabGroups">
            <a href="#features">{c.nav.features}</a>
            <a href="#how">{c.nav.how}</a>
            <a href="#faq">{c.nav.faq}</a>
            <a href={GITHUB}>GitHub</a>
            <a href={`mailto:${EMAIL}`} title={EMAIL}>
              {c.footer.contact}
            </a>
            <a href={`${GITHUB}/blob/main/LICENSE`}>{c.footer.license}</a>
          </nav>
          <p>{c.footer.note}</p>
          <p>
            {c.footer.credit.split("{trellis}")[0]}
            <a href={TRELLIS}>TrellisWM</a>
            {c.footer.credit.split("{trellis}")[1]} {fill(c.footer.released, release)}
          </p>
        </div>
      </footer>
    </>
  );
}

/** The GitHub mark (Octicons "mark-github"). */
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function Download({ href, label }: { href: string; label: string }) {
  return (
    <a className="button" href={href}>
      <svg viewBox="0 0 16 16" aria-hidden>
        <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.25h10" />
      </svg>
      {label}
    </a>
  );
}
