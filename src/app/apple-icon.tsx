import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * 180×180 apple-touch-icon — iOS / iPadOS 加桌面、Android 安装时使用。
 * coral 圆角方块底 + cream 对话气泡 + ink 对勾。
 * 圆角 22%（iOS 会自己再叠系统圆角遮罩，但 22% 起填充内部留白更稳）。
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#cc785c",
          borderRadius: "22%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 64 64" fill="none">
          <path
            d="M18 18 a4 4 0 0 1 4-4 h20 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-12 l-7 6 v-6 h-1 a4 4 0 0 1 -4-4 z"
            fill="#faf9f5"
          />
          <path
            d="M25 26 l4 4 l8 -9"
            fill="none"
            stroke="#141413"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
