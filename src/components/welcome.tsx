"use client";

import clsx from "clsx";
import { SpikeMark } from "./spike-mark";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import { COMMANDS } from "@/lib/commands";
import { useAppStore } from "@/lib/store";

export function Welcome() {
  const activate = useAppStore((s) => s.activateChatMode);
  const openSettings = useAppStore((s) => s.openSettings);
  const messages = useAppStore((s) => s.messages);
  const availableModels = useAppStore((s) => s.availableModels);
  const hasModels = availableModels.length > 0;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto px-6 sm:px-16 pt-14 pb-4">
          <div className="max-w-3xl mx-auto w-full">
            <h1
              className="font-medium text-ink m-0 mb-3 text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              下一场面试，
              <br />
              从这里开始准备。
            </h1>
            <div className="flex items-center gap-2.5 mb-7">
              <SpikeMark size={20} color="var(--color-primary)" />
              <span className="font-medium text-xs tracking-[0.06em] uppercase text-primary">
                OC · Review
              </span>
            </div>
            <p className="text-base sm:text-[17px] leading-[1.55] text-body max-w-[560px] mb-9">
              直接对话即可。或者输入{" "}
              <code className="font-mono text-[13px] bg-surface-card text-ink px-1.5 py-0.5 rounded">
                /
              </code>{" "}
              来切换模式 — 模拟、复盘、练习、预测、优化，都在同一个聊天框里。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
              {COMMANDS.map((c) => {
                const Icon = c.icon;
                const disabled = !hasModels && c.id !== "settings";
                return (
                  <button
                    key={c.cmd}
                    disabled={disabled}
                    onClick={() =>
                      !hasModels ? openSettings("api") : activate(c.id)
                    }
                    title={disabled ? "无可用模型 — 请先配置 API Key" : undefined}
                    className={clsx(
                      "text-left bg-canvas border border-hairline rounded-xl p-4 flex flex-col gap-2 transition-colors",
                      disabled
                        ? "opacity-50"
                        : "hover:border-primary/40 hover:bg-surface-soft",
                    )}
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <Icon size={14} strokeWidth={1.8} />
                      <span className="font-mono text-xs font-medium">/{c.cmd}</span>
                    </div>
                    <div className="text-sm font-medium text-ink">{c.title}</div>
                    <div className="text-[13px] text-muted leading-[1.5]">{c.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}
      <Composer />
    </main>
  );
}
