"use client";

import { useRef, useState, useTransition } from "react";

import { updateFlare, deleteFlare } from "@/app/(app)/actions/content";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MentionBody } from "@/components/mentions/mention-body";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import { fieldClassName, focusRingClassName, primaryButtonClassName, secondaryButtonClassName } from "@/lib/ui/classes";
import { flareBodyRedundantWithTitle } from "@/lib/flares/types";

type EditableFlareAskProps = {
  flareId: string;
  title: string | null;
  body: string;
  isAuthor: boolean;
  redirectTo: string;
};

export function EditableFlareAsk({
  flareId,
  title,
  body,
  isAuthor,
  redirectTo,
}: EditableFlareAskProps) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title ?? "");
  const [bodyDraft, setBodyDraft] = useState(body);
  const [isPending, startTransition] = useTransition();
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const showBody = Boolean(body?.trim()) && !flareBodyRedundantWithTitle(title, body);

  if (!isAuthor) {
    return (
      <>
        {title?.trim() ? (
          <h1 className="mt-4 text-lg font-medium text-fg">{title.trim()}</h1>
        ) : null}
        {showBody ? (
          <MentionBody body={body} className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-fg" />
        ) : null}
      </>
    );
  }

  if (editing) {
    return (
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`flare-title-${flareId}`} className="text-xs font-medium text-fg-muted">
            Title (optional)
          </label>
          <input
            id={`flare-title-${flareId}`}
            type="text"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            className={`mt-1 ${fieldClassName}`}
            disabled={isPending}
          />
        </div>
        <div>
          <label htmlFor={`flare-body-${flareId}`} className="text-xs font-medium text-fg-muted">
            What you need help with
          </label>
          <MentionTextarea
            id={`flare-body-${flareId}`}
            value={bodyDraft}
            onChange={setBodyDraft}
            rows={6}
            className={`mt-1 ${fieldClassName}`}
            disabled={isPending}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending || !bodyDraft.trim()}
            className={primaryButtonClassName}
            onClick={() => {
              const formData = new FormData();
              formData.set("flare_id", flareId);
              formData.set("redirect_to", redirectTo);
              formData.set("title", titleDraft.trim());
              formData.set("body", bodyDraft.trim());
              startTransition(async () => {
                await updateFlare(formData);
                setEditing(false);
              });
            }}
          >
            Save
          </button>
          <button
            type="button"
            disabled={isPending}
            className={secondaryButtonClassName}
            onClick={() => {
              setTitleDraft(title ?? "");
              setBodyDraft(body);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {title?.trim() ? (
            <h1 className="text-lg font-medium text-fg">{title.trim()}</h1>
          ) : null}
          {showBody ? (
            <MentionBody
              body={body}
              className={`whitespace-pre-wrap text-sm leading-relaxed text-fg ${title?.trim() ? "mt-4" : ""}`}
            />
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className={`rounded-md px-2 py-1 text-xs text-red-600 hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
          >
            Delete
          </button>
        </div>
      </div>

      <form ref={deleteFormRef} action={deleteFlare} className="hidden">
        <input type="hidden" name="flare_id" value={flareId} />
        <input type="hidden" name="redirect_to" value="/flarespace" />
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this flare?"
        description="This removes the whole thread — replies and all. You can't undo it."
        onConfirm={() => {
          setConfirmOpen(false);
          deleteFormRef.current?.requestSubmit();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
