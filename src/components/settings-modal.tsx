"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, EyeOff, Settings as SettingsIcon, Upload, X } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "@/lib/store";
import type { Provider } from "@/lib/db";
import { PROVIDER_DEFAULT_URL } from "@/lib/db";
import { useT } from "@/lib/i18n/use-t";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { ImeInput } from "./ime-input";

export function SettingsModal() {
  const open = useAppStore((s) => s.settingsOpen);
  const tab = useAppStore((s) => s.settingsTab);
  const setTab = useAppStore((s) => s.setSettingsTab);
  const close = useAppStore((s) => s.closeSettings);
  const t = useT();

  const TABS: { id: "profile" | "api" | "usage"; label: string }[] = [
    { id: "profile", label: t.settings.tabs.profile },
    { id: "api", label: t.settings.tabs.api },
    { id: "usage", label: t.settings.tabs.usage },
  ];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="settings"
      onClick={close}
      className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center px-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-canvas rounded-2xl border border-hairline shadow-[0_24px_64px_rgba(20,20,19,0.18),0_4px_12px_rgba(20,20,19,0.08)] w-full max-w-[780px] max-h-[760px] overflow-hidden flex flex-col"
      >
        <div className="px-7 pt-5 flex items-center gap-3">
          <SettingsIcon size={16} strokeWidth={1.8} className="text-muted" />
          <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
            {t.settings.slash}
          </span>
          <div className="flex-1" />
          <LanguageToggle />
          <button onClick={close} className="text-muted hover:text-ink">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        <div className="px-7 pt-3">
          <h2
            className="text-[28px] font-medium tracking-[-0.02em] text-ink m-0 mb-1.5"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t.settings.title}
          </h2>
          <p className="text-sm text-muted leading-[1.55]">
            {t.settings.subtitle}
          </p>
        </div>

        <div className="px-7 pt-5 flex gap-1 border-b border-hairline">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "px-3.5 py-2.5 -mb-px text-sm font-medium transition-colors",
                t.id === tab
                  ? "text-ink border-b-2 border-primary"
                  : "text-muted hover:text-ink border-b-2 border-transparent",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {tab === "profile" && <ProfileTab />}
          {tab === "api" && <ApiTab />}
          {tab === "usage" && <UsageTab />}
        </div>

        <div className="px-7 py-4 border-t border-hairline bg-surface-soft flex items-center gap-3">
          <span className="text-xs text-muted inline-flex items-center gap-1.5">
            <Check size={12} strokeWidth={2} className="text-success" />
            {t.settings.autoSave}
          </span>
          <div className="flex-1" />
          <button
            onClick={close}
            className="bg-canvas text-ink border border-hairline text-sm font-medium px-4 py-2 rounded-md hover:bg-surface-card"
          >
            {t.settings.done}
          </button>
        </div>
      </div>
    </div>
  );
}

function LanguageToggle() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const t = useT();
  const labels: Record<Locale, string> = { zh: t.language.zh, en: t.language.en };
  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-surface-card border border-hairline"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={clsx(
            "px-2 py-0.5 rounded text-[12px] font-medium transition-colors",
            locale === l
              ? "bg-canvas text-ink shadow-[0_1px_2px_rgba(20,20,19,0.08)]"
              : "text-muted hover:text-ink",
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4.5" style={{ marginBottom: 18 }}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        {hint && <span className="text-[12px] text-muted-soft">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-10 bg-canvas border border-hairline rounded-md px-3.5 text-[14px] text-ink outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(204,120,92,0.15)]";

