"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings as SettingsIcon, Upload, X } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "@/lib/store";
import type { Provider } from "@/lib/db";
import { PROVIDER_DEFAULT_URL } from "@/lib/db";

const TABS: { id: "profile" | "api" | "usage"; label: string }[] = [
  { id: "profile", label: "画像" },
  { id: "api", label: "模型 & API" },
  { id: "usage", label: "用量" },
];

export function SettingsModal() {
  const open = useAppStore((s) => s.settingsOpen);
  const tab = useAppStore((s) => s.settingsTab);
  const setTab = useAppStore((s) => s.setSettingsTab);
  const close = useAppStore((s) => s.closeSettings);

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
            /settings
          </span>
          <div className="flex-1" />
          <button onClick={close} className="text-muted hover:text-ink">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        <div className="px-7 pt-3">
          <h2
            className="text-[28px] font-medium tracking-[-0.02em] text-ink m-0 mb-1.5"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            告诉 OC 你是谁。
          </h2>
          <p className="text-sm text-muted leading-[1.55]">
            这些信息只存在你的浏览器里（IndexedDB），不会上传到我们的服务器。
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
            自动保存到本地
          </span>
          <div className="flex-1" />
          <button
            onClick={close}
            className="bg-canvas text-ink border border-hairline text-sm font-medium px-4 py-2 rounded-md hover:bg-surface-card"
          >
            完成
          </button>
        </div>
      </div>
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [newTech, setNewTech] = useState("");
  const [newCompany, setNewCompany] = useState("");

  function removeChip(list: string[], value: string) {
    return list.filter((v) => v !== value);
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="目标岗位 *" hint="必填">
          <input
            className={inputCls}
            value={profile.targetRole}
            placeholder="高级前端工程师"
            onChange={(e) => update({ targetRole: e.target.value })}
          />
        </Field>
        <Field label="工作年限">
          <input
            className={inputCls}
            value={profile.yearsExp}
            placeholder="3 年"
            onChange={(e) => update({ yearsExp: e.target.value })}
          />
        </Field>
      </div>

      <Field label="技术栈" hint="OC 会用来出题，回车添加">
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
          <input
            className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px] text-ink placeholder:text-muted-soft px-1"
            placeholder={profile.techStack.length ? "继续添加…" : "React, TypeScript…"}
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const v = newTech.trim().replace(/,$/, "");
                if (v && !profile.techStack.includes(v)) {
                  update({ techStack: [...profile.techStack, v] });
                }
                setNewTech("");
              } else if (e.key === "Backspace" && !newTech && profile.techStack.length) {
                update({ techStack: profile.techStack.slice(0, -1) });
              }
            }}
          />
        </div>
      </Field>

      <Field label="目标公司" hint="回车添加">
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
          <input
            className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px] text-ink placeholder:text-muted-soft px-1"
            placeholder={profile.targetCompanies.length ? "继续添加…" : "Google, 字节…"}
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const v = newCompany.trim().replace(/,$/, "");
                if (v && !profile.targetCompanies.includes(v)) {
                  update({ targetCompanies: [...profile.targetCompanies, v] });
                }
                setNewCompany("");
              } else if (
                e.key === "Backspace" &&
                !newCompany &&
                profile.targetCompanies.length
              ) {
                update({ targetCompanies: profile.targetCompanies.slice(0, -1) });
              }
            }}
          />
        </div>
      </Field>

      <Field label="简历" hint="PDF · OC 会解析关键信息并记住">
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
                {((profile.resumeFileSize ?? 0) / 1024).toFixed(1)} KB · 已保存到本地
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-3 py-1.5 rounded-md hover:bg-surface-card inline-flex items-center gap-1.5"
            >
              <Upload size={13} strokeWidth={1.8} />
              替换
            </button>
            <button
              onClick={() => removeResume()}
              className="text-muted hover:text-ink p-1.5"
              aria-label="删除简历"
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
            点击上传 PDF 简历
          </button>
        )}
      </Field>
    </div>
  );
}

const PROVIDERS: { id: Provider; label: string; hint: string }[] = [
  { id: "anthropic", label: "Anthropic", hint: "Claude 4.x · 推荐" },
  { id: "openai", label: "OpenAI", hint: "GPT-4 / o-series" },
  { id: "google", label: "Google", hint: "Gemini 系列" },
  { id: "zhipu", label: "智谱", hint: "GLM 系列 · 国内直连" },
  { id: "azure-openai", label: "Azure OpenAI", hint: "企业部署" },
  { id: "custom", label: "Custom", hint: "OpenAI 兼容端点" },
];

