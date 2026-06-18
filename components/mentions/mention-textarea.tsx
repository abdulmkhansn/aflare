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

import { MentionComposeBackdrop } from "@/components/mentions/mention-compose-backdrop";
import { Avatar } from "@/components/avatar";
import {
  composeDisplayToStorage,
  findTextEdit,
  insertMentionInCompose,
  reconcileSpansAfterEdit,
  storageToComposeDisplay,
  validateMentionSpans,
  type MentionSpan,
} from "@/lib/mentions/compose-mentions";
import { getActiveMentionQuery } from "@/lib/mentions/mention-input";
import type { BuilderSearchResult } from "@/lib/search/run-builder-search";
import {
  fieldControlClassName,
  fieldShellClassName,
  focusRingClassName,
  textareaControlClassName,
} from "@/lib/ui/classes";

type MentionTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
  /** When true, border/background come from a parent shell (e.g. feed compose). */
  embedded?: boolean;
  shellClassName?: string;
};

export function MentionTextarea({
  value,
  onChange,
  className,
  shellClassName,
  embedded = false,
  name,
  onKeyDown,
  onClick,
  onKeyUp,
  ...props
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastEmittedStorage = useRef(value);
  const listId = useId();
  const initialCompose = storageToComposeDisplay(value);
  const [displayText, setDisplayText] = useState(initialCompose.text);
  const [spans, setSpans] = useState<MentionSpan[]>(initialCompose.spans);
  const [open, setOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BuilderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (value === lastEmittedStorage.current) {
      return;
    }

    const { text, spans: nextSpans } = storageToComposeDisplay(value);
    setDisplayText(text);
    setSpans(nextSpans);
    lastEmittedStorage.current = value;
  }, [value]);

  const emitStorage = useCallback(
    (text: string, nextSpans: MentionSpan[]) => {
      const storage = composeDisplayToStorage(text, nextSpans);
      lastEmittedStorage.current = storage;
      onChange(storage);
    },
    [onChange]
  );

  const refreshMentionState = useCallback((text: string, cursor: number, activeSpans: MentionSpan[]) => {
    const active = getActiveMentionQuery(text, cursor, activeSpans);

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
    const { text, spans: nextSpans, nextCursor } = insertMentionInCompose(
      displayText,
      spans,
      mentionStart,
      textarea.selectionStart,
      displayName,
      builder.id
    );

    setDisplayText(text);
    setSpans(nextSpans);
    emitStorage(text, nextSpans);
    setOpen(false);
    setQuery("");

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextDisplay = event.target.value;
    const edit = findTextEdit(displayText, nextDisplay);
    const shiftedSpans = reconcileSpansAfterEdit(spans, edit);
    const nextSpans = validateMentionSpans(nextDisplay, shiftedSpans);

    setDisplayText(nextDisplay);
    setSpans(nextSpans);
    emitStorage(nextDisplay, nextSpans);
    refreshMentionState(nextDisplay, event.target.selectionStart, nextSpans);
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

  const storageValue = composeDisplayToStorage(displayText, spans);
  const minHeightClass = className?.match(/\bmin-h-\[[^\]]+\]|\bmin-h-\S+/)?.[0] ?? "";
  const controlExtras =
    className
      ?.replace(minHeightClass, "")
      .replace(/\bresize-\S+/g, "")
      .replace(/\bborder-\S+/g, "")
      .replace(/\bbg-\S+/g, "")
      .replace(/\bshadow-\S+/g, "")
      .trim() ?? "";

  const controlClassName = embedded
    ? [className ?? fieldControlClassName, "resize-none"].join(" ")
    : [textareaControlClassName, controlExtras].filter(Boolean).join(" ");
  const backdropClassName = [
    controlClassName,
    "pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words text-fg",
  ].join(" ");
  const textareaClassName = [
    controlClassName,
    "relative z-[1] w-full bg-transparent text-transparent caret-fg selection:bg-teal/30",
  ].join(" ");

  const editor = (
    <div className="relative min-h-[inherit]">
      <MentionComposeBackdrop text={displayText} spans={spans} className={backdropClassName} />
      <textarea
        ref={textareaRef}
        value={displayText}
        onChange={handleChange}
        onClick={(event) => {
          refreshMentionState(displayText, event.currentTarget.selectionStart, spans);
          onClick?.(event);
        }}
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          } else {
            refreshMentionState(displayText, event.currentTarget.selectionStart, spans);
          }
          onKeyUp?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={textareaClassName}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        {...props}
      />
    </div>
  );

  return (
    <div className="relative">
      {name ? <input type="hidden" name={name} value={storageValue} readOnly /> : null}

      {embedded ? (
        editor
      ) : (
        <div className={[shellClassName ?? fieldShellClassName, minHeightClass].filter(Boolean).join(" ")}>
          {editor}
        </div>
      )}

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
              const label = builder.displayName?.trim() || "Unknown builder";

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
                  <span className="truncate font-medium">{label}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
