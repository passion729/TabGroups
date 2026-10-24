import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Release = { version: string; url: string; size: string; date: string };

/** The newest release, read from the Sparkle appcast at build time so the page never lags a release. */
export function latestRelease(): Release {
  const xml = readFileSync(join(process.cwd(), "..", "appcast.xml"), "utf8");
  const item = xml.split("<item>")[1] ?? "";
  const pick = (re: RegExp) => {
    const value = item.match(re)?.[1];
    if (!value) throw new Error(`appcast.xml: no ${re} in the first <item>`);
    return value;
  };
  return {
    version: pick(/<sparkle:shortVersionString>([^<]+)</),
    url: pick(/<enclosure url="([^"]+)"/),
    size: `${(Number(pick(/length="(\d+)"/)) / 1e6).toFixed(1)} MB`,
    date: new Date(pick(/<pubDate>([^<]+)</)).toISOString().slice(0, 10),
  };
}
