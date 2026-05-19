"use client";

import { useEffect, useMemo, useRef } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  DEFAULT_MODEL,
  MORE_MODELS,
  type ModelOption,
} from "@/lib/models";
import { useAppStore } from "@/lib/store";

const FALLBACK_MODELS: ModelOption[] = [
  DEFAULT_MODEL,
  ...MORE_MODELS.featured,
  ...MORE_MODELS.legacy,
];

export function ModelPicker() {
  const modelId = useAppStore((s) => s.modelId);
  const setModelId = useAppStore((s) => s.setModelId);
  const adaptiveThinking = useAppStore((s) => s.adaptiveThinking);
  const toggleAdaptiveThinking = useAppStore((s) => s.toggleAdaptiveThinking);
  const remoteModels = useAppStore((s) => s.availableModels);
  const modelsLoading = useAppStore((s) => s.modelsLoading);

  const open = useAppStore((s) => s.modelPickerOpen);
  const subOpen = useAppStore((s) => s.modelPickerSubOpen);
  const toggleOpen = useAppStore((s) => s.toggleModelPicker);
  const setSubOpen = useAppStore((s) => s.setModelPickerSubOpen);
  const close = useAppStore((s) => s.closeModelPicker);

  const rootRef = useRef<HTMLDivElement>(null);

  const models: ModelOption[] = useMemo(() => {
    if (remoteModels.length > 0)
      return remoteModels.map((m) => ({ id: m.id, name: m.name }));
    return FALLBACK_MODELS;
  }, [remoteModels]);

  const primary = models[0] ?? DEFAULT_MODEL;
  const rest = models.slice(1);
  const selected =
    models.find((m) => m.id === modelId) ?? primary;

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          toggleOpen();
        }}
        className={clsx(
          "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[13px] text-body hover:bg-surface-card transition-colors uppercase tracking-[0.03em]",
          open && "bg-surface-card",
        )}
      >
        {selected.name}
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={clsx("text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 z-30 w-[300px] bg-canvas border border-hairline rounded-xl shadow-[0_12px_32px_rgba(20,20,19,0.10),0_2px_6px_rgba(20,20,19,0.04)] p-1.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              close();
            }}
            onMouseEnter={() => setSubOpen(false)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-surface-soft"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-ink leading-tight truncate uppercase tracking-[0.03em]">
                {selected.name}
              </div>
              {selected.desc && (
                <div className="text-[12px] text-muted mt-0.5 truncate">
                  {selected.desc}
                </div>
              )}
            </div>
            <Check
              size={16}
              strokeWidth={2}
              className="text-[#2c7be5] mt-0.5 shrink-0"
            />
          </button>

          <div className="h-px bg-hairline-soft mx-2" />

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              toggleAdaptiveThinking();
            }}
            onMouseEnter={() => setSubOpen(false)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-surface-soft"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-ink leading-tight">
                Adaptive thinking
              </div>
              <div className="text-[12px] text-muted mt-0.5">
                Thinks for more complex tasks
              </div>
            </div>
            <span
              role="switch"
              aria-checked={adaptiveThinking}
              className={clsx(
                "w-9 h-5 rounded-full relative shrink-0 mt-0.5 transition-colors",
                adaptiveThinking ? "bg-primary" : "bg-hairline",
              )}
            >
              <span
                className={clsx(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                  adaptiveThinking ? "left-[18px]" : "left-0.5",
                )}
              />
            </span>
          </button>

          <div className="h-px bg-hairline-soft mx-2" />

          <button
            type="button"
            onMouseEnter={() => setSubOpen(true)}
            onPointerDown={(e) => {
              e.preventDefault();
              setSubOpen(!subOpen);
            }}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
              subOpen ? "bg-surface-card" : "hover:bg-surface-soft",
            )}
          >
            <div className="flex-1 text-[14px] font-medium text-ink">
              More models
              {remoteModels.length > 0 && (
                <span className="ml-2 font-mono text-[11px] text-muted-soft">
                  {rest.length}
                </span>
              )}
            </div>
            {modelsLoading && (
              <span className="text-[11px] text-muted">加载中…</span>
            )}
            <ChevronRight size={16} strokeWidth={1.8} className="text-muted shrink-0" />
          </button>

          {subOpen && (
            <div className="absolute left-[calc(100%+8px)] top-0 w-[260px] max-h-[420px] overflow-y-auto bg-canvas border border-hairline rounded-xl shadow-[0_12px_32px_rgba(20,20,19,0.10),0_2px_6px_rgba(20,20,19,0.04)] p-1.5">
              {rest.length === 0 ? (
                <div className="px-3 py-4 text-[13px] text-muted-soft text-center">
                  无更多模型
                </div>
              ) : (
                rest.map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    selected={modelId === m.id}
                    onPick={(id) => setModelId(id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModelRow({
  model,
  selected,
  onPick,
}: {
  model: ModelOption;
  selected: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onPick(model.id);
      }}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-surface-soft"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-ink truncate uppercase tracking-[0.03em]">
          {model.name}
        </div>
        {model.desc && (
          <div className="text-[11px] text-muted truncate">{model.desc}</div>
        )}
      </div>
      {selected && (
        <Check size={15} strokeWidth={2} className="text-[#2c7be5] shrink-0" />
      )}
    </button>
  );
}
