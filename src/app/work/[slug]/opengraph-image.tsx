import { ImageResponse } from "next/og";
import { getCase } from "@/lib/content";

export const alt = "Case study · Ilya Moskovkin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "development"
      ? "http://localhost:3010"
      : "https://ilyamoskovkin.com");

function getCoverUrl(cover?: string) {
  if (!cover) return null;
  if (cover.startsWith("http://") || cover.startsWith("https://")) return cover;
  return new URL(cover, siteUrl).toString();
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const trimmed = value.slice(0, maxLength).trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${(lastSpace > 80 ? trimmed.slice(0, lastSpace) : trimmed).trim()}...`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCase(slug);

  const title = c?.title ?? "Case study";
  const blurb = c?.blurb ?? "";
  const role = c?.role ?? "";
  const year = c?.year ?? "";
  const coverUrl = getCoverUrl(c?.cover);
  const tags = c?.tags.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(900px 520px at 18% 0%, rgba(163,230,53,0.11), transparent 62%), radial-gradient(780px 520px at 100% 18%, rgba(146,114,255,0.12), transparent 58%), #151619",
          color: "#f5f5f7",
          padding: "58px 64px",
          fontFamily: "Geist, sans-serif",
          position: "relative",
        }}
      >
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            fontFamily: "Geist Mono, ui-monospace, monospace",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 15,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.48)",
            }}
          >
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.38)" }} />
            <span>IM · portfolio · case study</span>
          </div>
          <span style={{ color: "#a3e635", fontSize: 17 }}>ilyamoskovkin.com</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 42,
            marginTop: 48,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 470,
              padding: "10px 0 2px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 17,
                  color: "rgba(255,255,255,0.56)",
                  fontFamily: "Geist Mono, ui-monospace, monospace",
                  marginBottom: 18,
                }}
              >
                <span>{role}</span>
                {year && (
                  <>
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.28)",
                      }}
                    />
                    <span>{year}</span>
                  </>
                )}
              </div>

              <div
                style={{
                  fontSize: title.length > 24 ? 78 : 92,
                  fontWeight: 540,
                  letterSpacing: "-0.025em",
                  lineHeight: 0.95,
                  color: "#fafafa",
                  marginBottom: 24,
                }}
              >
                {title}
              </div>

              {blurb && (
                <div
                  style={{
                    fontSize: 23,
                    lineHeight: 1.35,
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Geist Mono, ui-monospace, monospace",
                  }}
                >
                  {truncateAtWord(blurb, 132)}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                fontFamily: "Geist Mono, ui-monospace, monospace",
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 999,
                    padding: "7px 11px",
                    color: "rgba(255,255,255,0.62)",
                    background: "rgba(255,255,255,0.04)",
                    fontSize: 15,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              flex: 1,
              minWidth: 0,
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(255,255,255,0.045)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.38)",
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                width={650}
                height={500}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, rgba(163,230,53,0.16), rgba(146,114,255,0.16))",
                }}
              />
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
