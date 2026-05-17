"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Paperclip, Sparkles } from "lucide-react";
import clsx from "clsx";
import { COMMANDS, type CommandDef } from "@/lib/commands";
import { useAppStore } from "@/lib/store";
import { SlashPalette } from "./slash-palette";
import { ModelPicker } from "./model-picker";

export function Composer({
  placeholder = "问点什么，或输入 / 调用命令…",
}: {
  placeholder?: string;
}) {
  const activateChatMode = useAppStore((s) => s.activateChatMode);
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  function pickCommand(c: CommandDef) {
    setValue("");
    activateChatMode(c.id);
    textareaRef.current?.focus();
  }

  function handleSubmit() {
    const v = value.trim();
    if (!v) return;
    sendUserMessage(v);
    setValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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
      if (e.key === "Enter" && !e.shiftKey) {
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

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
        <div
          className={clsx(
            "bg-canvas rounded-2xl flex flex-col gap-3 px-4 pt-4 pb-3 transition-all",
            focused || paletteOpen
              ? "border border-primary shadow-[0_0_0_3px_rgba(204,120,92,0.15)]"
              : "border border-hairline shadow-[0_1px_2px_rgba(20,20,19,0.03)]",
          )}
        >
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-muted hover:bg-surface-card"
            >
              <Paperclip size={15} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-muted hover:bg-surface-card text-xs"
            >
              <Sparkles size={15} strokeWidth={1.6} />
              简历
            </button>
            <div className="flex-1" />
            <ModelPicker />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || paletteOpen}
              className={clsx(
                "w-8 h-8 rounded-md flex items-center justify-center text-white transition-colors",
                value.trim() && !paletteOpen
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
