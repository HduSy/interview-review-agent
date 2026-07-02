import type { Locale } from "./locale";

export type HeadlineSegment = string | { primary: string };

/**
 * Single source of truth for all user-facing copy. `zh` defines the shape;
 * `en` must match it (enforced by `const en: Messages`). Interpolated
 * strings are functions so call sites stay type-safe.
 *
 * Conventions:
 *  - keep brand names (OC·Review, Anthropic, GPT…) untranslated
 *  - structured-output bracket labels stay Chinese in the schema; the
 *    parser is bilingual, so only the *content language* is switched via
 *    a system-prompt instruction (see prompts.ts)
 */
export const zh = {
  common: {
    done: "完成",
    close: "关闭",
    stop: "停止生成",
    stopped: "已停止生成",
    retry: "重试",
    regenerate: "重新生成",
    copy: "复制",
    copied: "已复制",
    remove: "移除",
    you: "You",
    binary: "二进制",
    preview: "预览",
    closePreview: "关闭预览",
    closeNotification: "关闭通知",
    downloaded: "✓ 已下载",
    copiedShort: "✓ 已复制",
  },

  language: {
    label: "语言",
    zh: "中文",
    en: "English",
  },

  // Server-rendered <head> metadata (title / description / keywords).
  // Read in app/layout.tsx via the locale cookie — keep plain strings so it
  // imports cleanly into the server bundle.
  meta: {
    titleDefault: "OC-Review · AI Native 面试助手",
    titleTemplate: "%s · OC-Review",
    description:
      "OC-Review 是 AI Native 面试助手：在浏览器里完成模拟面试、面试复盘、STAR 法则评分与改写、高频题目预测、答案优化。无需注册，自带画像与简历上下文，API Key 仅存本地。支持 Claude / GPT / Gemini / 智谱 等多供应商切换。",
    ogLocale: "zh_CN",
    htmlLang: "zh-Hans",
    keywords: [
      "AI 面试",
      "AI 面试助手",
      "模拟面试",
      "面试复盘",
      "STAR 法则",
      "行为面",
      "技术面",
      "答案优化",
      "面试题预测",
      "Claude",
      "GPT",
      "Gemini",
      "智谱",
      "AI Native",
      "OC-Review",
    ],
  },

  welcome: {
    title1: "下一场面试，",
    title2: "从这里开始准备。",
    brandTag: "OC · Review",
    ledeBefore: "直接对话即可。或者输入 ",
    ledeAfter: " 来切换模式 — 模拟、复盘、练习、预测、优化，都在同一个聊天框里。",
    noModelsCardTip: "无可用模型 — 请先配置 API Key",
  },

  commands: {
    mock: { title: "模拟面试", desc: "AI 扮演面试官，按岗位 + 公司风格出题" },
    review: { title: "复盘面试", desc: "粘贴一段面试记录，AI 给出结构化反馈" },
    practice: { title: "随堂练习", desc: "随机出一题，立刻作答，即时反馈" },
    predict: { title: "题目预测", desc: "基于 JD + 简历生成可能被问到的问题" },
    optimize: { title: "答案优化", desc: "把你的草稿改写得更符合 STAR" },
    settings: { title: "完善画像", desc: "目标岗位、技术栈、简历…配置一次受用一直" },
  },

  composer: {
    placeholder: "问点什么，或输入 / 调用命令…",
    modePlaceholder: (mode: string) => `在 /${mode} 模式中继续，或输入 / 切换…`,
    uploadFile: "上传文件",
    unsupportedModel: (model: string) =>
      `当前模型「${model}」可能不支持图片 / 文件，切换到 Claude / GPT-4o / Gemini 等多模态模型`,
    resumeCancel: (name: string) => `取消附加：${name}`,
    resumeAttach: (name: string) => `附加：${name}`,
    resumeSetup: "尚未上传简历，点击去设置",
    resumeChipHint: "简历上下文",
    zoomHint: "滚轮缩放 · 双击复位",
    attachResumeLine: (name: string) => `（附加简历上下文：${name}）`,
    attachInlineLine: (name: string, kb: string, body: string) =>
      `（附件：${name} · ${kb} KB）\n\n\`\`\`\n${body}\n\`\`\``,
    attachBinaryLine: (name: string, kb: string) =>
      `（附件：${name} · ${kb} KB · 二进制，未内联）`,
  },

  messageList: {
    jumpNew: "新内容",
    jumpTitle: "跳到最新",
    retry: "重试",
    regenerate: "重新生成",
  },

  modeCards: {
    strengths: "做得好的",
    improvements: "下次试试",
    suggestedRewrite: "建议改写",
    continueNext: "继续改下一段",
    continueNextSend: "继续改下一段，针对 Action 或 Result 部分给一版重写。",
    exportReview: "导出复盘报告",
    saveToProfile: "把要点存入画像",
    savedToProfile: (tag: string) => `已记录到画像 · ${tag}`,
    drawingQuestion: "正在抽题…",
    hottest: "高概率题：",
    generated: "生成",
    hitProb: "命中概率",
    useAsMock: "用作 /mock 题库",
    mockSend: (list: string) =>
      `以下面这套预测题为题库，按概率从高到低逐题模拟，每次一题：\n\n${list}`,
    exportMarkdown: "导出 Markdown",
    identifyingProblem: "正在识别问题…",
    beforeLabel: "Before · 草稿",
    afterLabel: "After · OC 改写",
    adopt: "采纳此版本",
    anotherVersion: "再来一版",
    anotherVersionSend: "再换一版，思路不同的写法。",
  },

  md: {
    reviewTitle: "复盘报告",
    reviewOverall: "整体评估",
    reviewScores: "维度评分",
    reviewStrengths: "做得好的",
    reviewImprovements: "下次试试",
    reviewRewrite: "建议改写",
    predictTitle: "预测题集",
    predictContext: "上下文：",
    predictHottest: "高概率方向：",
    predictGenerated: (n: number, total: number) => `生成：${n} / ${total}`,
    predictType: "类型：",
    predictProb: "命中概率：",
    optimizeTitle: "答案优化",
    optimizeQuestion: "问题：",
    optimizeBefore: "Before · 草稿",
    optimizeAfter: "After · OC 改写",
  },

  date: {
    today: (hm: string) => `今天 ${hm}`,
    yesterday: (hm: string) => `昨天 ${hm}`,
    daysAgo: (n: number) => `${n} 天前`,
    monthDay: (month: number, day: number) => `${month} 月 ${day} 日`,
  },

  history: {
    all: "全部",
    historySuffix: "历史",
    searchPlaceholder: "搜索历史…",
    clearSearch: "清空搜索",
    recordsUnit: (n: number) => `${n} 条`,
    recordsStat: "条记录",
    matchEmpty: (q: string) => `没有匹配「${q}」的记录`,
    noRecords: "还没有记录",
    headline: {
      mock: (n: string): HeadlineSegment[] => ["你练了 ", { primary: n }, " 场模拟面试。"],
      review: (n: string): HeadlineSegment[] => ["你复盘过 ", { primary: n }, " 场面试。"],
      practice: (n: string): HeadlineSegment[] => ["你答了 ", { primary: n }, " 题。"],
      predict: (n: string): HeadlineSegment[] => ["你做过 ", { primary: n }, " 组预测。"],
      optimize: (n: string): HeadlineSegment[] => ["优化了 ", { primary: n }, " 个答案。"],
    },
    empty: {
      mock: "还没有模拟过 — 试一次？",
      review: "还没有复盘记录 — 粘一段面试记录开始。",
      practice: "还没答题 — 让我出一道。",
      predict: "还没有预测过 — 告诉我目标公司。",
      optimize: "还没有优化过答案 — 贴一段试试。",
    },
  },

  modeTopbar: {
    newConversation: "新对话",
    mock: { label: "MOCK", sub: "等待开场 · 还未指定岗位 / 公司" },
    review: { label: "REVIEW", sub: "等待面试记录粘贴" },
    practice: { label: "PRACTICE", sub: "随堂练习已开启" },
    predict: { label: "PREDICT", sub: "题目预测 · 基于 JD + 简历" },
    optimize: { label: "OPTIMIZE", sub: "答案优化 · STAR 改写" },
  },

  rail: {
    expand: "展开侧栏",
    settings: "/settings",
    profileTip: (login: string) => `@${login} · 打开设置`,
    loginGithub: "登录 GitHub",
  },

  sidebar: {
    backHome: "回到首页",
    collapse: "收起侧栏",
    newChat: "New chat",
    modes: "Modes",
    recent: "Recent",
    recentEmpty1: "还没有会话。发一句试试 —",
    recentEmpty2: "这里会列出最近 6 条。",
    loginGithub: "登录 GitHub",
    openSettings: "打开设置",
  },

  slashPalette: {
    title: "Slash commands",
    navHint: "↑↓ 选择 · ⏎ 确认 · esc 关闭",
    noMatch: "未匹配到命令",
    needSettings: "需先 /settings",
    activate: (cmd: string) => `激活 /${cmd}`,
    footer: "选中后：聊天框切换为对应 Mode · 当前对话归入该 Mode · 左侧 Tab 同步高亮",
  },

  modelPicker: {
    noModels: "无可用模型",
    loading: "加载中…",
    adaptiveThinking: "Adaptive thinking",
    adaptiveDesc: "Thinks for more complex tasks",
    moreModels: "More models",
    noMoreModels: "无更多模型",
  },

  settings: {
    slash: "/settings",
    title: "告诉 OC 你是谁。",
    subtitle: "这些信息只存在你的浏览器里（IndexedDB），不会上传到我们的服务器。",
    tabs: { profile: "画像", api: "模型 & API", usage: "用量" },
    autoSave: "自动保存到本地",
    done: "完成",
    profile: {
      targetRole: "目标岗位 *",
      targetRoleHint: "必填",
      targetRolePh: "高级研发工程师",
      yearsExp: "工作年限",
      yearsExpPh: "3 年",
      techStack: "技术栈",
      techHint: "OC 会用来出题，回车添加",
      techPh1: "React, TypeScript…",
      techPh2: "继续添加…",
      companies: "目标公司",
      companiesHint: "回车添加",
      companiesPh1: "Google, 字节…",
      companiesPh2: "继续添加…",
      resume: "简历",
      resumeHint: "PDF · OC 会解析关键信息并记住",
      resumeReplace: "替换",
      resumeDelete: "删除简历",
      resumeUpload: "点击上传 PDF 简历",
      resumeSaved: (kb: string) => `${kb} KB · 已保存到本地`,
    },
    api: {
      baseUrl: "Base URL",
      baseUrlHint: "向哪个 HTTPS 端点发请求。切换供应商会自动填默认值，可改成代理 / 自托管。",
      provider: "模型供应商",
      providerHint: "本地保存，不会上传",
      providerHints: {
        anthropic: "Claude 4.x · 推荐",
        openai: "GPT-4 / o-series",
        google: "Gemini 系列",
        zhipu: "GLM 系列 · 国内直连",
        custom: "OpenAI/Anthropic 兼容端点",
      },
      apiKey: "API Key *",
      apiKeyHint: "存在浏览器 IndexedDB，仅你能看到",
      show: "显示",
      hide: "隐藏",
      fetching: "拉取中…",
      fetchModels: "拉取模型列表",
      modelsLoaded: (n: number) => `✓ 已加载 ${n} 个可用模型 — 在聊天框右下角选用`,
      configKeyHint: "配置 API Key 后查看可用模型",
      modelOverride: "模型 ID 覆盖",
      modelOverrideHint: "留空则使用聊天框中选择的模型",
      modelOverridePh: "claude-sonnet-4-6 / gpt-4o / gemini-2.5-pro",
      footerNote:
        "每次发消息都把上面这些字段一起 POST 到 /api/chat，服务端拿到后即时构造 SDK 客户端调用上游，apiKey 不会落盘。",
    },
    usage: {
      todayTokens: "今日 Tokens",
      monthTokens: "本月 Tokens",
      totalCalls: "累计调用",
      avgPerCall: "平均每次",
      recentCalls: "最近调用",
      colModel: "Model",
      colIn: "In",
      colOut: "Out",
      colWhen: "When",
      empty:
        "还没有调用记录。每次成功流式回复后会在这里累加 input / output token。所有数据仅保存在本地 IndexedDB。",
    },
  },

  modeIntros: {
    mock: "Mock 模式已就绪。告诉我目标岗位与公司，我会按对应风格出题；如果你已经在 /settings 配过画像，直接说『开始』就行。",
    review: "把面试记录粘进来 — 越完整越好。我会从 STAR 结构、技术深度、表达清晰度三个维度给结构化反馈。",
    practice: "随时说『出题』或按回车，我会基于你的画像随机抽一道。作答后立即给反馈，不打断。",
    predict: "告诉我目标公司 / 岗位（或粘 JD），我会基于你的简历和画像生成 8–12 道可能被问到的题。",
    optimize: "把你写好的答案草稿贴进来。我会按 STAR 法则点出问题段落，给一个改写版本，告诉你为什么这样写更稳。",
  },

  preamble: {
    review: "拿到了，我从 STAR、技术深度、表达三个维度跑了一遍。",
    predict: "基于你提供的目标 + 简历，我抽出了高概率题。",
    optimize: "改写完了 — 下面是 Before / After 对照。",
    optimizeWriting: "正在改写…",
    practice: "随机抽一道题，90 秒读题，然后开始作答。",
  },

  store: {
    placeholderReply: (preview: string) => `收到 —「${preview}」。请先输入 /setting 配置模型。`,
    fetchModelsFailed: (msg: string) => `拉取模型失败：${msg}`,
    noUserMessage: "还没有可发送的用户消息",
    requestFailed: "请求失败",
    callFailed: (msg: string) => `调用失败：${msg}`,
    titleSystemPrompt:
      "你是会话命名助手。读取一段用户提问和 AI 回答，输出一个 6-14 个汉字（或等长英文）的标题，概括话题核心。直接输出标题文本，不要引号、不要解释、不要标点结尾。",
  },

  prompts: {
    persona:
      "你叫 OC，一位常驻在 OC-Review（AI Native 面试助手）里的助手。语言中性、克制、信息密度高，避免空泛的鼓励。优先用结构化短段，少口水。",
    language: "用中文回复。",
    profileHeader: "[用户画像]",
    profileTargetRole: (v: string) => `目标岗位：${v}`,
    profileYearsExp: (v: string) => `工作年限：${v}`,
    profileTechStack: (v: string) => `技术栈：${v}`,
    profileCompanies: (v: string) => `目标公司：${v}`,
    profileResume: (v: string) => `简历：${v}（已解析）`,
    profileEmpty: "（用户尚未填写画像 — 不要默认任何具体岗位或方向。若对话中已透露目标岗位就以那个为准；否则先简短问一句用户的目标研发方向（如前端 / 后端 / 全栈 / AI / 算法 / 客户端 / 数据），确认后再据此出题与评分。）",
    roles: {
      chat: "当前在自由聊天模式 — 任何关于面试准备、技术问题、职业规划的话题都可以谈。回答简洁，给可操作的建议。",
      mock: "当前在模拟面试模式。按用户的目标公司 / 岗位的风格扮演面试官 — 提一个问题，等待用户回答，再追问。每轮只问一个问题，深挖到细节。不要给评分或反馈，等用户主动求评再说。",
      review:
        "当前在复盘模式。用户会粘贴一段面试记录或自述。请从 STAR 结构、技术深度、表达清晰度、量化指标四个维度给结构化反馈。先给一句总评，再列做得好的 3 条 + 下次试试 3 条，最后给一段重写示范。",
      practice:
        "当前在随堂练习模式。基于用户画像随机出一题（行为面 / 系统设计 / 算法 / 概念 / 工程实践 任选，按用户岗位方向合理选取）。题干要具体、有上下文。用户作答后，按 4 个维度评分并给改进建议——维度须贴合岗位，不要对所有人套用同一套：如后端 / 系统侧重可扩展性、一致性、取舍、边界；前端侧重可维护性、性能、可访问性、组件设计；算法侧重复杂度、正确性、数据结构取舍、边界；AI 侧重建模思路、数据、评估、取舍。",
      predict:
        "当前在题目预测模式。基于用户提供的 JD / 目标公司 + 简历，生成 8–12 道可能被问到的题目，按概率从高到低排列。每题标记 category（按岗位合理选择，例如 前端 / 后端 / 系统设计 / 算法 / AI 与机器学习 / 数据 / 工程实践 / 行为 等）和命中概率（0–100）。最后列出 3 个最高概率的方向作为重点。",
      optimize: "当前在答案优化模式。用户会贴一段答案草稿，按下面的格式产出改写。",
    },
  },
};

