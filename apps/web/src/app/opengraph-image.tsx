import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";
import { pluralize } from "@/lib/utils";
import { BASES, STYLES } from "@/registry/config";

const HEADLINE = "One registry for every shadcn project.";
const TAGLINE = `${pluralize(BASES.length, "base")} · ${pluralize(STYLES.length, "style")} · RTL`;

export const alt = `${siteConfig.name}: ${HEADLINE} ${TAGLINE.replaceAll(" ·", ",")}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori needs TTF, which Google Fonts serves when asked without a browser's
// user agent. `text` limits the file to the glyphs the image uses.
async function loadFont(family: string, weight: number, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
  ).then((response) => response.text());
  const url = css.match(
    /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/,
  )?.[1];
  if (!url) throw new Error(`Couldn't load the ${family} font`);
  return fetch(url).then((response) => response.arrayBuffer());
}

export default async function Image() {
  const [sans, mono] = await Promise.all([
    loadFont("Geist", 600, `${siteConfig.name}${HEADLINE}`),
    loadFont("Geist+Mono", 400, TAGLINE),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 80,
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#e5e5e5",
            color: "#171717",
          }}
        >
          {/* lucide's Blocks icon, inline since Satori can't render its component. */}
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" />
            <rect x="14" y="2" width="8" height="8" rx="1" />
          </svg>
        </div>
        <span style={{ fontSize: 28, letterSpacing: "-0.02em" }}>
          {siteConfig.name}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            maxWidth: 820,
            fontSize: 80,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
          }}
        >
          {HEADLINE}
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid #262626",
            background: "#171717",
            fontFamily: "Geist Mono",
            fontSize: 22,
          }}
        >
          {TAGLINE}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: sans, weight: 600 },
        { name: "Geist Mono", data: mono, weight: 400 },
      ],
    },
  );
}
