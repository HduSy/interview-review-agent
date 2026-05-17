// OC-Review screens — Claude warm-canvas design language
// All artboards designed at 1320×840

const C = {
  primary: "#cc785c",
  primaryActive: "#a9583e",
  ink: "#141413",
  bodyStrong: "#252523",
  body: "#3d3d3a",
  muted: "#6c6a64",
  mutedSoft: "#8e8b82",
  hairline: "#e6dfd8",
  hairlineSoft: "#ebe6df",
  canvas: "#faf9f5",
  soft: "#f5f0e8",
  card: "#efe9de",
  cream: "#e8e0d2",
  dark: "#181715",
  darkEl: "#252320",
  darkSoft: "#1f1e1b",
  onDark: "#faf9f5",
  onDarkSoft: "#a09d96",
  teal: "#5db8a6",
  amber: "#e8a55a",
  success: "#5db872",
  error: "#c64545",
};

const FONT_SERIF = `"Cormorant Garamond", "EB Garamond", "Tiempos Headline", Garamond, "Times New Roman", serif`;
const FONT_SANS = `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
const FONT_MONO = `"JetBrains Mono", ui-monospace, monospace`;

// ─── Atoms ───────────────────────────────────────────────────────────

function SpikeMark({ size = 16, color = C.ink }) {
  // 4-spoke radial asterisk-style mark, Anthropic-flavored
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
      <path d="M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z" fill={color} />
    </svg>
  );
}

function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", style: { display: "block" } };
  switch (name) {
    case "chat": return <svg {...props}><path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.8-.3-4-.8L3 21l1.5-4.5C3.6 15.2 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z" /></svg>;
    case "mock": return <svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
    case "review": return <svg {...props}><path d="M4 5h12l4 4v10a1 1 0 0 1-1 1H4Z" /><path d="M16 5v4h4" /><path d="M8 13h8M8 17h5" /></svg>;
    case "practice": return <svg {...props}><path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>;
    case "predict": return <svg {...props}><path d="M3 12a9 9 0 1 0 9-9" /><path d="M12 7v5l3 2" /></svg>;
    case "optimize": return <svg {...props}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>;
    case "send": return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "plus": return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case "paperclip": return <svg {...props}><path d="m21 12-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" /></svg>;
    case "sparkles": return <svg {...props}><path d="M12 3 13.5 9 19.5 10.5 13.5 12 12 18 10.5 12 4.5 10.5 10.5 9 Z" /><path d="M19 16v4M17 18h4" /></svg>;
    case "panel": return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>;
    case "arrow-right": return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "check": return <svg {...props}><path d="M5 12l4 4 10-10" /></svg>;
    case "x": return <svg {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case "search": return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    case "clock": return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "play": return <svg {...props}><path d="M6 4v16l14-8Z" fill={color} /></svg>;
    case "more": return <svg {...props}><circle cx="5" cy="12" r="1.2" fill={color} /><circle cx="12" cy="12" r="1.2" fill={color} /><circle cx="19" cy="12" r="1.2" fill={color} /></svg>;
    case "upload": return <svg {...props}><path d="M12 16V4M6 10l6-6 6 6" /><path d="M4 20h16" /></svg>;
    case "key": return <svg {...props}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M15 7l3 3M14 8l3 3" /></svg>;
    case "user": return <svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
    case "spark-small": return <svg {...props}><path d="M12 4 13 10 19 11 13 12 12 18 11 12 5 11 11 10Z" fill={color} stroke="none" /></svg>;
    default: return null;
  }
}

function Mark({ size = 20 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <SpikeMark size={size} />
      <span style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", color: C.ink }}>
        OC<span style={{ color: C.primary }}>·</span>Review
      </span>
    </div>
  );
}

function ModeBadge({ label, sub, dark }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "6px 12px 6px 8px",
      background: dark ? C.darkEl : C.canvas,
      border: `1px solid ${dark ? "#33312d" : C.hairline}`,
      borderRadius: 999,
      fontFamily: FONT_SANS,
      fontSize: 12,
      color: dark ? C.onDark : C.ink,
    }}>
      <span style={{
        background: C.primary, color: "#fff",
        fontFamily: FONT_MONO, fontSize: 11, fontWeight: 500,
        padding: "2px 7px", borderRadius: 999, letterSpacing: "0.04em"
      }}>{label}</span>
      <span style={{ color: dark ? C.onDarkSoft : C.muted, fontSize: 12 }}>{sub}</span>
    </div>
  );
}

function Pill({ children, tone = "cream" }) {
  const styles = {
    cream: { bg: C.card, fg: C.ink },
    coral: { bg: C.primary, fg: "#fff" },
    outline: { bg: "transparent", fg: C.muted, border: `1px solid ${C.hairline}` },
    teal: { bg: "rgba(93,184,166,0.12)", fg: "#2d7a6b" },
    amber: { bg: "rgba(232,165,90,0.15)", fg: "#a06820" },
  }[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: styles.bg, color: styles.fg,
      border: styles.border || "none",
      fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500,
      padding: "4px 10px", borderRadius: 999,
    }}>{children}</span>
  );
}

// ─── Sidebar (collapsed rail) ────────────────────────────────────────

function RailItem({ icon, active, label }) {
  return (
    <div title={label} style={{
      width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 8,
      background: active ? C.cream : "transparent",
      color: active ? C.ink : C.muted,
      cursor: "pointer",
    }}>
      <Icon name={icon} size={18} strokeWidth={1.6} />
    </div>
  );
}

function Rail({ active = "chat" }) {
  const items = [
    { icon: "chat", id: "chat", label: "chat" },
    { icon: "mock", id: "mock", label: "mock" },
    { icon: "review", id: "review", label: "review" },
    { icon: "practice", id: "practice", label: "practice" },
    { icon: "predict", id: "predict", label: "predict" },
    { icon: "optimize", id: "optimize", label: "optimize" },
  ];
  return (
    <aside style={{
      width: 64, background: C.soft,
      borderRight: `1px solid ${C.hairline}`,
      padding: "16px 12px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    }}>
      <div style={{ marginBottom: 6 }}><SpikeMark size={18} /></div>
      <div style={{ width: 24, height: 1, background: C.hairline, margin: "4px 0 10px" }} />
      {items.map(i => <RailItem key={i.id} icon={i.icon} label={i.label} active={active === i.id} />)}
      <div style={{ flex: 1 }} />
      <RailItem icon="settings" label="settings" active={active === "settings"} />
      <div style={{
        width: 32, height: 32, borderRadius: 999, background: C.dark, color: C.onDark,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, marginTop: 6,
      }}>YT</div>
    </aside>
  );
}

// ─── Sidebar expanded ────────────────────────────────────────────────

function ExpandedSidebar({ active = "mock" }) {
  const sections = [
    { id: "chat", label: "chat", icon: "chat", count: 12 },
    { id: "mock", label: "mock", icon: "mock", count: 5 },
    { id: "review", label: "review", icon: "review", count: 3 },
    { id: "practice", label: "practice", icon: "practice", count: 24 },
    { id: "predict", label: "predict", icon: "predict", count: 2 },
    { id: "optimize", label: "optimize", icon: "optimize", count: 7 },
  ];
  return (
    <aside style={{
      width: 248, background: C.soft, borderRight: `1px solid ${C.hairline}`,
      padding: "20px 16px", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, padding: "0 4px" }}>
        <Mark size={18} />
        <Icon name="panel" size={16} color={C.muted} />
      </div>
      <button style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        background: C.ink, color: "#fff", border: "none", borderRadius: 8,
        fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, cursor: "pointer",
        marginBottom: 16,
      }}>
        <Icon name="plus" size={14} color="#fff" />
        New chat
        <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 11, color: C.onDarkSoft }}>⌘N</span>
      </button>
      <div style={{
        fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
        color: C.mutedSoft, textTransform: "uppercase", padding: "8px 12px 6px",
      }}>Modes</div>
      {sections.map(s => (
        <div key={s.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 8,
          background: active === s.id ? C.cream : "transparent",
          color: active === s.id ? C.ink : C.body,
          fontFamily: FONT_SANS, fontSize: 13, fontWeight: active === s.id ? 500 : 400,
          cursor: "pointer",
        }}>
          <Icon name={s.icon} size={15} color={active === s.id ? C.ink : C.muted} />
          <span>/{s.label}</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 11, color: C.mutedSoft }}>{s.count}</span>
        </div>
      ))}
      <div style={{ height: 1, background: C.hairline, margin: "16px 8px" }} />
      <div style={{
        fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
        color: C.mutedSoft, textTransform: "uppercase", padding: "0 12px 6px",
      }}>Recent</div>
      {[
        "Google · Frontend SR · 模拟",
        "字节 抖音 · 系统设计复盘",
        "React 状态管理 · 答案优化",
        "今日预测题 · 5 道",
      ].map((t, i) => (
        <div key={i} style={{
          padding: "7px 12px", borderRadius: 8,
          fontFamily: FONT_SANS, fontSize: 13, color: C.body,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{t}</div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
        borderRadius: 8, background: C.canvas, border: `1px solid ${C.hairline}`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999, background: C.dark, color: C.onDark,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500,
        }}>YT</div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.ink, fontWeight: 500 }}>Yuxin Tao</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis" }}>claude-sonnet-4.5</span>
        </div>
        <Icon name="settings" size={15} color={C.muted} />
      </div>
    </aside>
  );
}

// ─── Composer (input area) ───────────────────────────────────────────

function Composer({ value = "", placeholder = "问点什么，或输入 / 调用命令…", showHint = true, focused = false }) {
  return (
    <div style={{ padding: "20px 64px 28px", background: "transparent" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{
          background: C.canvas,
          border: `1px solid ${focused ? C.primary : C.hairline}`,
          boxShadow: focused ? `0 0 0 3px rgba(204,120,92,0.15)` : "0 1px 2px rgba(20,20,19,0.03)",
          borderRadius: 16,
          padding: "16px 16px 12px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 15, color: value ? C.ink : C.mutedSoft,
            minHeight: 24, lineHeight: 1.55,
          }}>
            {value || placeholder}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={btnGhost}>
              <Icon name="paperclip" size={15} color={C.muted} />
            </button>
            <button style={btnGhost}>
              <Icon name="sparkles" size={15} color={C.muted} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>简历</span>
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mutedSoft }}>Shift + ⏎ 换行</span>
            <button style={{
              width: 32, height: 32, borderRadius: 8, background: value ? C.primary : C.primaryActive + "55",
              display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer",
            }}>
              <Icon name="arrow-right" size={15} color="#fff" />
            </button>
          </div>
        </div>
        {showHint && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginTop: 12,
            fontFamily: FONT_SANS, fontSize: 12, color: C.muted, justifyContent: "center",
          }}>
            <span>按 <kbd style={kbd}>/</kbd> 查看命令</span>
            <span style={{ color: C.hairline }}>·</span>
            <span><kbd style={kbd}>⌘K</kbd> 快速命令面板</span>
            <span style={{ color: C.hairline }}>·</span>
            <span><kbd style={kbd}>⌘N</kbd> 新对话</span>
          </div>
        )}
      </div>
    </div>
  );
}

const btnGhost = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "6px 10px", borderRadius: 8,
  background: "transparent", border: `1px solid ${C.hairline}`,
  cursor: "pointer",
};

const kbd = {
  fontFamily: FONT_MONO, fontSize: 11, padding: "1px 6px",
  background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 4,
  color: C.body,
};

// ─── Topbar (above conversation) ─────────────────────────────────────

function Topbar({ mode, sub, dark }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "16px 32px",
      borderBottom: `1px solid ${C.hairline}`,
      background: C.canvas,
    }}>
      {mode ? <ModeBadge label={mode} sub={sub} /> : (
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted }}>新对话</div>
      )}
      <div style={{ flex: 1 }} />
      <button style={btnGhost}>
        <Icon name="clock" size={14} color={C.muted} />
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.body }}>历史</span>
      </button>
      <button style={btnGhost}>
        <Icon name="more" size={14} color={C.muted} />
      </button>
    </div>
  );
}

// ─── Messages ────────────────────────────────────────────────────────

function MsgAI({ children, name = "OC", spike = true }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "0 0 28px" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: C.canvas, border: `1px solid ${C.hairline}`,
        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
      }}>
        {spike ? <SpikeMark size={13} /> : <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.muted }}>{name}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 500 }}>
          OC · 面试官
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.bodyStrong, lineHeight: 1.65 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function MsgUser({ children }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "0 0 28px", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: "76%" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 500, textAlign: "right" }}>
          You
        </div>
        <div style={{
          fontFamily: FONT_SANS, fontSize: 15, color: C.bodyStrong, lineHeight: 1.65,
          background: C.card, padding: "12px 16px", borderRadius: 12,
          borderBottomRightRadius: 4,
        }}>
          {children}
        </div>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 999, flexShrink: 0,
        background: C.dark, color: C.onDark, marginTop: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500,
      }}>YT</div>
    </div>
  );
}

// ─── Screen 1: Empty chat / Welcome ──────────────────────────────────

function ScreenWelcome() {
  const cmds = [
    { cmd: "mock", icon: "mock", title: "模拟面试", desc: "AI 扮演面试官，按岗位 + 公司风格出题" },
    { cmd: "review", icon: "review", title: "复盘面试", desc: "粘贴一段面试记录，AI 给出结构化反馈" },
    { cmd: "practice", icon: "practice", title: "随堂练习", desc: "随机出一题，立刻作答，即时反馈" },
    { cmd: "predict", icon: "predict", title: "题目预测", desc: "基于 JD + 简历生成可能被问到的问题" },
    { cmd: "optimize", icon: "optimize", title: "答案优化", desc: "把你的草稿改写得更符合 STAR" },
    { cmd: "settings", icon: "settings", title: "完善画像", desc: "目标岗位、技术栈、简历…配置一次受用一直" },
  ];
  return (
    <div style={artboard}>
      <Rail active="chat" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas }}>
        <div style={{ flex: 1, overflow: "hidden", padding: "56px 64px 0", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <SpikeMark size={20} color={C.primary} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: C.primary, letterSpacing: "0.06em", textTransform: "uppercase" }}>OC · Review</span>
            </div>
            <h1 style={{
              fontFamily: FONT_SERIF, fontWeight: 500,
              fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.02em",
              color: C.ink, margin: "0 0 12px",
            }}>
              下一场面试，<br />从这里开始准备。
            </h1>
            <p style={{
              fontFamily: FONT_SANS, fontSize: 17, lineHeight: 1.55,
              color: C.body, margin: "0 0 36px", maxWidth: 560,
            }}>
              直接对话即可。或者输入 <code style={inlineCode}>/</code> 来切换模式 — 模拟、复盘、练习、预测、优化，都在同一个聊天框里。
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 8,
            }}>
              {cmds.map(c => (
                <div key={c.cmd} style={{
                  background: C.canvas, border: `1px solid ${C.hairline}`,
                  borderRadius: 12, padding: 18,
                  display: "flex", flexDirection: "column", gap: 8,
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name={c.icon} size={14} color={C.primary} />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.primary, fontWeight: 500 }}>/{c.cmd}</span>
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: C.ink }}>{c.title}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Composer />
      </main>
    </div>
  );
}

const inlineCode = {
  fontFamily: FONT_MONO, fontSize: 13,
  background: C.card, padding: "1px 6px", borderRadius: 4, color: C.ink,
};

// ─── Screen 2: Slash command palette ─────────────────────────────────

function ScreenSlash() {
  const cmds = [
    { cmd: "mock", icon: "mock", desc: "开始一场模拟面试", hot: "M" },
    { cmd: "review", icon: "review", desc: "复盘一段面试记录", hot: "R" },
    { cmd: "practice", icon: "practice", desc: "随堂练习一题", hot: "P" },
    { cmd: "predict", icon: "predict", desc: "预测可能被问到的题目", hot: "F" },
    { cmd: "optimize", icon: "optimize", desc: "优化一段答案", hot: "O" },
    { cmd: "settings", icon: "settings", desc: "打开个人画像 & API 设置", hot: "," },
  ];
  return (
    <div style={artboard}>
      <Rail active="chat" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas, position: "relative" }}>
        <div style={{ flex: 1, padding: "56px 64px 0", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", width: "100%", opacity: 0.5 }}>
            <h1 style={{
              fontFamily: FONT_SERIF, fontWeight: 500,
              fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.02em",
              color: C.ink, margin: "0 0 12px",
            }}>
              下一场面试，<br />从这里开始准备。
            </h1>
          </div>
        </div>

        {/* Composer area with palette */}
        <div style={{ padding: "20px 64px 28px", position: "relative" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}>
            {/* Palette */}
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
              background: C.canvas,
              border: `1px solid ${C.hairline}`,
              borderRadius: 12,
              padding: 8,
              boxShadow: "0 12px 32px rgba(20,20,19,0.08), 0 2px 6px rgba(20,20,19,0.04)",
            }}>
              <div style={{
                padding: "6px 10px 8px", display: "flex", alignItems: "center", gap: 8,
                borderBottom: `1px solid ${C.hairlineSoft}`,
              }}>
                <Icon name="sparkles" size={13} color={C.primary} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Slash commands
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mutedSoft }}>↑↓ 选择 · ⏎ 确认 · esc 关闭</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", padding: "6px 0 2px" }}>
                {cmds.map((c, i) => (
                  <div key={c.cmd} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "10px 12px", borderRadius: 8,
                    background: i === 0 ? C.card : "transparent",
                  }}>
                    <Icon name={c.icon} size={16} color={i === 0 ? C.primary : C.muted} />
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 14, fontWeight: 500,
                      color: i === 0 ? C.ink : C.bodyStrong, minWidth: 96,
                    }}>/{c.cmd}</span>
                    <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, flex: 1 }}>
                      {c.desc}
                    </span>
                    {i === 0 && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontFamily: FONT_SANS, fontSize: 11, color: C.primary, fontWeight: 500,
                        background: "rgba(204,120,92,0.10)",
                        padding: "2px 8px", borderRadius: 999,
                      }}>
                        <Icon name="arrow-right" size={10} color={C.primary} />
                        激活 /mock Tab
                      </span>
                    )}
                    <kbd style={kbd}>{c.hot}</kbd>
                  </div>
                ))}
              </div>
              <div style={{
                padding: "8px 12px 4px", borderTop: `1px solid ${C.hairlineSoft}`,
                fontFamily: FONT_SANS, fontSize: 11, color: C.mutedSoft, marginTop: 4,
              }}>
                选中后：聊天框切换为对应 Mode · 当前对话归入该 Mode · 左侧 Tab 同步高亮
              </div>
            </div>

            {/* Composer with "/" typed */}
            <div style={{
              background: C.canvas,
              border: `1px solid ${C.primary}`,
              boxShadow: `0 0 0 3px rgba(204,120,92,0.15)`,
              borderRadius: 16,
              padding: "16px 16px 12px",
            }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: C.ink, minHeight: 24, lineHeight: 1.55 }}>
                /<span style={{ borderRight: `2px solid ${C.primary}`, marginLeft: 1, height: 16, display: "inline-block", verticalAlign: "middle" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <button style={btnGhost}><Icon name="paperclip" size={15} color={C.muted} /></button>
                <button style={btnGhost}>
                  <Icon name="sparkles" size={15} color={C.muted} />
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>简历</span>
                </button>
                <div style={{ flex: 1 }} />
                <button style={{
                  width: 32, height: 32, borderRadius: 8, background: C.primaryActive + "44",
                  display: "flex", alignItems: "center", justifyContent: "center", border: "none",
                }}>
                  <Icon name="arrow-right" size={15} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Screen 3: Mock interview in progress ────────────────────────────

function ScreenMock() {
  return (
    <div style={artboard}>
      <Rail active="mock" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas }}>
        <Topbar mode="MOCK" sub="Google · Senior Frontend · Round 2 — 行为面 + 系统设计" />
        <div style={{ flex: 1, overflow: "hidden", padding: "32px 64px 16px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
              fontFamily: FONT_SANS, fontSize: 12, color: C.muted,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: C.success }} />
              开始于 14:02 · 已进行 18 分钟 · 提问 4 / 8
            </div>

            <MsgAI>
              你好 Yuxin。看了你的简历，注意到你在字节做了一个内部搭建平台，
              <strong style={{ color: C.ink }}> Schema 编辑器是用 Slate 实现的</strong>。
              我想从这个项目切入。在最复杂的一次 schema 嵌套场景里——
              假设三层 Form 嵌套，跨层级有联动校验——
              你当时是怎么把状态结构和渲染分开的？
            </MsgAI>

            <MsgUser>
              当时核心做法是把 schema 转成扁平的 path → node Map，
              校验跑在 Map 上、UI 用懒渲染。父子联动用 dependency 字段声明，
              事件层广播到订阅的 path。
            </MsgUser>

            <MsgAI>
              清晰。再深一层：<strong style={{ color: C.ink }}>这个 dependency 系统在循环引用时怎么处理？</strong>
              比如 A.value 依赖 B.value，B.value 又反过来引用 A.visible 的情况，
              你是事先静态分析还是运行时检测？
            </MsgAI>

            {/* AI thinking */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 0 4px 42px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    width: 5, height: 5, borderRadius: 3, background: C.muted,
                    opacity: 0.3 + i * 0.25,
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
                轮到你回答…
              </span>
            </div>
          </div>
        </div>

        {/* Inline mode helper strip */}
        <div style={{
          padding: "8px 64px", borderTop: `1px solid ${C.hairlineSoft}`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>
            <Icon name="spark-small" size={12} color={C.amber} /> 卡住了？输入
            <code style={inlineCode}>/hint</code> 让 OC 给一个引导，不会泄露完整答案。
          </span>
        </div>

        <Composer placeholder="把你想到的回答写出来，结构粗一点也没关系…" showHint={false} />
      </main>
    </div>
  );
}

// ─── Screen 4: Review mode — structured feedback ─────────────────────

function ScreenReview() {
  return (
    <div style={artboard}>
      <Rail active="review" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas }}>
        <Topbar mode="REVIEW" sub="复盘 · 字节抖音 · 二面 行为问题" />
        <div style={{ flex: 1, overflow: "hidden", padding: "32px 64px 0" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>

            {/* User input — collapsed transcript */}
            <div style={{ display: "flex", gap: 14, padding: "0 0 28px", justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "76%" }}>
                <div style={{
                  background: C.card, padding: "12px 16px", borderRadius: 12,
                  borderBottomRightRadius: 4,
                  fontFamily: FONT_SANS, fontSize: 14, color: C.body, lineHeight: 1.6,
                }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted, marginBottom: 6 }}>面试记录 · 1,420 字</div>
                  "面试官：聊一下你最难的一次跨团队协作…<br />
                  我：当时我们要推一个埋点规范，涉及 5 个业务线。我先去找了…"
                  <div style={{
                    marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.hairline}`,
                    fontFamily: FONT_SANS, fontSize: 12, color: C.muted, display: "flex", gap: 6,
                  }}>
                    <Icon name="more" size={12} color={C.muted} /> 展开完整记录
                  </div>
                </div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: 999, background: C.dark, color: C.onDark,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500,
              }}>YT</div>
            </div>

            {/* AI feedback */}
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: C.canvas, border: `1px solid ${C.hairline}`,
                display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
              }}>
                <SpikeMark size={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, marginBottom: 10, fontWeight: 500 }}>
                  OC · 复盘分析师
                </div>

                {/* Summary scores */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18,
                }}>
                  {[
                    { label: "整体表现", v: "B+", tone: "良好", color: C.ink, bg: C.card },
                    { label: "STAR 结构", v: "S", tone: "完整", color: "#2d7a6b", bg: "rgba(93,184,166,0.12)" },
                    { label: "T 任务定义", v: "T", tone: "偏弱", color: "#a06820", bg: "rgba(232,165,90,0.15)" },
                    { label: "结果量化", v: "R", tone: "缺数据", color: "#a44", bg: "rgba(198,69,69,0.10)" },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: m.bg, borderRadius: 12, padding: "14px 16px",
                    }}>
                      <div style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 500, color: m.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{m.v}</div>
                      <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, marginTop: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: m.color, marginTop: 2, fontWeight: 500 }}>{m.tone}</div>
                    </div>
                  ))}
                </div>

                <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.bodyStrong, lineHeight: 1.65, margin: "0 0 16px" }}>
                  整体回答很<strong style={{ color: C.ink }}>真诚、细节充实</strong>——尤其是 Situation 部分，
                  把 5 个业务线的复杂度交代得很清晰。但 Task 段被你跳过了，面试官需要回过头去问；
                  Result 完全没有量化指标——这在字节会被反复追问。
                </p>

                {/* Two columns: strengths / improvements */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: C.success }} />
                      <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.body, letterSpacing: "0.06em", textTransform: "uppercase" }}>做得好的</span>
                    </div>
                    {["背景铺陈到位、不流水账", "主动提到了 stakeholder mapping", "诚实承认了第一版方案的失败"].map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontFamily: FONT_SANS, fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 6 }}>
                        <Icon name="check" size={13} color={C.success} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: C.primary }} />
                      <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.body, letterSpacing: "0.06em", textTransform: "uppercase" }}>下次试试</span>
                    </div>
                    {["开头 30 秒先把目标/约束讲明白", "把『我』的具体动作量化（推动了 N 次评审）", "结尾必须给数字：覆盖率、ROI、time-to-x"].map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontFamily: FONT_SANS, fontSize: 13, color: C.body, lineHeight: 1.55, marginBottom: 6 }}>
                        <Icon name="arrow-right" size={13} color={C.primary} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rewrite card */}
                <div style={{
                  background: C.dark, color: C.onDark, borderRadius: 12, padding: 20,
                  marginBottom: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Icon name="sparkles" size={14} color={C.amber} />
                    <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.onDark, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      建议改写 · Task 段落
                    </span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.onDarkSoft }}>STAR · T</span>
                  </div>
                  <p style={{ fontFamily: FONT_SERIF, fontSize: 18, lineHeight: 1.5, color: C.onDark, margin: 0, letterSpacing: "-0.01em" }}>
                    "我作为埋点 owner，需要在 8 周内让 5 条业务线接入统一规范，
                    目标是把数据口径不一致导致的客诉从每周 12 例降到 0——
                    这意味着我既要交付一个不阻塞业务的迁移工具，
                    又要拿到每条业务线 PM 的口头承诺。"
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btnPrimary}>继续改下一段</button>
                  <button style={btnSecondary}>导出复盘报告</button>
                  <button style={btnSecondary}>把要点存入画像</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 28 }} />
      </main>
    </div>
  );
}

