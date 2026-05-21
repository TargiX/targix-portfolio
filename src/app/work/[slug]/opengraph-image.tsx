import { ImageResponse } from "next/og";
import { getCase } from "@/lib/content";

export const alt = "Case study — Ilya Moskovkin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const c = await getCase(params.slug);

  const title = c?.title ?? "Case study";
  const blurb = c?.blurb ?? "";
  const role = c?.role ?? "";
  const year = c?.year ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(163,230,53,0.10), transparent 60%), #161719",
          color: "#f5f5f7",
          padding: "72px 80px",
          fontFamily: "Geist, sans-serif",
          position: "relative",
        }}
      >
        {/* subtle dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(163,230,53,0.06) 1px, transparent 1.5px)",
            backgroundSize: "22px 22px",
            opacity: 0.5,
          }}
        />

        {/* top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 16,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "Geist Mono, ui-monospace, monospace",
          }}
        >
          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.4)" }} />
          <span>IM · portfolio · case</span>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          {/* role · year */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "Geist Mono, ui-monospace, monospace",
              marginBottom: 22,
            }}
          >
            <span>{role}</span>
            {year && (
              <>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.3)" }} />
                <span>{year}</span>
              </>
            )}
          </div>

          {/* title */}
          <div
            style={{
              fontSize: 116,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              color: "#fafafa",
              marginBottom: 28,
            }}
          >
            {title}
          </div>

          {/* blurb */}
          {blurb && (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 900,
                fontFamily: "Geist Mono, ui-monospace, monospace",
              }}
            >
              {blurb.length > 180 ? blurb.slice(0, 180) + "…" : blurb}
            </div>
          )}
        </div>

        {/* footer band */}
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
          <span>ilya moskovkin · senior frontend</span>
          <span style={{ color: "#a3e635" }}>● live</span>
        </div>
      </div>
    ),
    size,
  );
}
