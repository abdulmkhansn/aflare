"use client";

import { useEffect, useRef, useState } from "react";

import { startConversation } from "@/app/(app)/actions/messages";
import { Avatar } from "@/components/avatar";
import type { BuilderSearchResult } from "@/lib/search/run-builder-search";
import {
  cardClassName,
  fieldClassName,
  focusRingClassName,
  labelClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type NewMessagePickerProps = {
  redirectTo?: string;
};

export function NewMessagePicker({ redirectTo = "/messages" }: NewMessagePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [builders, setBuilders] = useState<BuilderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setBuilders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/messages/builders?q=${encodeURIComponent(trimmed)}`
        );

        if (!response.ok) {
          setBuilders([]);
          return;
        }

        const data = (await response.json()) as { builders: BuilderSearchResult[] };
        setBuilders(data.builders ?? []);
      } catch {
        setBuilders([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  function handleToggle() {
    setOpen((value) => {
      if (value) {
        setQuery("");
        setBuilders([]);
      }

      return !value;
    });
  }

  return (
    <div ref={panelRef} className="w-full">
      <div className="flex justify-end">
        <button type="button" onClick={handleToggle} className={secondaryButtonClassName}>
          {open ? "Cancel" : "New message"}
        </button>
      </div>

      {open ? (
        <div className={`${cardClassName} mt-4`}>
          <h2 className="text-sm font-medium text-fg">Find a builder</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Search by display name. Blocked builders will not appear.
          </p>

          <div className="mt-4 space-y-1.5">
            <label htmlFor="new-message-search" className={labelClassName}>
              Name
            </label>
            <input
              id="new-message-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Start typing a name…"
              className={fieldClassName}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-fg-muted">Searching…</p>
            ) : !query.trim() ? (
              <p className="text-sm text-fg-muted">Type a name to find someone.</p>
            ) : builders.length === 0 ? (
              <p className="text-sm text-fg-muted">No builders match that name.</p>
            ) : (
              <ul className="space-y-1">
                {builders.map((builder) => {
                  const name = builder.displayName?.trim() || "Unknown builder";

                  return (
                    <li key={builder.id}>
                      <form action={startConversation}>
                        <input type="hidden" name="user_id" value={builder.id} />
                        <input type="hidden" name="redirect_to" value={redirectTo} />
                        <button
                          type="submit"
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                        >
                          <Avatar
                            displayName={builder.displayName}
                            avatarUrl={builder.avatarUrl}
                            size="sm"
                          />
                          <span className="truncate text-sm font-medium text-fg">{name}</span>
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