const btnPrimary = {
  background: C.primary, color: "#fff", border: "none",
  fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
  padding: "9px 16px", borderRadius: 8, cursor: "pointer",
};
const btnSecondary = {
  background: C.canvas, color: C.ink, border: `1px solid ${C.hairline}`,
  fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
  padding: "9px 16px", borderRadius: 8, cursor: "pointer",
};

// ─── Screen 5: Practice mode — question card ─────────────────────────

function ScreenPractice() {
  return (
    <div style={artboard}>
      <Rail active="practice" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas }}>
        <Topbar mode="PRACTICE" sub="随堂练习 · 第 24 题 · 今日第 3 题" />
        <div style={{ flex: 1, overflow: "hidden", padding: "32px 64px 0" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>

            <MsgAI>
              基于你的画像 — 前端 / 3 年 / React、Node — 我抽到一道<strong style={{ color: C.ink }}>系统设计</strong>。
              用 90 秒读题，然后开始作答。我不会打断你。
            </MsgAI>

            {/* Question card */}
            <div style={{
              background: C.card, borderRadius: 16, padding: 28, marginBottom: 24,
              marginLeft: 42,
            }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <Pill tone="amber">系统设计</Pill>
                <Pill tone="outline">中等</Pill>
                <Pill tone="outline">预计 12 min</Pill>
                <Pill tone="outline">前端</Pill>
              </div>
              <h2 style={{
                fontFamily: FONT_SERIF, fontWeight: 500,
                fontSize: 32, lineHeight: 1.2, letterSpacing: "-0.02em",
                color: C.ink, margin: "0 0 12px",
              }}>
                设计一个支持百万行的前端表格组件
              </h2>
              <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.body, lineHeight: 1.65, margin: "0 0 16px" }}>
                客户场景：金融数据，单页 100w+ 行 × 40 列，
                需要支持排序 / 筛选 / 单元格编辑，编辑要乐观更新并能回滚。
                不允许后端分页（客户合规要求一次性下发）。
              </p>
              <div style={{
                display: "flex", gap: 16, paddingTop: 16, borderTop: `1px solid ${C.hairline}`,
                fontFamily: FONT_SANS, fontSize: 12, color: C.muted,
              }}>
                <span>👀 评分维度：可扩展性 · 性能直觉 · 取舍说明 · 边界情况</span>
              </div>
            </div>

            {/* Live answer area */}
            <div style={{
              background: C.canvas, border: `1px dashed ${C.primary}`, borderRadius: 12,
              padding: 20, marginLeft: 42, marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: C.primary, animation: "pulse 1.5s infinite" }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.primary, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
                  你在作答 · 02:14
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>168 字</span>
              </div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.bodyStrong, lineHeight: 1.65, margin: 0 }}>
                我先把约束拆出来：100w 行 × 40 列 = 4000w 单元格，
                DOM 必然不可能全挂，所以先确定<strong style={{ color: C.ink }}>视窗虚拟化</strong>是底线。
                40 列在桌面端基本是横向溢出，所以双向 virtual scroll，
                row 和 col 都用 windowing…
                <span style={{ borderRight: `2px solid ${C.primary}`, marginLeft: 1, height: 16, display: "inline-block", verticalAlign: "middle" }} />
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginLeft: 42 }}>
              <button style={btnPrimary}>提交答案</button>
              <button style={btnSecondary}>暂停计时</button>
              <button style={btnSecondary}>换一题</button>
              <div style={{ flex: 1 }} />
              <button style={{ ...btnSecondary, color: C.muted, border: "none", background: "transparent" }}>跳过 · 不计入</button>
            </div>
          </div>
        </div>
        <div style={{ height: 28 }} />
      </main>
    </div>
  );
}

