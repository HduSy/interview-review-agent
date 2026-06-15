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

// `title` / `desc` live in the i18n dictionary keyed by `id`
// (MESSAGES[locale].commands[id]); read them via useT() at render time.
// `chat` is never a slash command (it's the default mode), so the id is the
// non-chat modes plus settings — this also lets `t.commands[id]` index cleanly.
export type CommandDef = {
  id: Exclude<ModeId, "chat"> | "settings";
  cmd: string;
  hot: string;
  icon: LucideIcon;
};

export const COMMANDS: CommandDef[] = [
  { id: "mock", cmd: "mock", hot: "M", icon: UserRound },
  { id: "review", cmd: "review", hot: "R", icon: ClipboardList },
  { id: "practice", cmd: "practice", hot: "P", icon: Layers },
  { id: "predict", cmd: "predict", hot: "F", icon: Sparkles },
  { id: "optimize", cmd: "optimize", hot: "O", icon: Wand2 },
  { id: "settings", cmd: "settings", hot: ",", icon: SettingsIcon },
];

export const RAIL_MODES: { id: ModeId; cmd: string; icon: LucideIcon }[] = [
  { id: "chat", cmd: "chat", icon: MessageSquare },
  { id: "mock", cmd: "mock", icon: UserRound },
  { id: "review", cmd: "review", icon: ClipboardList },
  { id: "practice", cmd: "practice", icon: Layers },
  { id: "predict", cmd: "predict", icon: Sparkles },
  { id: "optimize", cmd: "optimize", icon: Wand2 },
];
