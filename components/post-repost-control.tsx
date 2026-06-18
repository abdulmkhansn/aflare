"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { repostPost } from "@/app/(app)/actions/reposts";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";
import {
  errorTextClassName,
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
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quote, setQuote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function openDialog() {
    if (disabled) {
      return;
    }

    setQuote("");
    setError(null);
    setSuccess(false);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setError(null);
      setSuccess(false);

      const result = await repostPost(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      closeDialog();
      refreshInPlace(router);
    });
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

      {success ? (
        <span className="sr-only" role="status">
          Reposted to your followers.
        </span>
      ) : null}

      <dialog
        ref={dialogRef}
        className="centered-dialog w-[min(100%,28rem)] rounded-lg border border-border-subtle bg-surface-card p-0 text-fg shadow-[var(--elevation-card)]"
        onClose={() => {
          if (!isPending) {
            setError(null);
          }
        }}
      >
        <form className="p-5" onSubmit={handleSubmit}>
          <h2 className="text-base font-medium text-fg">Repost</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Share this with your followers. Add a thought if you want, or leave it blank.
          </p>

          <input type="hidden" name="post_id" value={postId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          {error ? (
            <p className={`mt-3 ${errorTextClassName}`} role="alert">
              {error}
            </p>
          ) : null}

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
              disabled={isPending}
              className="mt-1.5 w-full rounded-md border border-[var(--border-input)] bg-surface-input px-3 py-2 text-sm text-fg shadow-[var(--elevation-input)] outline-none placeholder:text-fg-muted focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
              placeholder="Add a note (optional)"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={closeDialog} className={secondaryButtonClassName} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClassName} disabled={isPending}>
              {isPending ? "Reposting…" : "Repost"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
