import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { SITE_NAME_EN, SITE_URL } from "@/lib/site"

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const cwd = process.cwd()

async function svgDataUri(path: string, transform?: (s: string) => string) {
  let svg = await readFile(join(cwd, path), "utf-8")
  if (transform) svg = transform(svg)
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

/**
 * Shared 1200x630 social card. Uses the calligraphic wordmark (vector paths,
 * so the Arabic renders perfectly regardless of the OG text shaper) plus an
 * Almarai-rendered Arabic tagline.
 */
export async function renderOgImage() {
  const [almarai, wordmark, mark] = await Promise.all([
    readFile(join(cwd, "public/fonts/Almarai-Regular.ttf")),
    // recolor the wordmark white for the dark green background
    svgDataUri("public/ta2seel.svg", (s) => s.replace("<svg ", '<svg fill="#ffffff" ')),
    svgDataUri("app/icon.svg"),
  ])

  const host = SITE_URL.replace(/^https?:\/\//, "")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "#1c6b40",
          backgroundImage:
            "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.16), transparent 42%), linear-gradient(160deg, #3a9563 0%, #1c6b40 62%, #145232 100%)",
          fontFamily: "Almarai",
        }}
      >
        {/* decorative corner mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mark}
          width={104}
          height={104}
          alt=""
          style={{ position: "absolute", top: 56, insetInlineStart: 56 }}
        />

        {/* calligraphic wordmark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmark} width={560} height={288} alt="" style={{ marginTop: 24 }} />

        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#f4d58d",
            fontWeight: 700,
            marginTop: 8,
            letterSpacing: -0.5,
          }}
        >
          أكاديمية تأصيل للعلوم الشرعية
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#dff0e6", marginTop: 18 }}>
          {SITE_NAME_EN}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "absolute",
            bottom: 44,
            fontSize: 26,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          <span style={{ display: "flex", width: 10, height: 10, borderRadius: 10, backgroundColor: "#f4d58d" }} />
          {host}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Almarai", data: almarai, style: "normal", weight: 700 }],
    },
  )
}
