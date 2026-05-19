"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, FileText, Paperclip, Sparkles, X } from "lucide-react";
import clsx from "clsx";
import { COMMANDS, type CommandDef } from "@/lib/commands";
import { useAppStore } from "@/lib/store";
import { SlashPalette } from "./slash-palette";
import { ModelPicker } from "./model-picker";

type Attachment = {
  id: string;
  name: string;
  size: number;
  text?: string;
};

const TEXTUAL = /\.(md|markdown|txt|json|csv|log|jsx?|tsx?)$/i;
const MAX_TEXT_BYTES = 200_000;

export function Composer({
  placeholder = "问点什么，或输入 / 调用命令…",
}: {
  placeholder?: string;
}) {
  const activateChatMode = useAppStore((s) => s.activateChatMode);
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);
  const profile = useAppStore((s) => s.profile);
  const openSettings = useAppStore((s) => s.openSettings);

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachResume, setAttachResume] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slashMatch = useMemo(() => {
    if (!value.startsWith("/")) return null;
    return value.slice(1).toLowerCase();
  }, [value]);

  const filteredCommands = useMemo<CommandDef[]>(() => {
    if (slashMatch === null) return [];
    if (slashMatch === "") return COMMANDS;
    return COMMANDS.filter((c) => c.cmd.toLowerCase().startsWith(slashMatch));
  }, [slashMatch]);

  const paletteOpen = slashMatch !== null && filteredCommands.length >= 0;

  useEffect(() => {
    setSelectedIndex(0);
  }, [slashMatch]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  // If user clears their resume in settings, drop the toggle.
  useEffect(() => {
    if (!profile.resumeFileName && attachResume) setAttachResume(false);
  }, [profile.resumeFileName, attachResume]);

  function pickCommand(c: CommandDef) {
    setValue("");
    activateChatMode(c.id);
    textareaRef.current?.focus();
  }

  async function onFilesPicked(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files)) {
      const a: Attachment = { id: `${Date.now()}-${f.name}`, name: f.name, size: f.size };
      if (TEXTUAL.test(f.name) && f.size <= MAX_TEXT_BYTES) {
        try {
          a.text = await f.text();
        } catch {
          /* ignore */
        }
      }
      next.push(a);
    }
    setAttachments((prev) => [...prev, ...next]);
  }

  function toggleResume() {
    if (!profile.resumeFileName) {
      openSettings("profile");
      return;
    }
    setAttachResume((v) => !v);
  }

  function handleSubmit() {
    const v = value.trim();
    if (!v && attachments.length === 0) return;
    const parts: string[] = [];
    if (attachResume && profile.resumeFileName) {
      parts.push(`（附加简历上下文：${profile.resumeFileName}）`);
    }
    for (const a of attachments) {
      const sizeKB = (a.size / 1024).toFixed(1);
      if (a.text) {
        parts.push(`（附件：${a.name} · ${sizeKB} KB）\n\n\`\`\`\n${a.text}\n\`\`\``);
      } else {
        parts.push(`（附件：${a.name} · ${sizeKB} KB · 二进制，未内联）`);
      }
    }
    if (v) parts.push(v);
    sendUserMessage(parts.join("\n\n"));
    setValue("");
    setAttachments([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // While an IME composition is active (Chinese / Japanese / Korean
    // candidate window open), Enter belongs to the IME for confirming
    // the selected word — don't intercept it as submit.
    const composing = e.nativeEvent.isComposing || e.keyCode === 229;

    if (paletteOpen && filteredCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + filteredCommands.length) % filteredCommands.length,
        );
        return;
      }
      if (e.key === "Enter" && !e.shiftKey && !composing) {
        e.preventDefault();
        pickCommand(filteredCommands[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setValue("");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !composing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const canSubmit = (value.trim() || attachments.length > 0) && !paletteOpen;

  return (
    <div className="px-6 sm:px-16 pt-5 pb-7">
      <div className="max-w-3xl mx-auto relative">
        {paletteOpen && (
          <SlashPalette
            commands={filteredCommands}
            selectedIndex={selectedIndex}
            onPick={pickCommand}
            onHover={setSelectedIndex}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            void onFilesPicked(e.target.files);
            e.target.value = "";
          }}
        />
        <div
          className={clsx(
            "bg-canvas rounded-2xl flex flex-col gap-3 px-4 pt-4 pb-3 transition-all",
            focused || paletteOpen
              ? "border border-primary shadow-[0_0_0_3px_rgba(204,120,92,0.15)]"
              : "border border-hairline shadow-[0_1px_2px_rgba(20,20,19,0.03)]",
          )}
        >
          {(attachments.length > 0 || attachResume) && (
            <div className="flex flex-wrap gap-1.5">
              {attachResume && profile.resumeFileName && (
                <Chip
                  icon={<Sparkles size={12} strokeWidth={1.8} />}
                  label={profile.resumeFileName}
                  hint="简历上下文"
                  onRemove={() => setAttachResume(false)}
                />
              )}
              {attachments.map((a) => (
                <Chip
                  key={a.id}
                  icon={<FileText size={12} strokeWidth={1.8} />}
                  label={a.name}
                  hint={`${(a.size / 1024).toFixed(1)} KB${a.text ? "" : " · 二进制"}`}
                  onRemove={() =>
                    setAttachments((prev) => prev.filter((p) => p.id !== a.id))
                  }
                />
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            rows={1}
            className={clsx(
              "resize-none outline-none bg-transparent text-[15px] leading-[1.55] text-ink placeholder:text-muted-soft min-h-6",
              paletteOpen && "font-mono",
            )}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="附加文件"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-muted hover:bg-surface-card"
            >
              <Paperclip size={15} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={toggleResume}
              title={
                profile.resumeFileName
                  ? attachResume
                    ? `取消附加：${profile.resumeFileName}`
                    : `附加：${profile.resumeFileName}`
                  : "尚未上传简历，点击去设置"
              }
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors",
                attachResume
                  ? "border-primary text-primary bg-primary/10"
                  : "border-hairline text-muted hover:bg-surface-card",
              )}
            >
              <Sparkles size={15} strokeWidth={1.6} />
              简历
            </button>
            <div className="flex-1" />
            <ModelPicker />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={clsx(
                "w-8 h-8 rounded-md flex items-center justify-center text-white transition-colors",
                canSubmit
                  ? "bg-primary hover:bg-primary-active"
                  : "bg-primary/40 cursor-not-allowed",
              )}
            >
              <ArrowRight size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  icon,
  label,
  hint,
  onRemove,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-card text-ink text-[12px] max-w-[260px]">
      <span className="text-muted shrink-0">{icon}</span>
      <span className="truncate" title={label}>
        {label}
      </span>
      {hint && (
        <span className="text-muted-soft shrink-0 font-mono text-[10px]">{hint}</span>
      )}
      <button
        onClick={onRemove}
        className="text-muted hover:text-ink shrink-0 -mr-0.5"
        aria-label="移除"
      >
        <X size={11} strokeWidth={2.2} />
      </button>
    </span>
  );
}
