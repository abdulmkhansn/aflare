"use client";

import { useRef, useState } from "react";

import { repostPost } from "@/app/(app)/actions/reposts";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import {
  focusRingClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type PostRepostControlProps = {
  postId: string;
  redirectTo: string;
  disabled?: boolean;
};

export function PostRepostControl({ postId, redirectTo, disabled = false }: PostRepostControlProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quote, setQuote] = useState("");

  function openDialog() {
    if (disabled) {
      return;
    }

    setQuote("");
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openDialog}
        className={`inline-flex items-center gap-1 rounded-full border border-border-subtle px-2.5 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-fg/20 hover:text-fg disabled:cursor-not-allowed disabled:opacity-60 ${focusRingClassName}`}
      >
        Repost
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(100%,28rem)] rounded-lg border border-border-subtle bg-surface-card p-0 text-fg shadow-[var(--elevation-card)] backdrop:bg-charcoal/40"
      >
        <form
          action={repostPost}
          className="p-5"
          onSubmit={() => {
            closeDialog();
          }}
        >
          <h2 className="text-base font-medium text-fg">Repost</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Share this with your followers. Add a thought if you want — or leave it blank.
          </p>

          <input type="hidden" name="post_id" value={postId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="mt-4">
            <label htmlFor={`repost-quote-${postId}`} className="text-sm font-medium text-fg">
              Add your thoughts <span className="font-normal text-fg-muted">(optional)</span>
            </label>
            <MentionTextarea
              id={`repost-quote-${postId}`}
              name="quote"
              rows={3}
              value={quote}
              onChange={setQuote}
              className="mt-1.5 w-full rounded-md border border-[var(--border-input)] bg-surface-input px-3 py-2 text-sm text-fg shadow-[var(--elevation-input)] outline-none placeholder:text-fg-muted focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
              placeholder="Why this is worth a look…"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={closeDialog} className={secondaryButtonClassName}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClassName}>
              Repost
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
