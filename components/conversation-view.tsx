"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { markMessagesRead, sendMessage } from "@/app/(app)/actions/messages";
import { MentionBody } from "@/components/mentions/mention-body";
import { formatRelativeTime } from "@/lib/time/relative-time";
import type { MessageRow } from "@/lib/messages/types";
import { errorTextClassName, fieldClassName, primaryButtonClassName } from "@/lib/ui/classes";
import { createClient } from "@/utils/supabase/client";

type ConversationViewProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageRow[];
};

export function ConversationView({
  conversationId,
  currentUserId,
  initialMessages,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set(initialMessages.map((message) => message.id)));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    void markMessagesRead(conversationId);
  }, [conversationId, messages]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as MessageRow;

          if (seenIds.current.has(incoming.id)) {
            return;
          }

          seenIds.current.add(incoming.id);
          setMessages((current) => [...current, incoming]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const body = draft.trim();

    if (!body) {
      setError("Write a message before sending.");
      return;
    }

    startTransition(async () => {
      const result = await sendMessage(conversationId, body);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (!seenIds.current.has(result.message.id)) {
        seenIds.current.add(result.message.id);
        setMessages((current) => [...current, result.message]);
      }

      setDraft("");
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-fg-muted">Say hello. Keep it useful and direct.</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={[
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    isOwn
                      ? "rounded-br-md bg-[var(--nav-active-bg)] text-fg"
                      : "rounded-bl-md border border-border-subtle bg-surface-card text-fg",
                  ].join(" ")}
                >
                  <MentionBody
                    body={message.body}
                    inline
                    className="text-sm leading-relaxed text-fg"
                  />
                  <time
                    className="mt-1 block text-[11px] text-fg-muted"
                    dateTime={message.created_at}
                  >
                    {formatRelativeTime(message.created_at)}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-border-subtle bg-surface-page px-1 py-3"
      >
        {error ? (
          <p className={`mb-2 ${errorTextClassName}`} role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex items-end gap-2">
          <label htmlFor="message-body" className="sr-only">
            Message
          </label>
          <textarea
            id="message-body"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message"
            className={`${fieldClassName} min-h-[44px] flex-1 resize-none`}
          />
          <button
            type="submit"
            disabled={isPending || !draft.trim()}
            className={`${primaryButtonClassName} shrink-0`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
