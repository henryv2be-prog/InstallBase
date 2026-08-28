import { ImageResponse } from "next/og";

export function renderAppIcon(size: number, maskable = false) {
  const inset = maskable ? Math.round(size * 0.18) : Math.round(size * 0.1);
  const inner = size - inset * 2;
  const radius = Math.round(inner * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: maskable ? "#050810" : "transparent",
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: radius,
            background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: Math.round(inner * 0.36),
            fontWeight: 800,
            letterSpacing: "-0.06em",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          IB
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