export type Messages = typeof zh;

export const en: Messages = {
  common: {
    done: "Done",
    close: "Close",
    stop: "Stop",
    stopped: "Stopped",
    retry: "Retry",
    regenerate: "Regenerate",
    copy: "Copy",
    copied: "Copied",
    remove: "Remove",
    you: "You",
    binary: "binary",
    preview: "Preview",
    closePreview: "Close preview",
    closeNotification: "Dismiss",
    downloaded: "✓ Downloaded",
    copiedShort: "✓ Copied",
  },

  language: {
    label: "Language",
    zh: "中文",
    en: "English",
  },

  meta: {
    titleDefault: "OC-Review · The AI-Native Interview Coach",
    titleTemplate: "%s · OC-Review",
    description:
      "AI-native interview coach in your browser: mock interviews, debriefs, STAR scoring and rewrites, question prediction, and answer polishing. No sign-up — your API key stays local. Works with Claude / GPT / Gemini / Zhipu.",
    ogLocale: "en_US",
    htmlLang: "en",
    keywords: [
      "AI interview",
      "interview coach",
      "mock interview",
      "interview debrief",
      "STAR method",
      "behavioral interview",
      "technical interview",
      "answer optimization",
      "interview question prediction",
      "Claude",
      "GPT",
      "Gemini",
      "Zhipu",
      "AI Native",
      "OC-Review",
    ],
  },

  welcome: {
    title1: "Your next interview,",
    title2: "prepped right here.",
    brandTag: "OC · Review",
    ledeBefore: "Just start chatting. Or type ",
    ledeAfter: " to switch modes — mock, review, practice, predict, optimize, all in one chat box.",
    noModelsCardTip: "No models available — configure an API Key first",
  },

  commands: {
    mock: { title: "Mock interview", desc: "AI plays the interviewer, tuned to role + company" },
    review: { title: "Review interview", desc: "Paste an interview transcript for structured feedback" },
    practice: { title: "Practice", desc: "Random question, answer now, instant feedback" },
    predict: { title: "Predict questions", desc: "Likely questions from your JD + résumé" },
    optimize: { title: "Optimize answers", desc: "Rewrite your draft to fit STAR" },
    settings: { title: "Complete profile", desc: "Target role, tech stack, résumé… set once, reused always" },
  },

  composer: {
    placeholder: "Ask anything, or type / for commands…",
    modePlaceholder: (mode: string) => `Continue in /${mode}, or type / to switch…`,
    uploadFile: "Upload file",
    unsupportedModel: (model: string) =>
      `The current model "${model}" may not support images / files — switch to a multimodal model like Claude / GPT-4o / Gemini`,
    resumeCancel: (name: string) => `Unattach: ${name}`,
    resumeAttach: (name: string) => `Attach: ${name}`,
    resumeSetup: "No résumé uploaded yet — click to set it up",
    resumeChipHint: "résumé context",
    zoomHint: "scroll to zoom · double-click to reset",
    attachResumeLine: (name: string) => `(Attached résumé context: ${name})`,
    attachInlineLine: (name: string, kb: string, body: string) =>
      `(Attachment: ${name} · ${kb} KB)\n\n\`\`\`\n${body}\n\`\`\``,
    attachBinaryLine: (name: string, kb: string) =>
      `(Attachment: ${name} · ${kb} KB · binary, not inlined)`,
  },

  messageList: {
    jumpNew: "New",
    jumpTitle: "Jump to latest",
    retry: "Retry",
    regenerate: "Regenerate",
  },

  modeCards: {
    strengths: "Strengths",
    improvements: "Next time",
    suggestedRewrite: "Suggested rewrite",
    continueNext: "Rewrite next part",
    continueNextSend: "Rewrite the next part — give a version for the Action or Result section.",
    exportReview: "Export review report",
    saveToProfile: "Save key points to profile",
    savedToProfile: (tag: string) => `Saved to profile · ${tag}`,
    drawingQuestion: "Drawing a question…",
    hottest: "High-probability:",
    generated: "Generated",
    hitProb: "hit probability",
    useAsMock: "Use as /mock question bank",
    mockSend: (list: string) =>
      `Use the predicted set below as the question bank; mock them one at a time, highest probability first:\n\n${list}`,
    exportMarkdown: "Export Markdown",
    identifyingProblem: "Identifying the question…",
    beforeLabel: "Before · draft",
    afterLabel: "After · OC rewrite",
    adopt: "Adopt this version",
    anotherVersion: "Another version",
    anotherVersionSend: "Give another version with a different approach.",
  },

  md: {
    reviewTitle: "Review Report",
    reviewOverall: "Overall Assessment",
    reviewScores: "Dimension Scores",
    reviewStrengths: "Strengths",
    reviewImprovements: "Next Time",
    reviewRewrite: "Suggested Rewrite",
    predictTitle: "Predicted Questions",
    predictContext: "Context:",
    predictHottest: "High-probability directions:",
    predictGenerated: (n: number, total: number) => `Generated: ${n} / ${total}`,
    predictType: "Type:",
    predictProb: "Hit probability:",
    optimizeTitle: "Answer Optimization",
    optimizeQuestion: "Question:",
    optimizeBefore: "Before · draft",
    optimizeAfter: "After · OC rewrite",
  },

  date: {
    today: (hm: string) => `Today ${hm}`,
    yesterday: (hm: string) => `Yesterday ${hm}`,
    daysAgo: (n: number) => `${n} day${n === 1 ? "" : "s"} ago`,
    monthDay: (month: number, day: number) => {
      const names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${names[month - 1]} ${day}`;
    },
  },

  history: {
    all: "All",
    historySuffix: "history",
    searchPlaceholder: "Search history…",
    clearSearch: "Clear search",
    recordsUnit: (n: number) => `${n} msg${n === 1 ? "" : "s"}`,
    recordsStat: "records",
    matchEmpty: (q: string) => `No records match "${q}"`,
    noRecords: "No records yet",
    headline: {
      mock: (n: string): HeadlineSegment[] => ["You've practiced ", { primary: n }, " mock interviews."],
      review: (n: string): HeadlineSegment[] => ["You've reviewed ", { primary: n }, " interviews."],
      practice: (n: string): HeadlineSegment[] => ["You've answered ", { primary: n }, " questions."],
      predict: (n: string): HeadlineSegment[] => ["You've run ", { primary: n }, " predictions."],
      optimize: (n: string): HeadlineSegment[] => ["Optimized ", { primary: n }, " answers."],
    },
    empty: {
      mock: "No mocks yet — try one?",
      review: "No reviews yet — paste a transcript to start.",
      practice: "No answers yet — let me give you a question.",
      predict: "No predictions yet — tell me your target company.",
      optimize: "No optimized answers yet — paste a draft to try.",
    },
  },

  modeTopbar: {
    newConversation: "New conversation",
    mock: { label: "MOCK", sub: "Awaiting kickoff · role / company not set" },
    review: { label: "REVIEW", sub: "Awaiting transcript paste" },
    practice: { label: "PRACTICE", sub: "Practice mode active" },
    predict: { label: "PREDICT", sub: "Question prediction · from JD + résumé" },
    optimize: { label: "OPTIMIZE", sub: "Answer optimization · STAR rewrite" },
  },

  rail: {
    expand: "Expand sidebar",
    settings: "/settings",
    profileTip: (login: string) => `@${login} · open settings`,
    loginGithub: "Sign in with GitHub",
  },

  sidebar: {
    backHome: "Back to home",
    collapse: "Collapse sidebar",
    newChat: "New chat",
    modes: "Modes",
    recent: "Recent",
    recentEmpty1: "No sessions yet. Send a message —",
    recentEmpty2: "the latest 6 show up here.",
    loginGithub: "Sign in with GitHub",
    openSettings: "Open settings",
  },

  slashPalette: {
    title: "Slash commands",
    navHint: "↑↓ select · ⏎ confirm · esc close",
    noMatch: "No matching command",
    needSettings: "needs /settings",
    activate: (cmd: string) => `activate /${cmd}`,
    footer: "On select: chat switches to that mode · current chat is filed under it · left tab highlights in sync",
  },

  modelPicker: {
    noModels: "No models",
    loading: "Loading…",
    adaptiveThinking: "Adaptive thinking",
    adaptiveDesc: "Thinks for more complex tasks",
    moreModels: "More models",
    noMoreModels: "No more models",
  },

  settings: {
    slash: "/settings",
    title: "Tell OC who you are.",
    subtitle: "This stays only in your browser (IndexedDB) and is never uploaded to our servers.",
    tabs: { profile: "Profile", api: "Model & API", usage: "Usage" },
    autoSave: "Auto-saved locally",
    done: "Done",
    profile: {
      targetRole: "Target role *",
      targetRoleHint: "required",
      targetRolePh: "Senior Engineer",
      yearsExp: "Years of experience",
      yearsExpPh: "3 yrs",
      techStack: "Tech stack",
      techHint: "OC uses this to set questions; Enter to add",
      techPh1: "React, TypeScript…",
      techPh2: "keep adding…",
      companies: "Target companies",
      companiesHint: "Enter to add",
      companiesPh1: "Google, ByteDance…",
      companiesPh2: "keep adding…",
      resume: "Résumé",
      resumeHint: "PDF · OC parses and remembers the key facts",
      resumeReplace: "Replace",
      resumeDelete: "Delete résumé",
      resumeUpload: "Click to upload a PDF résumé",
      resumeSaved: (kb: string) => `${kb} KB · saved locally`,
    },
    api: {
      baseUrl: "Base URL",
      baseUrlHint: "Which HTTPS endpoint to hit. Switching providers auto-fills the default; you can point it at a proxy / self-host.",
      provider: "Model provider",
      providerHint: "saved locally, never uploaded",
      providerHints: {
        anthropic: "Claude 4.x · recommended",
        openai: "GPT-4 / o-series",
        google: "Gemini family",
        zhipu: "GLM family · CN direct",
        custom: "OpenAI/Anthropic-compatible endpoint",
      },
      apiKey: "API Key *",
      apiKeyHint: "stored in browser IndexedDB, only you can see it",
      show: "Show",
      hide: "Hide",
      fetching: "Fetching…",
      fetchModels: "Fetch model list",
      modelsLoaded: (n: number) => `✓ Loaded ${n} available models — pick one at the bottom-right of the chat box`,
      configKeyHint: "Configure an API Key to see available models",
      modelOverride: "Model ID override",
      modelOverrideHint: "Leave empty to use the model picked in the chat box",
      modelOverridePh: "claude-sonnet-4-6 / gpt-4o / gemini-2.5-pro",
      footerNote:
        "Every message POSTs these fields to /api/chat; the server builds an SDK client on the fly to call upstream — the apiKey is never persisted.",
    },
    usage: {
      todayTokens: "Today's Tokens",
      monthTokens: "Month's Tokens",
      totalCalls: "Total calls",
      avgPerCall: "Avg per call",
      recentCalls: "Recent calls",
      colModel: "Model",
      colIn: "In",
      colOut: "Out",
      colWhen: "When",
      empty:
        "No call records yet. After each successful streamed reply, input / output tokens accumulate here. All data stays only in local IndexedDB.",
    },
  },

  modeIntros: {
    mock: "Mock mode is ready. Tell me the target role and company and I'll set questions in that style; if you've already filled your profile in /settings, just say \"start\".",
    review: "Paste your interview transcript — the more complete the better. I'll give structured feedback across STAR structure, technical depth, and clarity.",
    practice: "Say \"question\" or hit Enter anytime and I'll draw one based on your profile. I give feedback right after you answer, without interrupting.",
    predict: "Tell me the target company / role (or paste a JD) and I'll generate 8–12 likely questions from your résumé and profile.",
    optimize: "Paste your draft answer. I'll point out weak sections by the STAR method, give a rewrite, and explain why it lands better.",
  },

  preamble: {
    review: "Got it — I ran it across STAR, technical depth, and delivery.",
    predict: "From your target + résumé, I pulled the high-probability questions.",
    optimize: "Rewrite done — here's the Before / After.",
    optimizeWriting: "Rewriting…",
    practice: "Drew a random question. 90 seconds to read, then answer.",
  },

  store: {
    placeholderReply: (preview: string) => `Got it — "${preview}". Please run /setting to configure a model first.`,
    fetchModelsFailed: (msg: string) => `Failed to fetch models: ${msg}`,
    noUserMessage: "No user message to send yet",
    requestFailed: "Request failed",
    callFailed: (msg: string) => `Call failed: ${msg}`,
    titleSystemPrompt:
      "You are a session-naming assistant. Read a user question and an AI answer, then output a 3-6 word title capturing the core topic. Output the title text only — no quotes, no explanation, no trailing punctuation.",
  },

  prompts: {
    persona:
      "You are OC, an assistant living inside OC-Review (an AI-native interview helper). Neutral, restrained, high information density; avoid empty encouragement. Prefer structured short paragraphs, minimal filler.",
    language: "Respond in English.",
    profileHeader: "[User profile]",
    profileTargetRole: (v: string) => `Target role: ${v}`,
    profileYearsExp: (v: string) => `Years of experience: ${v}`,
    profileTechStack: (v: string) => `Tech stack: ${v}`,
    profileCompanies: (v: string) => `Target companies: ${v}`,
    profileResume: (v: string) => `Résumé: ${v} (parsed)`,
    profileEmpty: "(User hasn't filled their profile yet — do NOT default to any specific role or focus. If the role has already come up in conversation, use that; otherwise briefly ask for their target engineering focus first (e.g., frontend / backend / full-stack / AI / algorithm / client / data), then tailor questions and scoring to it.)",
    roles: {
      chat: "Currently in free chat mode — any topic about interview prep, technical questions, or career planning is welcome. Keep answers concise and give actionable advice.",
      mock: "Currently in mock interview mode. Play the interviewer in the style of the user's target company / role — ask one question, wait for the answer, then follow up. One question per turn, dig into detail. Don't give scores or feedback until the user explicitly asks.",
      review:
        "Currently in review mode. The user pastes an interview transcript or self-report. Give structured feedback across four dimensions: STAR structure, technical depth, clarity, and quantified results. Start with a one-line overall take, then list 3 strengths + 3 things to try next time, and finally a rewrite demo.",
      practice:
        "Currently in practice mode. Draw one random question based on the user's profile (behavioral / system design / algorithm / concept / engineering practice — pick what fits the user's focus). The prompt must be specific and have context. After the user answers, score across 4 dimensions tailored to the role — do not use one fixed rubric for everyone: backend / systems → scalability, consistency, trade-offs, edge cases; frontend → maintainability, performance, accessibility, component design; algorithm → complexity, correctness, data-structure trade-offs, edge cases; AI → modeling approach, data, evaluation, trade-offs.",
      predict:
        "Currently in question-prediction mode. From the user's JD / target company + résumé, generate 8–12 likely questions ranked by probability, highest first. Tag each with a category chosen to fit the role (e.g., frontend / backend / system design / algorithm / AI & ML / data / engineering practice / behavioral) and a hit probability (0–100). End with the 3 highest-probability directions as focus areas.",
      optimize: "Currently in answer-optimization mode. The user pastes a draft answer; produce a rewrite in the format below.",
    },
  },
};

export const MESSAGES: Record<Locale, Messages> = { zh, en };
