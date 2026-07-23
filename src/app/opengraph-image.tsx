import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OC-Review · AI Native 面试助手";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * 动态生成的 og:image — 用 next/og 的 ImageResponse 在边缘渲染 JSX 成 PNG。
 * 不需要美术资源；改文案只动这里。社交分享卡片（微信 / 朋友圈 / X /
 * 小红书）和 Twitter Card 都会拉这张。
 *
 * 注意 satori 引擎对 CSS 支持有限：只用 flex 不要 grid，不要复杂选择器，
 * 字号 / 颜色 / 间距用内联 style。
 */
export default async function Image() {
  // Design tokens mirrored from globals.css so the card matches the site.
  const COLORS = {
    canvas: "#faf9f5",
    surfaceSoft: "#f5f0e8",
    surfaceCard: "#efe9de",
    ink: "#141413",
    body: "#3d3d3a",
    muted: "#6c6a64",
    primary: "#cc785c",
    hairline: "#e6dfd8",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.canvas,
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Decorative corner accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 360,
            background: `radial-gradient(circle at 100% 0%, ${COLORS.primary}33 0%, transparent 60%)`,
            display: "flex",
          }}
        />

        {/* Top — brand row: bubble mark + serif wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
            <rect x="4" y="4" width="56" height="56" rx="14" fill={COLORS.primary} />
            <path
              d="M18 18 a4 4 0 0 1 4-4 h20 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-12 l-7 6 v-6 h-1 a4 4 0 0 1 -4-4 z"
              fill={COLORS.canvas}
            />
            <path
              d="M25 26 l4 4 l8 -9"
              fill="none"
              stroke={COLORS.ink}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              color: COLORS.ink,
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: -0.5,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            OC
            <span style={{ color: COLORS.primary, margin: "0 4px" }}>·</span>
            Review
          </div>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 18,
              marginLeft: 8,
            }}
          >
            AI Native 面试助手
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        {/* Middle — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              color: COLORS.ink,
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: -1.2,
            }}
          >
            下一场面试，
          </div>
          <div
            style={{
              color: COLORS.ink,
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: -1.2,
              display: "flex",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            从这里
            <span style={{ color: COLORS.primary }}>开始准备</span>
            。
          </div>
        </div>

        <div style={{ height: 40, display: "flex" }} />

        {/* Pill row — feature chips */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {["模拟面试", "面试复盘", "STAR 评分", "高频题预测", "答案优化"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: COLORS.surfaceCard,
                  color: COLORS.body,
                  fontSize: 22,
                  border: `1px solid ${COLORS.hairline}`,
                }}
              >
                /{label}
              </div>
            ),
          )}
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        {/* Bottom — URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: `1px solid ${COLORS.hairline}`,
          }}
        >
          <div
            style={{
              color: COLORS.muted,
              fontSize: 20,
              display: "flex",
              gap: 18,
              alignItems: "center",
            }}
          >
            <span>Claude</span>
            <span style={{ color: COLORS.hairline }}>·</span>
            <span>GPT</span>
            <span style={{ color: COLORS.hairline }}>·</span>
            <span>Gemini</span>
            <span style={{ color: COLORS.hairline }}>·</span>
            <span>智谱</span>
          </div>
          <div
            style={{
              color: COLORS.ink,
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            findfunplus.cn
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
