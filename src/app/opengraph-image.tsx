import { ImageResponse } from "next/og";

export const alt = "Ilya Moskovkin — Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(163,230,53,0.12), transparent 60%), #161719",
          color: "#f5f5f7",
          padding: "72px 80px",
          fontFamily: "Geist, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(163,230,53,0.07) 1px, transparent 1.5px)",
            backgroundSize: "22px 22px",
            opacity: 0.6,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 16,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "Geist Mono, ui-monospace, monospace",
          }}
        >
          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.45)" }} />
          <span>IM · portfolio</span>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 140,
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
              color: "#fafafa",
              marginBottom: 32,
            }}
          >
            Ilya Moskovkin
          </div>

          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.75)",
              maxWidth: 920,
              fontFamily: "Geist Mono, ui-monospace, monospace",
            }}
          >
            Senior frontend engineer with fullstack chops and UI/UX roots.
            Building products, not pages.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 56,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "Geist Mono, ui-monospace, monospace",
            fontSize: 18,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span>vietnam → remote · 8+ yrs</span>
          <span style={{ color: "#a3e635" }}>● open to roles</span>
        </div>
      </div>
    ),
    size,
  );
}
