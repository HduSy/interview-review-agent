"use client";

import clsx from "clsx";
import { SpikeMark } from "./spike-mark";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import { COMMANDS } from "@/lib/commands";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n/use-t";

export function Welcome() {
  const activate = useAppStore((s) => s.activateChatMode);
  const openSettings = useAppStore((s) => s.openSettings);
  const messages = useAppStore((s) => s.messages);
  const availableModels = useAppStore((s) => s.availableModels);
  const hasModels = availableModels.length > 0;
  const t = useT();

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto px-6 sm:px-16 pt-14 pb-4">
          <div className="max-w-3xl mx-auto w-full">
            <h1
              className="font-medium text-ink m-0 mb-3 text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t.welcome.title1}
              <br />
              {t.welcome.title2}
            </h1>
            <div className="flex items-center gap-2.5 mb-7">
              <SpikeMark size={20} color="var(--color-ink)" />
              <span className="font-medium text-xs tracking-[0.06em] uppercase text-primary">
                {t.welcome.brandTag}
              </span>
            </div>
            <p className="text-base sm:text-[17px] leading-[1.55] text-body max-w-[560px] mb-9">
              {t.welcome.ledeBefore}
              <code className="font-mono text-[13px] bg-surface-card text-ink px-1.5 py-0.5 rounded">
                /
              </code>
              {t.welcome.ledeAfter}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
              {COMMANDS.map((c) => {
                const Icon = c.icon;
                const disabled = !hasModels && c.id !== "settings";
                const cmd = t.commands[c.id];
                return (
                  <button
                    key={c.cmd}
                    disabled={disabled}
                    onClick={() =>
                      !hasModels ? openSettings("api") : activate(c.id)
                    }
                    title={disabled ? t.welcome.noModelsCardTip : undefined}
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
                    <div className="text-sm font-medium text-ink">{cmd.title}</div>
                    <div className="text-[13px] text-muted leading-[1.5]">{cmd.desc}</div>
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
