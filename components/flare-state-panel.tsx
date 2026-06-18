"use client";

import { useState } from "react";

import { updateFlareState } from "@/app/(app)/actions/flares";
import { MentionBody } from "@/components/mentions/mention-body";
import {
  fieldClassName,
  focusRingClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type StateField = "tried" | "ruled_out" | "current_status";

const FIELD_LABELS: Record<StateField, string> = {
  tried: "What's been tried",
  ruled_out: "What's been ruled out",
  current_status: "Where it stands now",
};

type FlareStateFieldProps = {
  flareId: string;
  field: StateField;
  value: string | null;
  isAuthor: boolean;
  compact?: boolean;
  onDone?: () => void;
};

function FlareStateField({
  flareId,
  field,
  value,
  isAuthor,
  compact = false,
  onDone,
}: FlareStateFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const label = FIELD_LABELS[field];
  const hasValue = Boolean(value?.trim());

  if (!isAuthor && !hasValue) {
    return null;
  }

  if (!isAuthor) {
    return (
      <div className={compact ? "text-sm" : undefined}>
        <h3 className="text-xs font-medium text-fg-muted">{label}</h3>
        <MentionBody body={value ?? ""} className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-fg" />
      </div>
    );
  }

  if (!editing) {
    if (!hasValue) {
      return (
        <button
          type="button"
          onClick={() => {
            setDraft(value ?? "");
            setEditing(true);
          }}
          className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
        >
          {label} · Add
        </button>
      );
    }

    return (
      <div className="text-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-medium text-fg-muted">{label}</h3>
          <button
            type="button"
            onClick={() => {
              setDraft(value ?? "");
              setEditing(true);
            }}
            className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Edit
          </button>
        </div>
        <MentionBody body={value ?? ""} className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-fg" />
      </div>
    );
  }

  return (
    <form
      action={updateFlareState}
      className="space-y-2"
      onSubmit={() => onDone?.()}
    >
      <input type="hidden" name="flare_id" value={flareId} />
      <input type="hidden" name="field" value={field} />
      <label htmlFor={`flare_${field}`} className="text-xs font-medium text-fg-muted">
        {label}
      </label>
      <textarea
        id={`flare_${field}`}
        name="value"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        className={fieldClassName}
        autoFocus
      />
      <div className="flex gap-2">
        <button type="submit" className={primaryButtonClassName}>
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={secondaryButtonClassName}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type FlareStatePanelProps = {
  flareId: string;
  tried: string | null;
  ruledOut: string | null;
  currentStatus: string | null;
  isAuthor: boolean;
};

export function FlareStatePanel({
  flareId,
  tried,
  ruledOut,
  currentStatus,
  isAuthor,
}: FlareStatePanelProps) {
  const hasAnyState = Boolean(tried?.trim() || ruledOut?.trim() || currentStatus?.trim());
  const [expanded, setExpanded] = useState(hasAnyState);

  if (!isAuthor && !hasAnyState) {
    return null;
  }

  if (!expanded && !hasAnyState) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-fg-muted">Live state</span>
        {isAuthor ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Add
          </button>
        ) : null}
      </div>
    );
  }

  const fields: { field: StateField; value: string | null }[] = [
    { field: "tried", value: tried },
    { field: "ruled_out", value: ruledOut },
    { field: "current_status", value: currentStatus },
  ];

  const visibleFields = isAuthor
    ? fields
    : fields.filter(({ value }) => Boolean(value?.trim()));

  return (
    <section className="space-y-3" aria-label="Live state">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm text-fg-muted">Live state</h2>
        {isAuthor && !hasAnyState ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Collapse
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {visibleFields.map(({ field, value }) => (
          <FlareStateField
            key={field}
            flareId={flareId}
            field={field}
            value={value}
            isAuthor={isAuthor}
            compact
          />
        ))}
      </div>
    </section>
  );
}
