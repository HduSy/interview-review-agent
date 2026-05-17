import {
  MessageSquare,
  UserRound,
  ClipboardList,
  Layers,
  Sparkles,
  Wand2,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export type ModeId = "chat" | "mock" | "review" | "practice" | "predict" | "optimize";

export type CommandDef = {
  id: ModeId | "settings";
  cmd: string;
  title: string;
  desc: string;
  hot: string;
  icon: LucideIcon;
};

export const COMMANDS: CommandDef[] = [
  { id: "mock", cmd: "mock", title: "模拟面试", desc: "AI 扮演面试官，按岗位 + 公司风格出题", hot: "M", icon: UserRound },
  { id: "review", cmd: "review", title: "复盘面试", desc: "粘贴一段面试记录，AI 给出结构化反馈", hot: "R", icon: ClipboardList },
  { id: "practice", cmd: "practice", title: "随堂练习", desc: "随机出一题，立刻作答，即时反馈", hot: "P", icon: Layers },
  { id: "predict", cmd: "predict", title: "题目预测", desc: "基于 JD + 简历生成可能被问到的问题", hot: "F", icon: Sparkles },
  { id: "optimize", cmd: "optimize", title: "答案优化", desc: "把你的草稿改写得更符合 STAR", hot: "O", icon: Wand2 },
  { id: "settings", cmd: "settings", title: "完善画像", desc: "目标岗位、技术栈、简历…配置一次受用一直", hot: ",", icon: SettingsIcon },
];

export const RAIL_MODES: { id: ModeId; cmd: string; icon: LucideIcon }[] = [
  { id: "chat", cmd: "chat", icon: MessageSquare },
  { id: "mock", cmd: "mock", icon: UserRound },
  { id: "review", cmd: "review", icon: ClipboardList },
  { id: "practice", cmd: "practice", icon: Layers },
  { id: "predict", cmd: "predict", icon: Sparkles },
  { id: "optimize", cmd: "optimize", icon: Wand2 },
];
