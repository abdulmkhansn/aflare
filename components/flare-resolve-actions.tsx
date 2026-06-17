"use client";

import { useState } from "react";

import { reopenFlare, resolveFlare } from "@/app/(app)/actions/flares";
import {
  fieldClassName,
  focusRingClassName,
  secondaryButtonClassName,
  textLinkClassName,
} from "@/lib/ui/classes";

type FlareResolveActionsProps = {
  flareId: string;
  isResolved: boolean;
};

export function FlareResolveActions({ flareId, isResolved }: FlareResolveActionsProps) {
  const [showResolveForm, setShowResolveForm] = useState(false);

  if (isResolved) {
    return (
      <div className="border-t border-border-subtle pt-4">
        <form action={reopenFlare}>
          <input type="hidden" name="flare_id" value={flareId} />
          <button type="submit" className={textLinkClassName}>
            Reopen
          </button>
        </form>
      </div>
    );
  }

  if (!showResolveForm) {
    return (
      <div className="border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={() => setShowResolveForm(true)}
          className={`text-sm text-fg-muted hover:text-fg ${focusRingClassName}`}
        >
          Mark resolved
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border-subtle pt-4">
      <form action={resolveFlare} className="space-y-3">
        <input type="hidden" name="flare_id" value={flareId} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-fg-muted">Close the loop when this is fixed.</p>
          <button
            type="button"
            onClick={() => setShowResolveForm(false)}
            className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Cancel
          </button>
        </div>

        <label htmlFor="resolution_note" className="sr-only">
          What fixed it
        </label>
        <textarea
          id="resolution_note"
          name="resolution_note"
          rows={2}
          className={fieldClassName}
          placeholder="What fixed it? (optional but helps the next person)"
        />

        <button type="submit" className={secondaryButtonClassName}>
          Mark resolved
        </button>
      </form>
    </div>
  );
}
