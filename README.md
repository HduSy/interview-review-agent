# OC-Review

> AI Native 面试助手 · 暖奶油色衬线对话界面 · 自带 5 家模型供应商接入

模拟、复盘、练习、预测、优化 — 求职面试的全流程协作都收在同一个对话框里。所有用户数据（画像、API Key、简历、聊天记录）仅留在浏览器 IndexedDB，不上云。

## 截图

设计灵感来自 Anthropic Claude 的暖奶油 + 珊瑚配色 + Copernicus 衬线大标题。

参考稿在 [`claude-design-files/`](./claude-design-files/)（含 React 设计画板与每个屏幕的 JSX 源），实物截图在 [`claude-pics/`](./claude-pics/)。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router · Turbopack） |
| UI | React 19 + Tailwind v4 + Lucide icons |
| 类型 | TypeScript 5 |
| 全局状态 | Zustand 5 |
| 本地持久化 | Dexie 4（IndexedDB） |
| AI | Vercel AI SDK 6 + Anthropic / OpenAI / Google / Zhipu providers |
| 包管理 | pnpm |

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

首次进入会停在欢迎页 — 这是空对话状态。要让 AI 真正回复，**至少配一个模型供应商 + API Key**：

1. 左侧 Rail 底部齿轮 → 「模型 & API」tab
2. 选一个 provider（Anthropic 推荐，国内可用智谱）
3. 粘 API Key → 焦点离开会自动拉取该供应商的可用模型列表
4. 关 modal，去聊天框右下角 ModelPicker 选具体模型
5. 任意消息 → 流式回复

未配置 key 时会走 demo 占位回复（已经包含 5 个模式的 rich card 演示数据），不影响视觉与交互调试。

## 核心功能

### Slash 命令

在聊天框输入 `/` 弹出命令面板：

| 命令 | 行为 |
|---|---|
| `/mock` | 切换为模拟面试 — AI 按目标公司风格扮演面试官，一问一深挖 |
| `/review` | 复盘 — 粘面试记录，AI 给 STAR scorecard + 强弱项双栏 + 改写示范 |
| `/practice` | 随堂练习 — 直接抽题（chips + 衬线题干 + 评分维度） |
| `/predict` | 预测题 — 基于 JD + 简历生成命中概率题库 |
| `/optimize` | 答案优化 — Before/After 对比卡（草稿划线 vs 暗色改写） |
| `/settings` | 打开设置 modal |

侧栏点击各模式 = 进入该模式的**历史列表**（按 PRD 设计，slash 与导航解耦）。

### 模型供应商

`/settings → 模型 & API` 支持：

- **Anthropic** · Claude 4.x（默认）
- **OpenAI** · GPT-4 / o-series
- **Google** · Gemini 系列
- **智谱** · GLM 系列（国内可直连）
- **Azure OpenAI** · 企业部署
- **Custom** · OpenAI 兼容端点

切换供应商时 Base URL 自动跳到对应默认值，也可填代理 / 自托管地址覆盖。

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # 流式聊天 edge 路由（streamText + 错误透传）
│   │   └── models/route.ts     # 拉取供应商可用模型清单
│   ├── globals.css             # Tailwind v4 + 设计 token
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── shell.tsx               # 顶层布局壳
│   ├── rail.tsx                # 64px 折叠侧栏
│   ├── expanded-sidebar.tsx    # 248px 展开侧栏
│   ├── welcome.tsx             # 空对话欢迎页
│   ├── mode-view.tsx           # 各模式聊天视图
│   ├── history-view.tsx        # 历史列表视图
│   ├── composer.tsx            # 输入框 + slash palette + model picker
│   ├── message-list.tsx        # 消息列表（流式 typing dots）
│   ├── mode-cards.tsx          # review/practice/predict/optimize 富卡片
│   ├── model-picker.tsx        # 右下角模型选择器（动态模型列表）
│   ├── settings-modal.tsx      # 画像/API/用量 三 tab modal
│   └── …
└── lib/
    ├── store.ts                # zustand store（视图 / 消息 / API 配置 / 模型）
    ├── db.ts                   # Dexie schema + 持久化辅助函数
    ├── commands.ts             # 6 个 mode 元数据
    ├── messages.ts             # Message 类型 + 4 种 rich payload 定义
    ├── demo-payloads.ts        # 未配 key 时的占位 demo 数据
    ├── models.ts               # 内置模型清单（fallback）
    ├── model-mapping.ts        # UI 模型 id → 各 provider 实际 id
    └── prompts.ts              # 各 mode 的 system prompt
```

## 设计规范

所有视觉细节遵循 [`DESIGN.md`](./DESIGN.md) — 暖奶油画布、Copernicus 衬线、珊瑚 CTA、暗色产品卡的交替节奏，是项目设计的单一真相来源。

产品定义见 [`PRD.md`](./PRD.md)。

## 隐私

- API Key、简历、画像、对话历史**全部存浏览器 IndexedDB**
- 每次对话都直接从浏览器把 key + 消息一起 POST 到自己的 `/api/chat`，server 即时构造 SDK 客户端调上游、不落盘、不打日志
- 没有用户系统，没有云端同步（PRD MVP 选择）

## 部署

Vercel 一键部署。`/api/chat` 与 `/api/models` 都跑在 edge runtime，无 cold start。

## License

MIT
