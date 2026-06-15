"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Square,
  Upload,
  X,
} from "lucide-react";
import clsx from "clsx";
import { COMMANDS, type CommandDef } from "@/lib/commands";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n/use-t";
import { modelSupportsVision } from "@/lib/model-capabilities";
import { SlashPalette } from "./slash-palette";
import { ModelPicker } from "./model-picker";

type FileKind =
  | "image"
  | "code"
  | "data"
  | "spreadsheet"
  | "markdown"
  | "text"
  | "pdf"
  | "archive"
  | "other";

type Attachment = {
  id: string;
  name: string;
  size: number;
  kind: FileKind;
  /** Inlined text content for code / text files. Undefined for binary. */
  text?: string;
  /** Blob URL for image preview. Must be URL.revokeObjectURL'd on removal. */
  imageUrl?: string;
};

const TEXTUAL = /\.(md|markdown|txt|json|csv|log|jsx?|tsx?|ya?ml|toml|xml|env|sh|bash|zsh|sql|py|rb|go|rs|java|cpp|c|h|php|swift|kt|mjs|cjs)$/i;
const IMAGE = /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico)$/i;
const MAX_TEXT_BYTES = 200_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB — generous for screenshots

function classifyFile(name: string): FileKind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (/^(png|jpe?g|gif|webp|svg|bmp|avif|ico)$/.test(ext)) return "image";
  if (/^(js|jsx|ts|tsx|mjs|cjs|py|rb|go|rs|java|cpp|c|h|sh|bash|zsh|sql|php|swift|kt)$/.test(ext))
    return "code";
  if (/^(json|ya?ml|toml|xml|env)$/.test(ext)) return "data";
  if (/^(csv|tsv|xlsx?|ods)$/.test(ext)) return "spreadsheet";
  if (/^(md|markdown|mdx|rst)$/.test(ext)) return "markdown";
  if (/^(txt|log)$/.test(ext)) return "text";
  if (ext === "pdf") return "pdf";
  if (/^(zip|tar|gz|tgz|rar|7z|bz2)$/.test(ext)) return "archive";
  return "other";
}

function iconForKind(kind: FileKind): React.ReactNode {
  const props = { size: 12, strokeWidth: 1.8 } as const;
  switch (kind) {
    case "image":
      return <FileImage {...props} />;
    case "code":
      return <FileCode {...props} />;
    case "data":
      return <FileJson {...props} />;
    case "spreadsheet":
      return <FileSpreadsheet {...props} />;
    case "markdown":
    case "text":
      return <FileText {...props} />;
    case "pdf":
      return <FileText {...props} />;
    case "archive":
      return <FileArchive {...props} />;
    default:
      return <File {...props} />;
  }
}

