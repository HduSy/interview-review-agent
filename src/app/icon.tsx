import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * 32×32 favicon — 暗炭灰底 + 奶油色火花 + 珊瑚核心点。
 * 珊瑚点是品牌的"双色火花"语汇，所有尺寸都保留。
 * 圆角 28%（连续圆角风），匹配应用图标节奏。
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#181715",
          borderRadius: "28%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 3 Q39.5 24.5 61 32 Q39.5 39.5 32 61 Q24.5 39.5 3 32 Q24.5 24.5 32 3 Z"
            fill="#faf9f5"
          />
          <circle cx="32" cy="32" r="5.2" fill="#cc785c" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