function ProfileTab() {
  const profile = useAppStore((s) => s.profile);
  const update = useAppStore((s) => s.updateProfile);
  const uploadResume = useAppStore((s) => s.uploadResume);
  const removeResume = useAppStore((s) => s.removeResume);
  const t = useT();
  const tp = t.settings.profile;
  const fileRef = useRef<HTMLInputElement>(null);
  const [newTech, setNewTech] = useState("");
  const [newCompany, setNewCompany] = useState("");

  function removeChip(list: string[], value: string) {
    return list.filter((v) => v !== value);
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label={tp.targetRole} hint={tp.targetRoleHint}>
          <ImeInput
            className={inputCls}
            value={profile.targetRole}
            placeholder={tp.targetRolePh}
            onChange={(v) => update({ targetRole: v })}
          />
        </Field>
        <Field label={tp.yearsExp}>
          <ImeInput
            className={inputCls}
            value={profile.yearsExp}
            placeholder={tp.yearsExpPh}
            onChange={(v) => update({ yearsExp: v })}
          />
        </Field>
      </div>

      <Field label={tp.techStack} hint={tp.techHint}>
        <div className="min-h-10 bg-canvas border border-hairline rounded-md px-2 py-1.5 flex flex-wrap gap-1.5 items-center">
          {profile.techStack.map((s) => (
            <span
              key={s}
              className="bg-surface-card text-ink text-[13px] inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            >
              {s}
              <button
                onClick={() => update({ techStack: removeChip(profile.techStack, s) })}
                className="text-muted hover:text-ink"
              >
                <X size={10} strokeWidth={2.2} />
              </button>
            </span>
          ))}
          <ImeInput
            className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px] text-ink placeholder:text-muted-soft px-1"
            placeholder={profile.techStack.length ? tp.techPh2 : tp.techPh1}
            value={newTech}
            onChange={(v) => setNewTech(v)}
            onBlur={() => {
              // Commit any draft on blur — IME Enter may have been
              // swallowed by composition confirmation, leaving the chip
              // unadded. Don't lose the user's typing on modal close.
              const v = newTech.trim().replace(/,$/, "");
              if (!v) return;
              const latest = useAppStore.getState().profile.techStack;
              if (!latest.includes(v)) {
                update({ techStack: [...latest, v] });
              }
              setNewTech("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const v = newTech.trim().replace(/,$/, "");
                // Read latest from store — the closure-captured `profile`
                // may be stale if an earlier update hasn't yet re-rendered.
                const latest = useAppStore.getState().profile.techStack;
                if (v && !latest.includes(v)) {
                  update({ techStack: [...latest, v] });
                }
                setNewTech("");
              } else if (e.key === "Backspace" && !newTech) {
                const latest = useAppStore.getState().profile.techStack;
                if (latest.length) update({ techStack: latest.slice(0, -1) });
              }
            }}
          />
        </div>
      </Field>

      <Field label={tp.companies} hint={tp.companiesHint}>
        <div className="min-h-10 bg-canvas border border-hairline rounded-md px-2 py-1.5 flex flex-wrap gap-1.5 items-center">
          {profile.targetCompanies.map((c) => (
            <span
              key={c}
              className="bg-surface-card text-ink text-[13px] inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            >
              {c}
              <button
                onClick={() =>
                  update({ targetCompanies: removeChip(profile.targetCompanies, c) })
                }
                className="text-muted hover:text-ink"
              >
                <X size={10} strokeWidth={2.2} />
              </button>
            </span>
          ))}
          <ImeInput
            className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px] text-ink placeholder:text-muted-soft px-1"
            placeholder={profile.targetCompanies.length ? tp.companiesPh2 : tp.companiesPh1}
            value={newCompany}
            onChange={(v) => setNewCompany(v)}
            onBlur={() => {
              const v = newCompany.trim().replace(/,$/, "");
              if (!v) return;
              const latest = useAppStore.getState().profile.targetCompanies;
              if (!latest.includes(v)) {
                update({ targetCompanies: [...latest, v] });
              }
              setNewCompany("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const v = newCompany.trim().replace(/,$/, "");
                const latest = useAppStore.getState().profile.targetCompanies;
                if (v && !latest.includes(v)) {
                  update({ targetCompanies: [...latest, v] });
                }
                setNewCompany("");
              } else if (e.key === "Backspace" && !newCompany) {
                const latest = useAppStore.getState().profile.targetCompanies;
                if (latest.length) update({ targetCompanies: latest.slice(0, -1) });
              }
            }}
          />
        </div>
      </Field>

      <Field label={tp.resume} hint={tp.resumeHint}>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadResume(f);
            e.target.value = "";
          }}
        />
        {profile.resumeBlobId ? (
          <div className="flex items-center gap-3.5 px-4 py-3 bg-canvas border border-hairline rounded-xl">
            <div className="w-10 h-12 rounded bg-surface-card flex items-center justify-center font-mono text-[10px] text-muted font-medium">
              PDF
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink truncate">
                {profile.resumeFileName}
              </div>
              <div className="text-xs text-muted">
                {tp.resumeSaved(((profile.resumeFileSize ?? 0) / 1024).toFixed(1))}
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-3 py-1.5 rounded-md hover:bg-surface-card inline-flex items-center gap-1.5"
            >
              <Upload size={13} strokeWidth={1.8} />
              {tp.resumeReplace}
            </button>
            <button
              onClick={() => removeResume()}
              className="text-muted hover:text-ink p-1.5"
              aria-label={tp.resumeDelete}
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full px-4 py-6 bg-canvas border border-dashed border-hairline rounded-xl text-muted hover:border-primary/40 hover:text-ink inline-flex items-center justify-center gap-2 text-[13px]"
          >
            <Upload size={14} strokeWidth={1.8} />
            {tp.resumeUpload}
          </button>
        )}
      </Field>
    </div>
  );
}

