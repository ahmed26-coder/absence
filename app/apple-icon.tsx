import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Rasterize the SVG brand mark into the PNG Apple requires for home-screen icons.
export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"), "utf-8")
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={180} height={180} alt="" />
      </div>
    ),
    { ...size },
  )
}
