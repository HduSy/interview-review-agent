import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * 32×32 favicon — coral 圆角方块底 + cream 对话气泡 + ink 对勾。
 *
 * 替代原"暗底火花"设计。新语义：
 *  - coral 方块 = 品牌主色温度，小尺寸下识别度高于暗底
 *  - 气泡 + 对勾 = 对话即界面 + 复盘通过
 *
 * 圆角 28%（连续圆角风），匹配应用图标节奏。
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#cc785c",
          borderRadius: "28%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
          <path
            d="M18 18 a4 4 0 0 1 4-4 h20 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-12 l-7 6 v-6 h-1 a4 4 0 0 1 -4-4 z"
            fill="#faf9f5"
          />
          <path
            d="M25 26 l4 4 l8 -9"
            fill="none"
            stroke="#141413"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
