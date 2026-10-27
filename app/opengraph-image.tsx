import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/features/landing/site";

export const alt = `${SITE_NAME}: learn Arabic with daily lessons and a voice tutor`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#fafafa",
        background:
          "radial-gradient(circle at 85% 10%, #1f6f5c 0%, #0b0b0c 55%), #0b0b0c",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fafafa",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 34, fontWeight: 600 }}>{SITE_NAME}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Learn Arabic a little every day.
        </div>
        <div style={{ fontSize: 34, color: "#a1a1aa", maxWidth: 860 }}>
          {SITE_TAGLINE}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {[
          "Daily lessons",
          "Picture quizzes",
          "Voice tutor",
          "Spaced review",
        ].map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid #3f3f46",
              fontSize: 26,
              color: "#d4d4d8",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
