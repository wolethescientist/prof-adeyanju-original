import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/site";

/* The card shown when the site's address is shared on WhatsApp, LinkedIn, X
   and the like, and used by any page that has no photo of its own. */
export const alt = "Prof. Ibrahim Adepoju Adeyanju, MD/CEO, Galaxy Backbone Limited";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const portrait = await readFile(join(process.cwd(), "public", "images", "adeyanju-portrait.jpg"));
  const src = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0b1220 0%, #12306f 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "0 72px",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: "#8fb0ff", fontWeight: 600 }}>
            Professor · Engineer · MD/CEO
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
            Managing Director/CEO, Galaxy Backbone Limited
          </div>
        </div>
        <div style={{ display: "flex", width: 420, height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            width={420}
            height={630}
            style={{ width: 420, height: 630, objectFit: "cover", objectPosition: "50% 15%" }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
