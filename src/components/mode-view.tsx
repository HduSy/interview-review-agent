"use client";

import type { ModeId } from "@/lib/commands";
import { Topbar } from "./topbar";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import { useAppStore } from "@/lib/store";

const MODE_TOPBAR: Record<Exclude<ModeId, "chat">, { label: string; sub: string }> = {
  mock: { label: "MOCK", sub: "等待开场 · 还未指定岗位 / 公司" },
  review: { label: "REVIEW", sub: "等待面试记录粘贴" },
  practice: { label: "PRACTICE", sub: "随堂练习已开启" },
  predict: { label: "PREDICT", sub: "题目预测 · 基于 JD + 简历" },
  optimize: { label: "OPTIMIZE", sub: "答案优化 · STAR 改写" },
};

export function ModeView({ mode }: { mode: Exclude<ModeId, "chat"> }) {
  const messages = useAppStore((s) => s.messages);
  const meta = MODE_TOPBAR[mode];

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      <Topbar mode={meta.label} sub={meta.sub} />
      <MessageList messages={messages} />
      <Composer placeholder={`在 /${mode} 模式中继续，或输入 / 切换…`} />
    </main>
  );
}
