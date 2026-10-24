import type { Metadata, Viewport } from "next";
import type { Content } from "@/lib/content";
import { CONTRACT } from "./contract";
import "./globals.css";

// Two root layouts (/ in English, /zh/ in Chinese) so each page gets its own <html lang>.

export const metadataFor = (c: Content): Metadata => ({
  title: c.meta.title,
  description: c.meta.description,
  icons: { icon: "/icon.png", apple: "/icon.png" },
  alternates: { languages: { en: "/", "zh-CN": "/zh/" } },
  openGraph: { title: c.meta.title, description: c.meta.description, type: "website" },
});

export const viewport: Viewport = { themeColor: "#1d2457", colorScheme: "dark" };

export function Root({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
        {children}
      </body>
    </html>
  );
}
