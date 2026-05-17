"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { CommandDef } from "@/lib/commands";

export function SlashPalette({
  commands,
  selectedIndex,
  onPick,
  onHover,
}: {
  commands: CommandDef[];
  selectedIndex: number;
  onPick: (cmd: CommandDef) => void;
  onHover: (index: number) => void;
}) {
  return (
    <div
      role="listbox"
      aria-label="Slash commands"
      className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-canvas border border-hairline rounded-xl shadow-[0_12px_32px_rgba(20,20,19,0.08),0_2px_6px_rgba(20,20,19,0.04)] overflow-hidden z-30"
    >
      <div className="px-2.5 pt-1.5 pb-2 flex items-center gap-2 border-b border-hairline-soft">
        <Sparkles size={13} strokeWidth={1.8} className="text-primary" />
        <span className="text-[12px] font-medium tracking-[0.06em] uppercase text-muted">
          Slash commands
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[11px] text-muted-soft">
          ↑↓ 选择 · ⏎ 确认 · esc 关闭
        </span>
      </div>
      <div className="flex flex-col py-1.5">
        {commands.length === 0 ? (
          <div className="px-3 py-3 text-[13px] text-muted">未匹配到命令</div>
        ) : (
          commands.map((c, i) => {
            const Icon = c.icon;
            const active = i === selectedIndex;
            return (
              <button
                key={c.cmd}
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => onHover(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(c);
                }}
                className={clsx(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-lg mx-1 text-left transition-colors",
                  active ? "bg-surface-card" : "hover:bg-surface-soft",
                )}
              >
                <Icon
                  size={16}
                  strokeWidth={1.6}
                  className={active ? "text-primary" : "text-muted"}
                />
                <span
                  className={clsx(
                    "font-mono text-sm font-medium min-w-[96px]",
                    active ? "text-ink" : "text-body-strong",
                  )}
                >
                  /{c.cmd}
                </span>
                <span className="text-[13px] text-muted flex-1">{c.desc}</span>
                {active && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <ArrowRight size={10} strokeWidth={2} />
                    激活 /{c.cmd}
                  </span>
                )}
                <kbd>{c.hot}</kbd>
              </button>
            );
          })
        )}
      </div>
      <div className="px-3 pt-2 pb-1 border-t border-hairline-soft text-[11px] text-muted-soft">
        选中后：聊天框切换为对应 Mode · 当前对话归入该 Mode · 左侧 Tab 同步高亮
      </div>
    </div>
  );
}
