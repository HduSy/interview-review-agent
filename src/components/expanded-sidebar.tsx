"use client";

import clsx from "clsx";
import { PanelLeft, Plus, Settings as SettingsIcon } from "lucide-react";
import { Wordmark } from "./spike-mark";
import { RAIL_MODES, type ModeId } from "@/lib/commands";
import { HISTORY_STUB, RECENT_ITEMS } from "@/lib/history-stub";
import { useAppStore } from "@/lib/store";

export function ExpandedSidebar() {
  const view = useAppStore((s) => s.view);
  const selectSidebarMode = useAppStore((s) => s.selectSidebarMode);
  const collapseSidebar = useAppStore((s) => s.collapseSidebar);
  const newChat = useAppStore((s) => s.newChat);
  const openSettings = useAppStore((s) => s.openSettings);
  const loadHistoryItem = useAppStore((s) => s.loadHistoryItem);
  const chatMode = useAppStore((s) => s.chatMode);

  return (
    <aside className="w-[248px] bg-surface-soft border-r border-hairline px-4 py-5 flex flex-col gap-1 shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <Wordmark size={18} />
        <button
          onClick={collapseSidebar}
          aria-label="收起侧栏"
          title="收起侧栏"
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-surface-card -mr-2"
        >
          <PanelLeft size={18} strokeWidth={1.6} />
        </button>
      </div>
      <button
        onClick={newChat}
        className="flex items-center gap-2 px-3 py-2 bg-ink text-white rounded-md text-[13px] font-medium hover:opacity-90 mb-4"
      >
        <Plus size={14} strokeWidth={2} className="text-white" />
        New chat
      </button>
      <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted-soft px-3 pt-2 pb-1.5">
        Modes
      </div>
      {RAIL_MODES.map((m) => {
        const Icon = m.icon;
        const isHistory = view.kind === "history" && view.mode === m.id;
        const isChat = view.kind === "chat" && m.id === "chat";
        const active = isHistory || isChat;
        const count =
          m.id === "chat" ? 12 : HISTORY_STUB[m.id as Exclude<ModeId, "chat">]?.length ?? 0;
        return (
          <button
            key={m.id}
            onClick={() => selectSidebarMode(m.id)}
            className={clsx(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
              active
                ? "bg-surface-cream-strong text-ink font-medium"
                : "text-body hover:bg-surface-card",
            )}
          >
            <Icon
              size={15}
              strokeWidth={1.6}
              className={active ? "text-ink" : "text-muted"}
            />
            <span>/{m.cmd}</span>
            <span className="ml-auto font-mono text-[11px] text-muted-soft">{count}</span>
          </button>
        );
      })}
      <div className="h-px bg-hairline mx-2 my-4" />
      <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted-soft px-3 pb-1.5">
        Recent
      </div>
      {RECENT_ITEMS.map((r) => {
        const active = view.kind === "chat" && chatMode === r.mode;
        return (
          <button
            key={`${r.mode}:${r.itemId}`}
            onClick={() => loadHistoryItem(r.mode, r.itemId)}
            title={`/${r.mode} · ${r.title}`}
            className={clsx(
              "px-3 py-1.5 rounded-md text-[13px] text-left whitespace-nowrap overflow-hidden text-ellipsis",
              active ? "bg-surface-card text-ink" : "text-body hover:bg-surface-card",
            )}
          >
            {r.title}
          </button>
        );
      })}
      <div className="flex-1" />
      <button
        onClick={() => openSettings()}
        className="flex items-center gap-2.5 p-2.5 rounded-md bg-canvas border border-hairline hover:bg-surface-card transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-full bg-surface-dark text-on-dark flex items-center justify-center text-[11px] font-medium shrink-0">
          YT
        </div>
        <div className="flex flex-col leading-tight flex-1 min-w-0">
          <span className="text-[13px] text-ink font-medium">Yuxin Tao</span>
          <span className="font-mono text-[11px] text-muted truncate">claude-sonnet-4.5</span>
        </div>
        <SettingsIcon size={15} strokeWidth={1.6} className="text-muted" />
      </button>
    </aside>
  );
}
