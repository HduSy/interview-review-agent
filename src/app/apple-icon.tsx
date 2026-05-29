import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * 180×180 apple-touch-icon — iOS / iPadOS 加桌面、Android 安装时使用。
 * 按设计稿 96px App 规格：暗炭灰底 + 奶油色火花 + 珊瑚核心点。
 * 圆角统一 22%（iOS 会自己再叠系统圆角遮罩，但 22% 起填充内部留白更稳）。
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#181715",
          borderRadius: "22%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 3 Q39.5 24.5 61 32 Q39.5 39.5 32 61 Q24.5 39.5 3 32 Q24.5 24.5 32 3 Z"
            fill="#faf9f5"
          />
          <circle cx="32" cy="32" r="4.4" fill="#cc785c" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