const PROVIDERS: { id: Exclude<Provider, "azure-openai">; label: string }[] = [
  { id: "anthropic", label: "Anthropic" },
  { id: "openai", label: "OpenAI" },
  { id: "google", label: "Google" },
  { id: "zhipu", label: "智谱" },
  { id: "custom", label: "Custom" },
];

function ApiTab() {
  const apiConfig = useAppStore((s) => s.apiConfig);
  const update = useAppStore((s) => s.updateApiConfig);
  const changeProvider = useAppStore((s) => s.changeProvider);
  const fetchModels = useAppStore((s) => s.fetchModels);
  const availableModels = useAppStore((s) => s.availableModels);
  const modelsLoading = useAppStore((s) => s.modelsLoading);
  const modelsError = useAppStore((s) => s.modelsError);
  const t = useT();
  const ta = t.settings.api;
  const [showKey, setShowKey] = useState(false);

  const placeholder =
    PROVIDER_DEFAULT_URL[apiConfig.provider] || "https://api.example.com/v1";

  return (
    <div>
      <Field label={ta.baseUrl} hint={ta.baseUrlHint}>
        <ImeInput
          className={`${inputCls} font-mono`}
          value={apiConfig.baseURL ?? ""}
          placeholder={placeholder}
          onChange={(v) => update({ baseURL: v })}
        />
      </Field>

      <Field label={ta.provider} hint={ta.providerHint}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROVIDERS.map((p) => {
            const active = apiConfig.provider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => changeProvider(p.id)}
                className={clsx(
                  "px-3.5 py-3 rounded-md border text-left flex flex-col gap-0.5",
                  active
                    ? "border-primary bg-surface-card"
                    : "border-hairline bg-canvas hover:bg-surface-soft",
                )}
              >
                <span className="text-[13px] font-medium text-ink">{p.label}</span>
                <span className="text-[12px] text-muted">{ta.providerHints[p.id]}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={ta.apiKey} hint={ta.apiKeyHint}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ImeInput
              type={showKey ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              className={`${inputCls} font-mono w-full pr-10`}
              value={apiConfig.apiKey}
              placeholder="sk-..."
              onChange={(v) => update({ apiKey: v })}
              onBlur={() => {
                if (apiConfig.apiKey.trim()) fetchModels();
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? ta.hide : ta.show}
              title={showKey ? ta.hide : ta.show}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-ink hover:bg-surface-card"
            >
              {showKey ? (
                <EyeOff size={14} strokeWidth={1.8} />
              ) : (
                <Eye size={14} strokeWidth={1.8} />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => fetchModels()}
            disabled={!apiConfig.apiKey.trim() || modelsLoading}
            className="px-3.5 h-10 rounded-md border border-hairline bg-canvas text-[13px] font-medium text-ink hover:bg-surface-card disabled:text-muted-soft disabled:cursor-not-allowed whitespace-nowrap"
          >
            {modelsLoading ? ta.fetching : ta.fetchModels}
          </button>
        </div>
        <div className="mt-2 text-[12px] leading-[1.55]">
          {modelsError ? (
            <span className="text-error">⚠️ {modelsError}</span>
          ) : availableModels.length > 0 ? (
            <span className="text-success">
              {ta.modelsLoaded(availableModels.length)}
            </span>
          ) : (
            <span className="text-muted-soft">{ta.configKeyHint}</span>
          )}
        </div>
      </Field>

      <Field label={ta.modelOverride} hint={ta.modelOverrideHint}>
        <ImeInput
          className={`${inputCls} font-mono`}
          value={apiConfig.modelOverride ?? ""}
          placeholder={ta.modelOverridePh}
          onChange={(v) => update({ modelOverride: v })}
        />
      </Field>

      <div className="mt-6 px-4 py-3 bg-surface-soft border border-hairline-soft rounded-md text-[12px] text-muted leading-[1.55]">
        {ta.footerNote}
      </div>
    </div>
  );
}

function UsageTab() {
  const stats = useAppStore((s) => s.usageStats);
  const refresh = useAppStore((s) => s.refreshUsage);
  const t = useT();
  const tu = t.settings.usage;

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const fmt = (n: number | undefined) =>
    typeof n === "number" ? n.toLocaleString() : "—";
  const avg =
    stats && stats.totalCalls > 0
      ? Math.round((stats.monthTokens || 0) / stats.totalCalls)
      : null;

  const cards: { label: string; value: string }[] = [
    { label: tu.todayTokens, value: fmt(stats?.todayTokens) },
    { label: tu.monthTokens, value: fmt(stats?.monthTokens) },
    { label: tu.totalCalls, value: fmt(stats?.totalCalls) },
    { label: tu.avgPerCall, value: avg !== null ? avg.toLocaleString() : "—" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {cards.map((s) => (
          <div
            key={s.label}
            className="bg-canvas border border-hairline rounded-xl px-4 py-3.5"
          >
            <div
              className="text-[24px] font-medium text-ink leading-none tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {s.value}
            </div>
            <div className="text-[12px] text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {stats && stats.recentRows.length > 0 ? (
        <div>
          <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted-soft px-1 pb-2">
            {tu.recentCalls}
          </div>
          <div className="bg-canvas border border-hairline rounded-md overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-2 text-[11px] font-medium tracking-[0.06em] uppercase text-muted-soft border-b border-hairline-soft">
              <span>{tu.colModel}</span>
              <span className="text-right">{tu.colIn}</span>
              <span className="text-right">{tu.colOut}</span>
              <span className="text-right">{tu.colWhen}</span>
            </div>
            {stats.recentRows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-2 text-[12px] text-body border-b border-hairline-soft last:border-b-0 font-mono"
              >
                <span className="truncate text-ink">{r.model}</span>
                <span className="text-right">{r.promptTokens}</span>
                <span className="text-right">{r.completionTokens}</span>
                <span className="text-right text-muted">
                  {new Date(r.ts).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 bg-surface-soft border border-hairline-soft rounded-md text-[12px] text-muted leading-[1.55]">
          {tu.empty}
        </div>
      )}
    </div>
  );
}
