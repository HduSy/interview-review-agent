"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import type { ModeId } from "@/lib/commands";
import type { Session } from "@/lib/db";
import { formatRelativeDate } from "@/lib/date";
import { buildHistoryMeta } from "@/lib/history-meta";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n/use-t";
import { HistoryShell } from "./history-shell";

export function HistoryView({ mode }: { mode: Exclude<ModeId, "chat"> }) {
  const t = useT();
  const [filter, setFilter] = useState<string>(t.history.all);
  const [search, setSearch] = useState("");
  const sessions = useAppStore((s) => s.sessions);

  useEffect(() => {
    setFilter(t.history.all);
    setSearch("");
  }, [mode, t.history.all]);

  const realForMode = useMemo(
    () => sessions.filter((s) => s.mode === mode),
    [sessions, mode],
  );

  const meta = useMemo(
    () => buildHistoryMeta(mode, realForMode.length, t),
    [mode, realForMode.length, t],
  );

  const q = search.trim().toLowerCase();
  const filtered = q
    ? realForMode.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.messages.some((m) => m.content.toLowerCase().includes(q)),
      )
    : realForMode;

  return (
    <HistoryShell
      mode={mode}
      meta={meta}
      activeFilter={filter}
      onSelectFilter={setFilter}
      search={search}
      onSearchChange={setSearch}
    >
      <SessionList items={filtered} empty={emptyMsg(filtered.length, q, t)} />
    </HistoryShell>
  );
}

function emptyMsg(
  count: number,
  q: string,
  t: ReturnType<typeof useT>,
): string | null {
  if (count > 0) return null;
  return q ? t.history.matchEmpty(q) : t.history.noRecords;
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="text-center text-[13px] text-muted-soft py-16">{msg}</div>;
}

function SessionList({
  items,
  empty,
}: {
  items: Session[];
  empty: string | null;
}) {
  const load = useAppStore((s) => s.loadSession);
  const t = useT();
  if (empty) return <EmptyState msg={empty} />;
  return (
    <div>
      {items.map((s) => {
        const turns = s.messages.filter((m) => !m.pending).length;
        const lastUser = [...s.messages]
          .reverse()
          .find((m) => m.role === "user" && m.content.trim());
        const subtitle = lastUser?.content.trim() ?? "";
        return (
          <button
            key={s.id}
            onClick={() => void load(s.id)}
            className="w-full flex items-center gap-5 px-6 py-4 border-b border-hairline-soft text-left hover:bg-surface-soft transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-surface-card text-muted flex items-center justify-center shrink-0">
              <MessageSquare size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-medium text-ink text-[18px] tracking-[-0.01em] truncate"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {s.title}
              </div>
              {subtitle ? (
                <div className="text-[13px] text-muted truncate mt-0.5">
                  {subtitle}
                </div>
              ) : null}
            </div>
            <div className="font-mono text-[11px] text-muted min-w-[60px] text-right">
              {t.history.recordsUnit(turns)}
            </div>
            <div className="text-[13px] text-muted min-w-[110px] text-right">
              {formatRelativeDate(s.updatedAt)}
            </div>
            <ArrowRight size={16} strokeWidth={1.8} className="text-muted shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
