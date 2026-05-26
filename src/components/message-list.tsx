"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  Check,
  Copy,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import { SpikeMark } from "./spike-mark";
import { ModeCard } from "./mode-cards";
import { Markdown } from "./markdown";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/messages";

const PIN_THRESHOLD_PX = 80;

export function MessageList({ messages }: { messages: Message[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const streamingPendingId = useAppStore((s) => s.streamingPendingId);

  // Re-evaluate "is user at the bottom" on every scroll. When pinned we
  // follow new content; when not, we surface a floating jump button so
  // streaming doesn't yank the page out from under someone reading up.
  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinned(dist < PIN_THRESHOLD_PX);
  }, []);

  // Scroll on new messages or content growth — but only if pinned. Use
  // "instant" not "smooth": smooth gets visually janky under token-rate
  // updates because each call re-targets a moving anchor.
  const lastContent = messages[messages.length - 1]?.content;
  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (!pinned) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, lastContent, pinned]);

  function jumpToBottom() {
    setPinned(true);
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-6 sm:px-16 pt-10 pb-4 relative"
    >
      <div className="max-w-3xl mx-auto w-full">
        {messages.map((m) =>
          m.role === "assistant" ? (
            <MsgAI
              key={m.id}
              message={m}
              streaming={streamingPendingId === m.id}
            />
          ) : (
            <MsgUser key={m.id} message={m} />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {!pinned && (
        <button
          onClick={jumpToBottom}
          aria-label="跳到最新"
          title="跳到最新"
          className="sticky bottom-4 ml-auto mr-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas border border-hairline shadow-[0_4px_14px_rgba(20,20,19,0.10)] text-[12px] text-body hover:bg-surface-card transition-colors z-10 -mt-12"
        >
          <ArrowDown size={13} strokeWidth={1.8} />
          新内容
        </button>
      )}
    </div>
  );
}

// memo so each token-level store update doesn't re-render every prior
// bubble — only the streaming one whose content changed.
const MsgAI = memo(function MsgAI({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  const retryMessage = useAppStore((s) => s.retryMessage);

  return (
    <div className="flex gap-3.5 pb-7 group/msg">
      <div className="w-7 h-7 rounded-md bg-canvas border border-hairline flex items-center justify-center mt-0.5 shrink-0">
        <SpikeMark size={13} color="var(--color-ink)" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-muted mb-1.5 font-medium">
          OC{message.mode !== "chat" ? ` · /${message.mode}` : ""}
        </div>
        {message.pending && !message.content ? (
          <TypingDots />
        ) : (
          <>
            {message.error ? (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-canvas border border-error/30 rounded-md text-[14px] text-error">
                <AlertTriangle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 break-words">{message.content}</div>
              </div>
            ) : (
              message.content && (
                <Markdown text={message.content} streaming={streaming} />
              )
            )}
            {message.aborted && !message.error && (
              <div className="mt-1.5 text-[11px] text-muted-soft">已停止生成</div>
            )}
            {message.payload && <ModeCard payload={message.payload} />}
            {!streaming && !message.pending && (
              <Toolbar
                message={message}
                onRetry={() => retryMessage(message.id)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});

function Toolbar({
  message,
  onRetry,
}: {
  message: Message;
  onRetry: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const canRetry = message.error || message.aborted || true; // always show retry
  const canCopy = !message.error && message.content.trim().length > 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // permissions might fail in iframe contexts; silently skip
    }
  }

  return (
    <div
      className={clsx(
        "mt-2 flex items-center gap-0.5 text-muted transition-opacity",
        message.error
          ? "opacity-100"
          : "opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100",
      )}
    >
      {canCopy && (
        <button
          onClick={copy}
          title={copied ? "已复制" : "复制"}
          aria-label={copied ? "已复制" : "复制"}
          className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-surface-card hover:text-ink text-[12px]"
        >
          {copied ? (
            <Check size={13} strokeWidth={1.8} className="text-success" />
          ) : (
            <Copy size={13} strokeWidth={1.8} />
          )}
        </button>
      )}
      {canRetry && (
        <button
          onClick={onRetry}
          title={message.error ? "重试" : "重新生成"}
          aria-label={message.error ? "重试" : "重新生成"}
          className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-surface-card hover:text-ink text-[12px]"
        >
          <RefreshCw size={13} strokeWidth={1.8} />
          {message.error && <span className="ml-0.5">重试</span>}
        </button>
      )}
    </div>
  );
}

function MsgUser({ message }: { message: Message }) {
  return (
    <div className="flex gap-3.5 pb-7 justify-end">
      <div className="max-w-[76%]">
        <div className="text-[12px] text-muted mb-1.5 font-medium text-right">You</div>
        <div className="text-[15px] text-body-strong leading-[1.65] bg-surface-card px-4 py-3 rounded-xl rounded-br-[4px] whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-surface-dark text-on-dark flex items-center justify-center text-[11px] font-medium mt-[22px] shrink-0">
        YT
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 pt-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse-soft"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