export function Composer({
  placeholder,
}: {
  placeholder?: string;
}) {
  const t = useT();
  const activateChatMode = useAppStore((s) => s.activateChatMode);
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);
  const stopStreaming = useAppStore((s) => s.stopStreaming);
  const streaming = useAppStore((s) => s.streamingPendingId !== null);
  const profile = useAppStore((s) => s.profile);
  const openSettings = useAppStore((s) => s.openSettings);
  const availableModels = useAppStore((s) => s.availableModels);
  const hasModels = availableModels.length > 0;
  const modelId = useAppStore((s) => s.modelId);
  const modelOverride = useAppStore((s) => s.apiConfig.modelOverride);
  // The override (if non-empty) is what actually gets sent to the upstream,
  // so capability check follows the same precedence.
  const effectiveModelId = modelOverride?.trim() || modelId;
  const supportsVision = modelSupportsVision(effectiveModelId);

  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachResume, setAttachResume] = useState(false);
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null);
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

  // Revoke all outstanding blob URLs when the component unmounts.
  // (Per-removal revocation is handled inline above; this is the safety
  // net for tab close / route change.)
  useEffect(() => {
    return () => {
      for (const a of attachments) {
        if (a.imageUrl) URL.revokeObjectURL(a.imageUrl);
      }
    };
    // We only want this on unmount — capturing the latest list via ref
    // would over-engineer it. Stale closure is fine: any newer URLs
    // added after the last render get cleaned up via remove / submit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC closes the image preview lightbox.
  useEffect(() => {
    if (!previewImage) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewImage(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previewImage]);

  function pickCommand(c: CommandDef) {
    // No models configured → only /settings is actionable. Other commands
    // are disabled in the palette UI; intercept keyboard Enter too.
    if (!hasModels && c.id !== "settings") return;
    setValue("");
    activateChatMode(c.id);
    textareaRef.current?.focus();
  }

  async function onFilesPicked(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files)) {
      const kind = classifyFile(f.name);
      const a: Attachment = {
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        size: f.size,
        kind,
      };
      // Inline text content for code / data / log-ish files so we can
      // actually feed them to the LLM.
      if (TEXTUAL.test(f.name) && f.size <= MAX_TEXT_BYTES) {
        try {
          a.text = await f.text();
        } catch {
          /* ignore — leave as binary metadata */
        }
      }
      // Build a blob URL for image previews (cleaned up on remove / submit
      // / unmount). Skipping oversized images so the page doesn't OOM.
      if (
        (kind === "image" || IMAGE.test(f.name)) &&
        f.size <= MAX_IMAGE_BYTES
      ) {
        try {
          a.imageUrl = URL.createObjectURL(f);
        } catch {
          /* ignore — chip will fall back to the icon */
        }
      }
      next.push(a);
    }
    setAttachments((prev) => [...prev, ...next]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.imageUrl) URL.revokeObjectURL(target.imageUrl);
      // Close lightbox if it's pointing at the removed one.
      if (previewImage?.id === id) setPreviewImage(null);
      return prev.filter((p) => p.id !== id);
    });
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
      parts.push(t.composer.attachResumeLine(profile.resumeFileName));
    }
    for (const a of attachments) {
      const sizeKB = (a.size / 1024).toFixed(1);
      if (a.text) {
        parts.push(t.composer.attachInlineLine(a.name, sizeKB, a.text));
      } else {
        parts.push(t.composer.attachBinaryLine(a.name, sizeKB));
      }
    }
    if (v) parts.push(v);
    sendUserMessage(parts.join("\n\n"));
    setValue("");
    // Release any blob URLs we created for image previews.
    for (const a of attachments) {
      if (a.imageUrl) URL.revokeObjectURL(a.imageUrl);
    }
    setAttachments([]);
    setPreviewImage(null);
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
      if (streaming) return; // streaming guard — user must hit Stop first
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
            hasModels={hasModels}
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
                  hint={t.composer.resumeChipHint}
                  onRemove={() => setAttachResume(false)}
                />
              )}
              {attachments.map((a) => (
                <Chip
                  key={a.id}
                  icon={
                    a.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(a)}
                        title={t.common.preview}
                        className="block w-5 h-5 rounded overflow-hidden bg-canvas border border-hairline shrink-0 hover:opacity-80 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.imageUrl}
                          alt={a.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      iconForKind(a.kind)
                    )
                  }
                  label={a.name}
                  hint={`${(a.size / 1024).toFixed(1)} KB${a.text ? "" : a.imageUrl ? "" : ` · ${t.common.binary}`}`}
                  onRemove={() => removeAttachment(a.id)}
                />
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            placeholder={placeholder ?? t.composer.placeholder}
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
              disabled={!supportsVision}
              title={
                supportsVision
                  ? t.composer.uploadFile
                  : t.composer.unsupportedModel(effectiveModelId)
              }
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-muted transition-colors",
                supportsVision
                  ? "hover:bg-surface-card"
                  : "opacity-40 cursor-not-allowed",
              )}
            >
              <Upload size={15} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={toggleResume}
              disabled={!supportsVision}
              title={
                !supportsVision
                  ? t.composer.unsupportedModel(effectiveModelId)
                  : profile.resumeFileName
                    ? attachResume
                      ? t.composer.resumeCancel(profile.resumeFileName)
                      : t.composer.resumeAttach(profile.resumeFileName)
                    : t.composer.resumeSetup
              }
              className={clsx(
                "inline-flex items-center justify-center px-2.5 py-1.5 rounded-md border transition-colors",
                !supportsVision
                  ? "border-hairline text-muted opacity-40 cursor-not-allowed"
                  : attachResume
                    ? "border-primary text-primary bg-primary/10"
                    : "border-hairline text-muted hover:bg-surface-card",
              )}
            >
              <Sparkles size={15} strokeWidth={1.6} />
            </button>
            <div className="flex-1" />
            <ModelPicker />
            {streaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                title={t.common.stop}
                aria-label={t.common.stop}
                className="w-8 h-8 rounded-md flex items-center justify-center bg-ink text-white hover:opacity-90 transition-opacity"
              >
                <Square size={12} strokeWidth={2} fill="currentColor" />
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {previewImage?.imageUrl && (
        <ImageLightbox
          src={previewImage.imageUrl}
          alt={previewImage.name}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.15;

function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const t = useT();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    mouseX: number;
    mouseY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset transforms when the image source changes (different preview).
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [src]);

  // React's synthetic onWheel is registered as a passive listener, which
  // means `preventDefault()` is silently ignored — the page would scroll
  // behind the lightbox while the user is trying to zoom. Bind a native
  // non-passive listener so we can intercept the wheel cleanly.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      setScale((prev) => {
        const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev * factor));
        // Snap offset back to center as we leave / re-enter "fits viewport".
        if (next <= 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function startDrag(e: React.MouseEvent<HTMLImageElement>) {
    e.stopPropagation();
    if (scale <= 1) return;
    setDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }
  function onDragMove(e: React.MouseEvent<HTMLImageElement>) {
    if (!dragging || !dragStart.current) return;
    setOffset({
      x: dragStart.current.offsetX + (e.clientX - dragStart.current.mouseX),
      y: dragStart.current.offsetY + (e.clientY - dragStart.current.mouseY),
    });
  }
  function endDrag() {
    setDragging(false);
    dragStart.current = null;
  }
  function onDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  const cursor = scale > 1 ? (dragging ? "grabbing" : "grab") : "default";

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={`${t.common.preview}: ${alt}`}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 sm:p-12 cursor-zoom-out overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={startDrag}
        onMouseMove={onDragMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onDoubleClick={onDoubleClick}
        draggable={false}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor,
          // Disable transition during active drag so the image tracks the
          // cursor 1:1; otherwise we ease the wheel-zoom smoothly.
          transition: dragging ? "none" : "transform 0.08s ease-out",
          willChange: "transform",
        }}
        className="max-w-full max-h-full object-contain rounded-md shadow-[0_24px_64px_rgba(0,0,0,0.5)] select-none"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label={t.common.closePreview}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X size={18} strokeWidth={1.8} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/80 text-[12px] font-mono px-3 py-1 rounded-md bg-black/40">
        <span className="truncate max-w-[60vw]">{alt}</span>
        <span className="text-white/50">·</span>
        <span className="tabular-nums">{Math.round(scale * 100)}%</span>
        <span className="text-white/40 text-[11px] hidden sm:inline">
          {t.composer.zoomHint}
        </span>
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
  const t = useT();
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
        aria-label={t.common.remove}
      >
        <X size={11} strokeWidth={2.2} />
      </button>
    </span>
  );
}