function ApiTab() {
  const apiConfig = useAppStore((s) => s.apiConfig);
  const update = useAppStore((s) => s.updateApiConfig);
  const changeProvider = useAppStore((s) => s.changeProvider);
  const fetchModels = useAppStore((s) => s.fetchModels);
  const availableModels = useAppStore((s) => s.availableModels);
  const modelsLoading = useAppStore((s) => s.modelsLoading);
  const modelsError = useAppStore((s) => s.modelsError);

  const placeholder =
    PROVIDER_DEFAULT_URL[apiConfig.provider] || "https://api.example.com/v1";

  return (
    <div>
      <Field
        label="Base URL"
        hint="向哪个 HTTPS 端点发请求。切换供应商会自动填默认值，可改成代理 / 自托管。"
      >
        <input
          className={`${inputCls} font-mono`}
          value={apiConfig.baseURL ?? ""}
          placeholder={placeholder}
          onChange={(e) => update({ baseURL: e.target.value })}
        />
      </Field>

      <Field label="模型供应商" hint="本地保存，不会上传">
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
                <span className="text-[12px] text-muted">{p.hint}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="API Key *" hint="存在浏览器 IndexedDB，仅你能看到">
        <div className="flex gap-2">
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            className={`${inputCls} font-mono flex-1`}
            value={apiConfig.apiKey}
            placeholder="sk-..."
            onChange={(e) => update({ apiKey: e.target.value })}
            onBlur={() => {
              if (apiConfig.apiKey.trim()) fetchModels();
            }}
          />
          <button
            type="button"
            onClick={() => fetchModels()}
            disabled={!apiConfig.apiKey.trim() || modelsLoading}
            className="px-3.5 h-10 rounded-md border border-hairline bg-canvas text-[13px] font-medium text-ink hover:bg-surface-card disabled:text-muted-soft disabled:cursor-not-allowed whitespace-nowrap"
          >
            {modelsLoading ? "拉取中…" : "拉取模型列表"}
          </button>
        </div>
        <div className="mt-2 text-[12px] leading-[1.55]">
          {modelsError ? (
            <span className="text-error">⚠️ {modelsError}</span>
          ) : availableModels.length > 0 ? (
            <span className="text-success">
              ✓ 已加载 {availableModels.length} 个可用模型 — 在聊天框右下角选用
            </span>
          ) : (
            <span className="text-muted-soft">
              未拉取时聊天框沿用内置模型清单
            </span>
          )}
        </div>
      </Field>

      <Field label="模型 ID 覆盖" hint="留空则使用聊天框中选择的模型">
        <input
          className={`${inputCls} font-mono`}
          value={apiConfig.modelOverride ?? ""}
          placeholder="claude-sonnet-4-6 / gpt-4o / gemini-2.5-pro"
          onChange={(e) => update({ modelOverride: e.target.value })}
        />
      </Field>

      <div className="mt-6 px-4 py-3 bg-surface-soft border border-hairline-soft rounded-md text-[12px] text-muted leading-[1.55]">
        每次发消息都把上面这些字段一起 POST 到 <code className="font-mono">/api/chat</code>，服务端拿到后即时构造 SDK 客户端调用上游，apiKey 不会落盘。
      </div>
    </div>
  );
}

function UsageTab() {
  const stats = useAppStore((s) => s.usageStats);
  const refresh = useAppStore((s) => s.refreshUsage);

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
    { label: "今日 Tokens", value: fmt(stats?.todayTokens) },
    { label: "本月 Tokens", value: fmt(stats?.monthTokens) },
    { label: "累计调用", value: fmt(stats?.totalCalls) },
    { label: "平均每次", value: avg !== null ? avg.toLocaleString() : "—" },
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
            最近调用
          </div>
          <div className="bg-canvas border border-hairline rounded-md overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-2 text-[11px] font-medium tracking-[0.06em] uppercase text-muted-soft border-b border-hairline-soft">
              <span>Model</span>
              <span className="text-right">In</span>
              <span className="text-right">Out</span>
              <span className="text-right">When</span>
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
                  {new Date(r.ts).toLocaleTimeString("zh-CN", {
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
          还没有调用记录。每次成功流式回复后会在这里累加 input / output token。所有数据仅保存在本地 IndexedDB。
        </div>
      )}
    </div>
  );
}
