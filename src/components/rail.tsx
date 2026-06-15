"use client";

import { Github, PanelLeft, Settings as SettingsIcon } from "lucide-react";
import clsx from "clsx";
import { RAIL_MODES } from "@/lib/commands";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n/use-t";

export function Rail() {
  const view = useAppStore((s) => s.view);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const selectSidebarMode = useAppStore((s) => s.selectSidebarMode);
  const openSettings = useAppStore((s) => s.openSettings);
  const expandSidebar = useAppStore((s) => s.expandSidebar);
  const githubUser = useAppStore((s) => s.githubUser);
  const authChecked = useAppStore((s) => s.authChecked);
  const t = useT();

  const activeMode = view.kind === "history" ? view.mode : "chat";

  return (
    <aside className="w-16 bg-surface-soft border-r border-hairline px-3 py-4 flex flex-col items-center gap-2.5 shrink-0">
      <button
        onClick={expandSidebar}
        aria-label={t.rail.expand}
        title={t.rail.expand}
        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface-card text-muted hover:text-ink"
      >
        <PanelLeft size={18} strokeWidth={1.6} />
      </button>
      {RAIL_MODES.map((m) => {
        const Icon = m.icon;
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            title={`/${m.cmd}`}
            onClick={() => selectSidebarMode(m.id)}
            className={clsx(
              "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
              isActive
                ? "bg-surface-cream-strong text-ink"
                : "text-muted hover:bg-surface-card",
            )}
          >
            <Icon size={18} strokeWidth={1.6} />
          </button>
        );
      })}
      <div className="flex-1" />
      <button
        title="/settings"
        onClick={() => openSettings()}
        className={clsx(
          "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
          settingsOpen
            ? "bg-surface-cream-strong text-ink"
            : "text-muted hover:bg-surface-card",
        )}
      >
        <SettingsIcon size={18} strokeWidth={1.6} />
      </button>
      {githubUser ? (
        <button
          onClick={() => openSettings()}
          title={t.rail.profileTip(githubUser.login)}
          className="w-8 h-8 rounded-full overflow-hidden bg-surface-card mt-1.5 hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={githubUser.avatarUrl}
            alt={githubUser.login}
            className="w-full h-full object-cover"
          />
        </button>
      ) : (
        <a
          href={authChecked ? "/api/auth/github" : undefined}
          title={authChecked ? t.rail.loginGithub : ""}
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center mt-1.5 transition-colors",
            authChecked
              ? "bg-surface-card text-muted hover:bg-surface-cream-strong hover:text-ink"
              : "bg-surface-card text-muted-soft",
          )}
        >
          <Github size={14} strokeWidth={1.8} />
        </a>
      )}
    </aside>
  );
}