// ─── Screen 6: Sidebar expanded + Mock history list ──────────────────

function ScreenHistory() {
  const mocks = [
    { co: "Google", role: "Senior Frontend", round: "R2 · 系统设计", date: "今天 14:02", dur: "48 min", score: "B+", color: "#4285F4" },
    { co: "字节", role: "Frontend SR", round: "R1 · 行为面", date: "昨天 21:10", dur: "32 min", score: "A−", color: "#181715" },
    { co: "Stripe", role: "Product Engineer", round: "Onsite · Coding", date: "5 月 12 日", dur: "65 min", score: "B", color: "#635bff" },
    { co: "Linear", role: "Frontend Engineer", round: "R1 · 项目深挖", date: "5 月 9 日", dur: "41 min", score: "A", color: "#5e6ad2" },
    { co: "Anthropic", role: "Product Engineer", round: "R2 · Take-home 复盘", date: "5 月 7 日", dur: "55 min", score: "B+", color: "#cc785c" },
  ];

  return (
    <div style={artboard}>
      <ExpandedSidebar active="mock" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.canvas }}>
        {/* Header band */}
        <div style={{ padding: "40px 56px 24px", borderBottom: `1px solid ${C.hairline}` }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                /mock · 历史
              </div>
              <h1 style={{
                fontFamily: FONT_SERIF, fontWeight: 500,
                fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.02em",
                color: C.ink, margin: 0,
              }}>
                你练了 <span style={{ color: C.primary }}>5</span> 场模拟面试。
              </h1>
            </div>
            <button style={btnPrimary}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="plus" size={14} color="#fff" />
                开始新的模拟
              </span>
            </button>
          </div>
          <div style={{ display: "flex", gap: 24, fontFamily: FONT_SANS, fontSize: 13, color: C.body }}>
            <span><strong style={{ color: C.ink }}>241 min</strong> <span style={{ color: C.muted }}>总时长</span></span>
            <span style={{ color: C.hairline }}>·</span>
            <span><strong style={{ color: C.ink }}>34</strong> <span style={{ color: C.muted }}>题数</span></span>
            <span style={{ color: C.hairline }}>·</span>
            <span><strong style={{ color: C.ink }}>B+</strong> <span style={{ color: C.muted }}>平均</span></span>
            <span style={{ color: C.hairline }}>·</span>
            <span style={{ color: C.primary }}>↗ 近三场表现持续上行</span>
          </div>
        </div>

        {/* Filter row */}
        <div style={{
          padding: "16px 56px", display: "flex", gap: 8, alignItems: "center",
          borderBottom: `1px solid ${C.hairlineSoft}`,
        }}>
          {["全部", "Google", "字节", "Stripe", "其它"].map((t, i) => (
            <span key={t} style={{
              padding: "6px 12px", borderRadius: 8,
              background: i === 0 ? C.cream : "transparent",
              color: i === 0 ? C.ink : C.muted,
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>{t}</span>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
            background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 8,
            width: 220,
          }}>
            <Icon name="search" size={13} color={C.muted} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.mutedSoft }}>搜索历史…</span>
          </div>
        </div>

        {/* List */}
        <div style={{ padding: "8px 32px 24px", overflow: "hidden" }}>
          {mocks.map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              padding: "16px 24px", borderRadius: 12,
              borderBottom: `1px solid ${C.hairlineSoft}`,
              cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, background: m.color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 500,
              }}>{m.co[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 500, color: C.ink, letterSpacing: "-0.01em" }}>{m.co}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.muted }}>{m.role}</span>
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted }}>{m.round}</div>
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, minWidth: 110, textAlign: "right" }}>{m.date}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.muted, minWidth: 60, textAlign: "right" }}>{m.dur}</div>
              <div style={{
                minWidth: 44, height: 32, borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 500, color: C.ink,
                background: C.card, padding: "0 12px",
              }}>{m.score}</div>
              <Icon name="arrow-right" size={16} color={C.muted} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Screen 7: Settings modal ────────────────────────────────────────

