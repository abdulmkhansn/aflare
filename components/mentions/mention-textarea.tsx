"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from "react";

import { Avatar } from "@/components/avatar";
import { getActiveMentionQuery, insertMentionAt } from "@/lib/mentions/mention-input";
import type { BuilderSearchResult } from "@/lib/search/run-builder-search";
import { focusRingClassName } from "@/lib/ui/classes";

type MentionTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
};

export function MentionTextarea({
  value,
  onChange,
  className,
  onKeyDown,
  onClick,
  onKeyUp,
  ...props
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BuilderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const refreshMentionState = useCallback((text: string, cursor: number) => {
    const active = getActiveMentionQuery(text, cursor);

    if (!active) {
      setOpen(false);
      setQuery("");
      return;
    }

    setOpen(true);
    setMentionStart(active.start);
    setQuery(active.query);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/messages/builders?q=${encodeURIComponent(query.trim())}`
        );

        if (!response.ok) {
          setResults([]);
          return;
        }

        const data = (await response.json()) as { builders: BuilderSearchResult[] };
        setResults(data.builders ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  function selectBuilder(builder: BuilderSearchResult) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const displayName = builder.displayName?.trim() || "Unknown builder";
    const { nextValue, nextCursor } = insertMentionAt(
      value,
      mentionStart,
      textarea.selectionStart,
      displayName,
      builder.id
    );

    onChange(nextValue);
    setOpen(false);
    setQuery("");

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    onChange(next);
    refreshMentionState(next, event.target.selectionStart);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (open) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (results.length > 0) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((index) => Math.min(index + 1, results.length - 1));
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((index) => Math.max(index - 1, 0));
          return;
        }

        if (event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
          event.preventDefault();
          selectBuilder(results[activeIndex]);
          return;
        }
      }
    }

    onKeyDown?.(event);
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onClick={(event) => {
          refreshMentionState(value, event.currentTarget.selectionStart);
          onClick?.(event);
        }}
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          } else {
            refreshMentionState(value, event.currentTarget.selectionStart);
          }
          onKeyUp?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={className}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        {...props}
      />

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-48 w-full min-w-[14rem] overflow-y-auto rounded-md border border-border-subtle bg-surface-card py-1 shadow-[var(--elevation-card)]"
        >
          {loading ? (
            <p className="px-3 py-2 text-sm text-fg-muted">Searching…</p>
          ) : !query.trim() ? (
            <p className="px-3 py-2 text-sm text-fg-muted">Type a name after @</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-fg-muted">No builders match that.</p>
          ) : (
            results.map((builder, index) => {
              const name = builder.displayName?.trim() || "Unknown builder";

              return (
                <button
                  key={builder.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectBuilder(builder)}
                  className={[
                    "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    focusRingClassName,
                    index === activeIndex
                      ? "bg-[var(--hover-subtle)] text-fg"
                      : "text-fg hover:bg-[var(--hover-subtle)]",
                  ].join(" ")}
                >
                  <Avatar
                    displayName={builder.displayName}
                    avatarUrl={builder.avatarUrl}
                    size="sm"
                  />
                  <span className="truncate font-medium">{name}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
