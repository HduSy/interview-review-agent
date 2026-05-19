"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "@/lib/store";

const TONE = {
  success: { icon: CheckCircle2, color: "text-success" },
  info: { icon: Info, color: "text-primary" },
  error: { icon: XCircle, color: "text-error" },
} as const;

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-[320px] pointer-events-none">
      {toasts.map((t) => {
        const { icon: Icon, color } = TONE[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto bg-canvas border border-hairline rounded-xl shadow-[0_12px_32px_rgba(20,20,19,0.12),0_2px_6px_rgba(20,20,19,0.05)] p-3 pr-2 flex items-start gap-2.5 animate-in-toast"
          >
            <Icon
              size={16}
              strokeWidth={1.8}
              className={clsx("shrink-0 mt-0.5", color)}
            />
            <span className="text-[13px] text-ink leading-[1.55] flex-1 break-words">
              {t.text}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted hover:text-ink shrink-0 -mr-0.5 -mt-0.5"
              aria-label="关闭通知"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