function ScreenSettings() {
  return (
    <div style={artboard}>
      <Rail active="settings" />
      <main style={{ flex: 1, position: "relative", background: C.canvas, overflow: "hidden" }}>
        {/* Dimmed background hint */}
        <div style={{ padding: "56px 64px", opacity: 0.35 }}>
          <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.02em", color: C.ink, margin: 0 }}>
            下一场面试，<br />从这里开始准备。
          </h1>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(20,20,19,0.32)" }} />

        {/* Modal */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 780, background: C.canvas, borderRadius: 16,
          boxShadow: "0 24px 64px rgba(20,20,19,0.18), 0 4px 12px rgba(20,20,19,0.08)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          maxHeight: 760,
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 28px 0", display: "flex", alignItems: "center", gap: 12,
          }}>
            <Icon name="settings" size={16} color={C.muted} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              /settings
            </span>
            <div style={{ flex: 1 }} />
            <Icon name="x" size={16} color={C.muted} />
          </div>
          <div style={{ padding: "12px 28px 0" }}>
            <h2 style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 500, color: C.ink, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
              告诉 OC 你是谁。
            </h2>
            <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.55 }}>
              这些信息只存在你的浏览器里（IndexedDB），不会上传到我们的服务器。
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            padding: "20px 28px 0", display: "flex", gap: 4, borderBottom: `1px solid ${C.hairline}`,
          }}>
            {[
              { label: "画像", active: true },
              { label: "模型 & API", active: false },
              { label: "用量", active: false },
            ].map(t => (
              <span key={t.label} style={{
                padding: "10px 14px", borderBottom: `2px solid ${t.active ? C.primary : "transparent"}`,
                color: t.active ? C.ink : C.muted, fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500,
                marginBottom: -1, cursor: "pointer",
              }}>{t.label}</span>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px", overflow: "auto", flex: 1 }}>
            {/* Field: target role */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Field label="目标岗位 *" hint="必填">
                <input style={input} defaultValue="高级前端工程师" />
              </Field>
              <Field label="工作年限">
                <input style={input} defaultValue="3 年" />
              </Field>
            </div>
            <Field label="技术栈" hint="逗号分隔，OC 会用来出题">
              <div style={{ ...input, display: "flex", gap: 6, flexWrap: "wrap", height: "auto", paddingTop: 8, paddingBottom: 8 }}>
                {["React", "TypeScript", "Node.js", "Next.js", "Tailwind"].map(s => (
                  <span key={s} style={{
                    background: C.card, color: C.ink,
                    fontFamily: FONT_SANS, fontSize: 13,
                    padding: "3px 10px", borderRadius: 999,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>{s} <Icon name="x" size={10} color={C.muted} /></span>
                ))}
                <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.mutedSoft, padding: "3px 4px" }}>+ 添加</span>
              </div>
            </Field>
            <Field label="目标公司">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Google", "字节跳动", "Stripe", "Anthropic"].map(c => (
                  <Pill key={c} tone="cream">{c} <Icon name="x" size={10} color={C.muted} /></Pill>
                ))}
                <Pill tone="outline">+ 添加</Pill>
              </div>
            </Field>
            <Field label="简历" hint="PDF · OC 会解析关键信息并记住">
              <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 12,
              }}>
                <div style={{
                  width: 40, height: 48, borderRadius: 4, background: C.card,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONT_MONO, fontSize: 10, color: C.muted, fontWeight: 500,
                }}>PDF</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.ink, fontWeight: 500 }}>YuxinTao_Resume_2026.pdf</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>342 KB · 已解析 · 12 段经历 · 4 个项目</div>
                </div>
                <button style={btnSecondary}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon name="upload" size={13} color={C.ink} /> 替换
                  </span>
                </button>
              </div>
            </Field>
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 28px", borderTop: `1px solid ${C.hairline}`,
            display: "flex", alignItems: "center", gap: 12, background: C.soft,
          }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted }}>
              <Icon name="check" size={12} color={C.success} /> 自动保存到本地
            </span>
            <div style={{ flex: 1 }} />
            <button style={btnSecondary}>取消</button>
            <button style={btnPrimary}>完成</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.ink, fontWeight: 500 }}>{label}</span>
        {hint && <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.mutedSoft }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const input = {
  width: "100%", height: 40,
  background: C.canvas, border: `1px solid ${C.hairline}`, borderRadius: 8,
  padding: "0 14px",
  fontFamily: FONT_SANS, fontSize: 14, color: C.ink,
  boxSizing: "border-box",
};

// ─── Artboard frame ──────────────────────────────────────────────────

const artboard = {
  width: 1320, height: 840,
  display: "flex",
  background: C.canvas,
  fontFamily: FONT_SANS,
  color: C.ink,
  overflow: "hidden",
};

Object.assign(window, {
  // atoms
  C, FONT_SERIF, FONT_SANS, FONT_MONO,
  Icon, SpikeMark, Mark, Pill, ModeBadge,
  Rail, ExpandedSidebar, Topbar, Composer, MsgAI, MsgUser, Field,
  btnPrimary, btnSecondary, btnGhost, input, kbd, inlineCode, artboard,
  // screens
  ScreenWelcome, ScreenSlash, ScreenMock, ScreenReview, ScreenPractice, ScreenHistory, ScreenSettings,
});
