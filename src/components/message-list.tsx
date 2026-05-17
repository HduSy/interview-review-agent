"use client";

import { useEffect, useRef } from "react";
import { SpikeMark } from "./spike-mark";
import { ModeCard } from "./mode-cards";
import type { Message } from "@/lib/messages";

export function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  return (
    <div className="flex-1 overflow-y-auto px-6 sm:px-16 pt-10 pb-4">
      <div className="max-w-3xl mx-auto w-full">
        {messages.map((m) =>
          m.role === "assistant" ? (
            <MsgAI key={m.id} message={m} />
          ) : (
            <MsgUser key={m.id} message={m} />
          ),
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MsgAI({ message }: { message: Message }) {
  return (
    <div className="flex gap-3.5 pb-7">
      <div className="w-7 h-7 rounded-md bg-canvas border border-hairline flex items-center justify-center mt-0.5 shrink-0">
        <SpikeMark size={13} color="var(--color-ink)" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-muted mb-1.5 font-medium">
          OC{message.mode !== "chat" ? ` · /${message.mode}` : ""}
        </div>
        {message.pending ? (
          <TypingDots />
        ) : (
          <>
            {message.content && (
              <div className="text-[15px] text-body-strong leading-[1.65] whitespace-pre-wrap">
                {message.content}
              </div>
            )}
            {message.payload && <ModeCard payload={message.payload} />}
          </>
        )}
      </div>
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
