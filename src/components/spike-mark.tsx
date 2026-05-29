/**
 * 品牌火花 (Spark) — 内凹四芒星 + 珊瑚核心点。
 *
 * 设计稿在 claude-design-files/OC-Review Logo.html (方向 A · 推荐)。
 * 关键约束：
 *  - 几何用 SVG 三次贝塞尔近似的内凹四芒星，viewBox 64×64
 *  - 默认外形 #141413 (ink)，核心点 #cc785c (primary)
 *  - 默认始终渲染核心点，是品牌的"双色火花"语汇
 *  - 极小尺寸 / favicon / 单色场景可通过 showDot={false} 隐藏点
 *  - 不要旋转、不要渐变、不要描边
 */

const SPARK_PATH =
  "M32 3 Q39.5 24.5 61 32 Q39.5 39.5 32 61 Q24.5 39.5 3 32 Q24.5 24.5 32 3 Z";

export function SpikeMark({
  size = 16,
  color = "currentColor",
  dotColor = "var(--color-primary)",
  showDot = true,
  className,
}: {
  size?: number;
  /** 火花本体颜色 */
  color?: string;
  /** 中心珊瑚点颜色 */
  dotColor?: string;
  /** 显式隐藏核心点（默认 true，用于 favicon / 极小尺寸 / 单色场景） */
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
      <path d={SPARK_PATH} fill={color} />
      {showDot && <circle cx="32" cy="32" r="4.4" fill={dotColor} />}
    </svg>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <SpikeMark size={size} color="var(--color-ink)" />
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
