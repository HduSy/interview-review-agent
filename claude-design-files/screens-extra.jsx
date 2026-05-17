// OC-Review extra screens: 4 mode history pages + 2 settings tabs
// Atoms pulled from window (exported by screens.jsx)

const {
  C, FONT_SERIF, FONT_SANS, FONT_MONO,
  Icon, SpikeMark, Pill, ExpandedSidebar,
  btnPrimary, btnSecondary, artboard, Field, input,
} = window;

// ─── Shared: history page shell ──────────────────────────────────────

function HistoryShell({ activeTab, eyebrow, headline, accent, stats, ctaLabel, filters, children }) {
  return (
    <div style={artboard}>
      <ExpandedSidebar active={activeTab} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas, overflow: "hidden" }}>
        <div style={{ padding: "40px 56px 24px", borderBottom: `1px solid ${C.hairline}` }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                /{activeTab} · 历史
              </div>
              <h1 style={{
                fontFamily: FONT_SERIF, fontWeight: 500,
                fontSize: 40, lineHeight: 1.1, letterSpacing: "-0.02em",
                color: C.ink, margin: 0,
              }}>{headline}</h1>
            </div>
            <button style={btnPrimary}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="plus" size={14} color="#fff" />{ctaLabel}
              </span>
            </button>
          </div>
          <div style={{ display: "flex", gap: 22, fontFamily: FONT_SANS, fontSize: 13, color: C.body, alignItems: "center" }}>
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: C.hairline }}>·</span>}
                <span>
                  <strong style={{ color: s.color || C.ink }}>{s.v}</strong>{" "}
                  <span style={{ color: C.muted }}>{s.label}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
        {filters && (
          <div style={{
            padding: "14px 56px", display: "flex", gap: 8, alignItems: "center",
            borderBottom: `1px solid ${C.hairlineSoft || C.hairline}`,
          }}>
            {filters.map((t, i) => (
              <span key={t} style={{
                padding: "6px 12px", borderRadius: 8,
                background: i === 0 ? C.cream : "transparent",
                color: i === 0 ? C.ink : C.muted,
                fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
              }}>{t}</span>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
              background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 8, width: 220,
            }}>
              <Icon name="search" size={13} color={C.muted} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.mutedSoft }}>搜索历史…</span>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden", padding: "8px 32px 24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── /review history ─────────────────────────────────────────────────

function ScreenReviewHistory() {
  const items = [
    { co: "字节抖音", round: "二面 · 行为", date: "今天 21:10", source: "手动粘贴 · 1,420 字", star: [100, 60, 50, 30], top: "Result 缺数据" },
    { co: "Stripe", round: "Onsite · 系统设计", date: "5 月 13 日", source: "导入语音转写", star: [100, 100, 90, 80], top: "整体扎实" },
    { co: "Google", round: "R2 · System Design", date: "5 月 10 日", source: "手动粘贴 · 2,100 字", star: [80, 100, 100, 70], top: "结尾仓促" },
    { co: "Linear", round: "R1 · 项目深挖", date: "5 月 8 日", source: "导入截图 · 8 张", star: [100, 80, 90, 90], top: "继续保持" },
    { co: "Anthropic", round: "Take-home 复盘", date: "5 月 5 日", source: "手动粘贴 · 980 字", star: [90, 90, 60, 40], top: "Action 太抽象" },
  ];
  return (
    <HistoryShell
      activeTab="review"
      headline={<>你复盘过 <span style={{ color: C.primary }}>5</span> 场面试。</>}
      ctaLabel="开始新的复盘"
      stats={[
        { v: "B+", label: "平均评级" },
        { v: "STAR · A", label: "完整度趋势" },
        { v: "12", label: "高频改进点" },
        { v: "↗", label: "近三场 Result 段提升", color: C.primary },
      ]}
      filters={["全部", "行为面", "系统设计", "项目深挖", "其它"]}
    >
      {items.map((it, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 22,
          padding: "16px 24px", borderBottom: `1px solid ${C.hairlineSoft || C.hairline}`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_SERIF, fontSize: 19, fontWeight: 500, color: C.ink, letterSpacing: "-0.01em" }}>
                {it.co}
              </span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted }}>{it.round}</span>
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mutedSoft }}>{it.source}</div>
          </div>
          {/* STAR bars */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {["S", "T", "A", "R"].map((k, j) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 28 }}>
                <div style={{
                  width: 4, height: 24, background: C.hairline, borderRadius: 2, position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${it.star[j]}%`,
                    background: it.star[j] > 80 ? C.success : it.star[j] > 50 ? C.amber : C.primary,
                  }} />
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, fontWeight: 500 }}>{k}</span>
              </div>
            ))}
          </div>
          <div style={{
            minWidth: 140, fontFamily: FONT_SANS, fontSize: 12, color: C.body,
            background: C.card, padding: "6px 10px", borderRadius: 6,
          }}>{it.top}</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, minWidth: 90, textAlign: "right" }}>{it.date}</div>
          <Icon name="arrow-right" size={16} color={C.muted} />
        </div>
      ))}
    </HistoryShell>
  );
}

// ─── /practice history ───────────────────────────────────────────────

function Heatmap() {
  // 8 weeks × 7 days, deterministic activity
  const rng = (i) => (Math.sin(i * 7.13) + 1) / 2;
  const weeks = 14, days = 7;
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const v = rng(w * days + d);
      const lvl = v < 0.3 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : 3;
      cells.push(lvl);
    }
  }
  const palette = ["#efe9de", "rgba(204,120,92,0.30)", "rgba(204,120,92,0.55)", "#cc785c"];
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 3, padding: "12px 16px",
      background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          14 周作答热度
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.mutedSoft }}>Less</span>
        {[0,1,2,3].map(l => <span key={l} style={{ width: 10, height: 10, background: palette[l], borderRadius: 2 }} />)}
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.mutedSoft }}>More</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3 }}>
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {Array.from({ length: days }).map((_, d) => {
              const lvl = cells[w * days + d];
              return <span key={d} style={{ display: "block", height: 14, background: palette[lvl], borderRadius: 2 }} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenPracticeHistory() {
  const items = [
    { n: 24, q: "设计一个支持百万行的前端表格组件", type: "系统设计", dur: "11:24", rating: "A−", date: "今天" },
    { n: 23, q: "聊聊你最难的一次跨团队协作", type: "行为", dur: "06:12", rating: "B+", date: "今天" },
    { n: 22, q: "实现 LRU 缓存，需要考虑并发安全", type: "算法 · 代码", dur: "18:45", rating: "B", date: "昨天" },
    { n: 21, q: "React 中 useMemo 和 useCallback 的真正区别", type: "概念", dur: "04:30", rating: "A", date: "昨天" },
    { n: 20, q: "如何设计前端的灰度发布机制", type: "系统设计", dur: "14:08", rating: "B+", date: "5/14" },
  ];
  const typeTone = (t) => t.includes("系统") ? "amber" : t.includes("行为") ? "teal" : t.includes("算法") ? "cream" : "outline";
  const ratingColor = (r) => r.startsWith("A") ? C.success : r.startsWith("B") ? C.ink : C.primary;
  return (
    <HistoryShell
      activeTab="practice"
      headline={<>30 天答了 <span style={{ color: C.primary }}>24</span> 题，连续 6 天。</>}
      ctaLabel="再来一题"
      stats={[
        { v: "24", label: "总题数" },
        { v: "6 天", label: "连胜" },
        { v: "B+", label: "平均评级" },
        { v: "系统设计 × 8", label: "最常练" },
      ]}
      filters={["全部", "系统设计", "行为", "算法", "概念", "需重做"]}
    >
      <div style={{ padding: "16px 24px 8px" }}>
        <Heatmap />
      </div>
      {items.map((it, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "14px 24px", borderBottom: `1px solid ${C.hairlineSoft || C.hairline}`,
        }}>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 12, color: C.mutedSoft, minWidth: 28,
          }}>#{it.n}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.ink, marginBottom: 4, fontWeight: 500 }}>
              {it.q}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill tone={typeTone(it.type)}>{it.type}</Pill>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted }}>{it.dur}</span>
            </div>
          </div>
          <span style={{
            fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 500, color: ratingColor(it.rating),
            minWidth: 32, textAlign: "center", letterSpacing: "-0.02em",
          }}>{it.rating}</span>
          <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, minWidth: 70, textAlign: "right" }}>{it.date}</span>
          <Icon name="arrow-right" size={16} color={C.muted} />
        </div>
      ))}
    </HistoryShell>
  );
}

// ─── /predict history ────────────────────────────────────────────────

function ScreenPredictHistory() {
  const sessions = [
    {
      title: "Google · Senior Frontend",
      basis: "JD: 招聘说明 · 1,820 字  +  简历: YuxinTao_Resume_2026.pdf",
      date: "今天 10:14",
      total: 12,
      hit: 4,
      pending: 8,
      hottest: ["React 渲染优化", "微前端跨应用通信", "TypeScript 高级类型"],
    },
    {
      title: "字节抖音 · 前端 SR",
      basis: "JD: 内推贴 · 612 字  +  简历: 同上",
      date: "5 月 12 日",
      total: 8,
      hit: 6,
      pending: 2,
      hottest: ["埋点架构", "Babel/AST 工程化", "性能监控"],
    },
  ];
  return (
    <HistoryShell
      activeTab="predict"
      headline={<>为你预测过 <span style={{ color: C.primary }}>4</span> 组题，命中 <span style={{ color: C.primary }}>14 / 28</span>。</>}
      ctaLabel="生成新一组"
      stats={[
        { v: "4", label: "预测会话" },
        { v: "28", label: "题目总数" },
        { v: "50%", label: "命中率" },
        { v: "↗ Google 准度最高", label: "", color: C.primary },
      ]}
      filters={["全部", "已用", "未验证", "失效"]}
    >
      <div style={{ padding: "12px 24px", display: "grid", gap: 14 }}>
        {sessions.map((s, i) => {
          const hitPct = (s.hit / s.total) * 100;
          return (
            <div key={i} style={{
              background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12,
              padding: 20, display: "grid", gridTemplateColumns: "1fr 320px", gap: 24,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 500, color: C.ink, letterSpacing: "-0.01em" }}>
                    {s.title}
                  </span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>· {s.date}</span>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mutedSoft, marginBottom: 14 }}>
                  {s.basis}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, marginRight: 4 }}>高概率题：</span>
                  {s.hottest.map((h, j) => <Pill key={j} tone="cream">{h}</Pill>)}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    命中
                  </span>
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 500, color: C.ink, letterSpacing: "-0.02em" }}>
                    {s.hit}<span style={{ color: C.mutedSoft, fontSize: 18 }}> / {s.total}</span>
                  </span>
                </div>
                <div style={{ height: 8, background: C.card, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${hitPct}%`, background: C.primary }} />
                  <div style={{ width: `${(s.pending / s.total) * 100}%`, background: "rgba(204,120,92,0.25)" }} />
                </div>
                <div style={{ display: "flex", gap: 14, fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>
                  <span><span style={{ display: "inline-block", width: 8, height: 8, background: C.primary, borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />命中 {s.hit}</span>
                  <span><span style={{ display: "inline-block", width: 8, height: 8, background: "rgba(204,120,92,0.25)", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />待验证 {s.pending}</span>
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                  <button style={btnPrimary}>用作 /mock 题库</button>
                  <button style={btnSecondary}>查看全部</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </HistoryShell>
  );
}

// ─── /optimize history ───────────────────────────────────────────────

function ScreenOptimizeHistory() {
  const items = [
    {
      q: "聊聊你最难的一次跨团队协作",
      before: "我们当时要推一个埋点规范，涉及 5 个业务线。我先去找了各业务的负责人聊…",
      after: "我作为埋点 owner，在 8 周内推动 5 条业务线接入统一规范，将数据口径不一致导致的客诉从每周 12 例降到 0…",
      tag: "STAR · T+R",
      date: "今天 16:20",
    },
    {
      q: "React 中 useMemo 和 useCallback 的真正区别",
      before: "useMemo 是缓存值，useCallback 是缓存函数。useCallback(fn, deps) = useMemo(() => fn, deps)。",
      after: "两者本质都是 useMemo —— useCallback 是 useMemo 的语法糖。真正决定要不要用的不是『值 vs 函数』，而是下游消费者是否依赖引用相等（React.memo、依赖数组）。如果下游不在乎引用，加这两个钩子就是负优化。",
      tag: "结构化 · 加论据",
      date: "昨天 23:01",
    },
  ];
  return (
    <HistoryShell
      activeTab="optimize"
      headline={<>优化了 <span style={{ color: C.primary }}>7</span> 个答案。</>}
      ctaLabel="优化新答案"
      stats={[
        { v: "7", label: "已优化" },
        { v: "STAR ↑", label: "最常加强的维度" },
        { v: "+38%", label: "平均字数补全", color: C.primary },
      ]}
      filters={["全部", "STAR", "结构化", "加论据", "去口语化"]}
    >
      <div style={{ padding: "12px 24px", display: "grid", gap: 14 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12,
            padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Icon name="optimize" size={14} color={C.primary} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.ink, fontWeight: 500 }}>{it.q}</span>
              <div style={{ flex: 1 }} />
              <Pill tone="coral">{it.tag}</Pill>
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>{it.date}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{
                background: C.soft, border: `1px solid ${C.hairlineSoft || C.hairline}`,
                borderRadius: 8, padding: 14,
              }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  Before · 草稿
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, lineHeight: 1.6, textDecoration: "line-through", textDecorationColor: "rgba(108,106,100,0.35)" }}>
                  {it.before}
                </div>
              </div>
              <div style={{
                background: C.dark, color: C.onDark, borderRadius: 8, padding: 14,
              }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.amber, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  After · OC 改写
                </div>
                <div style={{ fontFamily: FONT_SERIF, fontSize: 15, color: C.onDark, lineHeight: 1.55, letterSpacing: "-0.005em" }}>
                  {it.after}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </HistoryShell>
  );
}

// ─── Settings · Model & API tab ──────────────────────────────────────

function SettingsShell({ activeTab, children }) {
  return (
    <div style={artboard}>
      {/* Use the rail (not the expanded sidebar) so the modal feels overlaid */}
      <div style={{ width: 64, background: C.soft, borderRight: `1px solid ${C.hairline}` }} />
      <main style={{ flex: 1, position: "relative", background: C.canvas, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(20,20,19,0.32)" }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 780, background: C.canvas, borderRadius: 16,
          boxShadow: "0 24px 64px rgba(20,20,19,0.18), 0 4px 12px rgba(20,20,19,0.08)",
          display: "flex", flexDirection: "column", maxHeight: 760, overflow: "hidden",
        }}>
          <div style={{ padding: "20px 28px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="settings" size={16} color={C.muted} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              /settings
            </span>
            <div style={{ flex: 1 }} />
            <Icon name="x" size={16} color={C.muted} />
          </div>
          <div style={{
            padding: "20px 28px 0", display: "flex", gap: 4, borderBottom: `1px solid ${C.hairline}`,
          }}>
            {[
              { id: "profile", label: "画像" },
              { id: "api", label: "模型 & API" },
              { id: "usage", label: "用量" },
            ].map(t => (
              <span key={t.id} style={{
                padding: "10px 14px",
                borderBottom: `2px solid ${activeTab === t.id ? C.primary : "transparent"}`,
                color: activeTab === t.id ? C.ink : C.muted,
                fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
                marginBottom: -1,
              }}>{t.label}</span>
            ))}
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>{children}</div>
        </div>
      </main>
    </div>
  );
}

function ScreenSettingsApi() {
  const providers = [
    { id: "anthropic", name: "Anthropic", model: "claude-sonnet-4.5", status: "active", color: C.primary, initial: "*" },
    { id: "openai", name: "OpenAI", model: "gpt-4.1", status: "configured", color: "#0f9d58", initial: "O" },
    { id: "deepseek", name: "DeepSeek", model: "deepseek-v3", status: "configured", color: "#4d6bfe", initial: "D" },
    { id: "zhipu", name: "智谱", model: "glm-4-plus", status: "configured", color: "#7c5cff", initial: "智" },
    { id: "moonshot", name: "Moonshot", model: "kimi-k2", status: "empty", color: "#181715", initial: "K" },
    { id: "custom", name: "自定义", model: "OpenAI-compatible", status: "empty", color: "#6c6a64", initial: "+" },
  ];

  return (
    <SettingsShell activeTab="api">
      <div style={{ padding: "24px 28px" }}>
        {/* Active banner */}
        <div style={{
          background: C.dark, color: C.onDark, borderRadius: 12, padding: 18,
          display: "flex", alignItems: "center", gap: 16, marginBottom: 22,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, background: C.primary, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SpikeMark size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.amber, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
              当前激活
            </div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 500, color: C.onDark, letterSpacing: "-0.01em" }}>
              Anthropic · claude-sonnet-4.5
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.amber }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 3, background: C.success, marginRight: 6, verticalAlign: "middle" }} />
              已连接 · 137ms
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.onDarkSoft }}>本月已用 412k tokens</span>
          </div>
        </div>

        {/* Provider grid */}
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.ink, fontWeight: 500, marginBottom: 10 }}>
          供应商
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
          {providers.map(p => {
            const active = p.status === "active";
            return (
              <div key={p.id} style={{
                background: C.canvas,
                border: `1px solid ${active ? C.primary : C.hairline}`,
                boxShadow: active ? `0 0 0 3px rgba(204,120,92,0.12)` : "none",
                borderRadius: 10, padding: 14,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 6, background: p.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
                }}>{p.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: C.ink }}>{p.name}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.model}</div>
                </div>
                {active ? (
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: 10, color: C.primary, fontWeight: 500,
                    background: "rgba(204,120,92,0.10)", padding: "2px 6px", borderRadius: 4,
                    letterSpacing: "0.06em",
                  }}>ACTIVE</span>
                ) : p.status === "configured" ? (
                  <Icon name="check" size={14} color={C.success} />
                ) : (
                  <Icon name="plus" size={14} color={C.muted} />
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded form for active */}
        <div style={{
          background: C.soft, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="key" size={14} color={C.muted} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: C.ink }}>
              Anthropic · 凭证
            </span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.mutedSoft }}>
              仅存于本地 IndexedDB · 不会上送服务器
            </span>
          </div>
          <Field label="API Key" hint="sk-ant-…">
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...input, fontFamily: FONT_MONO, fontSize: 13 }} defaultValue="sk-ant-api03-••••••••••••••••••••3F2a" />
              <button style={{ ...btnSecondary, height: 40, padding: "0 16px", whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1 }}>测试连接</button>
            </div>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <Field label="Base URL" hint="可选 · 用于代理/自托管">
              <input style={{ ...input, fontFamily: FONT_MONO, fontSize: 13 }} defaultValue="https://api.anthropic.com/v1" />
            </Field>
            <Field label="默认模型">
              <div style={{
                ...input, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>claude-sonnet-4.5</span>
                <Icon name="more" size={14} color={C.muted} />
              </div>
            </Field>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 6,
            fontFamily: FONT_SANS, fontSize: 12, color: C.success,
          }}>
            <Icon name="check" size={13} color={C.success} />
            上次测试：今天 14:01 · 响应 137ms · 余额 充足
          </div>
        </div>
      </div>
    </SettingsShell>
  );
}

