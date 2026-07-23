/**
 * 品牌标志 — coral 圆角方块底 + cream 对话气泡 + ink 对勾。
 *
 * 替代原"内凹四芒星火花"系统，新语义聚焦产品定位：
 *  - coral 方块 = 品牌主色温度（warm canvas + coral 是 Anthropic 风格）
 *  - 对话气泡 = "对话即界面"的产品形态
 *  - 对勾 = 复盘通过 / 拿 offer 的结果意象
 *
 * API 保持与旧 SpikeMark 完全兼容（同名导出、同 props），所有引用处
 * （welcome / expanded-sidebar / message-list）无需改动。
 *
 * 几何约束（viewBox 64×64）：
 *  - 外层圆角方块 56×56，居中偏移 (4,4)，rx=14
 *  - 气泡 cream 填充，右下内收成尾
 *  - 对勾 ink，stroke 2.6，round cap/join
 *  - 极小尺寸可 showDot=false 但本设计无核心点，参数保留只为兼容
 */

const BUBBLE_PATH =
  "M18 18 a4 4 0 0 1 4-4 h20 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-12 l-7 6 v-6 h-1 a4 4 0 0 1 -4-4 z";
const CHECK_PATH = "M25 26 l4 4 l8 -9";

export function SpikeMark({
  size = 16,
  color = "currentColor",
  dotColor = "var(--color-primary)",
  showDot = true,
  className,
}: {
  size?: number;
  /** 未使用，保留以兼容旧调用 */
  color?: string;
  /** 方块底色，默认品牌 coral */
  dotColor?: string;
  /** 未使用，保留以兼容旧调用 */
  showDot?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="4" y="4" width="56" height="56" rx="14" fill={dotColor} />
      <path d={BUBBLE_PATH} fill="var(--color-canvas, #faf9f5)" />
      <path
        d={CHECK_PATH}
        fill="none"
        stroke="var(--color-ink, #141413)"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <SpikeMark size={size} />
      <span
        className="font-medium text-ink"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: size,
          letterSpacing: "-0.015em",
        }}
      >
        OC<span className="text-primary">·</span>Review
      </span>
    </div>
  );
}