// ─── Settings · Usage tab ────────────────────────────────────────────

function ScreenSettingsUsage() {
  // 14-day bar chart, deterministic
  const days = Array.from({ length: 14 }).map((_, i) => {
    const v = Math.abs(Math.sin(i * 0.9 + 1.3)) * 0.75 + 0.15;
    return { d: i, v };
  });
  const max = Math.max(...days.map(d => d.v));

  const byMode = [
    { mode: "mock", v: 168, pct: 41, color: C.primary },
    { mode: "review", v: 104, pct: 25, color: "#a06820" },
    { mode: "practice", v: 72, pct: 17, color: C.success },
    { mode: "predict", v: 38, pct: 9, color: "#2d7a6b" },
    { mode: "optimize", v: 22, pct: 5, color: "#7c5cff" },
    { mode: "chat", v: 12, pct: 3, color: C.muted },
  ];

  return (
    <SettingsShell activeTab="usage">
      <div style={{ padding: "24px 28px" }}>
        {/* Big number */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20,
        }}>
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.muted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              本月用量 · 5 月
            </div>
            <div style={{
              fontFamily: FONT_SERIF, fontSize: 56, fontWeight: 500, color: C.ink,
              lineHeight: 1, letterSpacing: "-0.025em",
            }}>
              416<span style={{ fontSize: 28, color: C.muted, marginLeft: 4 }}>k tokens</span>
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, marginTop: 6 }}>
              <span style={{ color: C.success }}>↘ 12%</span> 对比上月 · 估算成本 <strong style={{ color: C.ink }}>$3.84</strong>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 4 }}>
            {["7 天", "30 天", "本月", "全部"].map((t, i) => (
              <span key={t} style={{
                padding: "5px 10px", borderRadius: 6,
                background: i === 1 ? C.cream : "transparent",
                color: i === 1 ? C.ink : C.muted,
                fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{
          background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 16,
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 96, marginBottom: 8 }}>
            {days.map(d => (
              <div key={d.d} style={{
                flex: 1, height: `${(d.v / max) * 100}%`,
                background: d.d === days.length - 1 ? C.primary : "rgba(204,120,92,0.40)",
                borderRadius: "3px 3px 0 0",
              }} />
            ))}
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontFamily: FONT_MONO, fontSize: 10, color: C.mutedSoft,
          }}>
            <span>5/3</span><span>5/10</span><span>5/16 今天</span>
          </div>
        </div>

        {/* Mode breakdown */}
        <div style={{
          fontFamily: FONT_SANS, fontSize: 13, color: C.ink, fontWeight: 500, marginBottom: 10,
        }}>按 Mode 分布</div>
        <div style={{
          display: "flex", height: 10, borderRadius: 6, overflow: "hidden", marginBottom: 14,
          background: C.card,
        }}>
          {byMode.map(m => (
            <div key={m.mode} style={{ width: `${m.pct}%`, background: m.color }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {byMode.map(m => (
            <div key={m.mode} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8,
              background: C.soft,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: m.color }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.ink, fontWeight: 500, minWidth: 64 }}>
                /{m.mode}
              </span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, flex: 1, textAlign: "right" }}>
                {m.v}k
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mutedSoft, minWidth: 32, textAlign: "right" }}>
                {m.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 22, padding: 14, borderRadius: 12,
          background: "rgba(204,120,92,0.08)", border: `1px solid rgba(204,120,92,0.20)`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Icon name="sparkles" size={16} color={C.primary} />
          <div style={{ flex: 1, fontFamily: FONT_SANS, fontSize: 13, color: C.body, lineHeight: 1.55 }}>
            <strong style={{ color: C.ink }}>提示：</strong>
            你最近 7 天 /mock 占了 41%—— 试试在每次 mock 后立刻 /review，把对话切到便宜的模型可以省 30% token。
          </div>
          <button style={btnSecondary}>设置自动切换</button>
        </div>
      </div>
    </SettingsShell>
  );
}

Object.assign(window, {
  ScreenReviewHistory, ScreenPracticeHistory, ScreenPredictHistory, ScreenOptimizeHistory,
  ScreenSettingsApi, ScreenSettingsUsage,
});
