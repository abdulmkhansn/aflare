"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { boostFlare } from "@/app/(app)/actions/boosts";
import { BoostActionTrigger } from "@/components/content-action-row";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import type { FlareStatus } from "@/lib/flares/types";
import { canBoostFlare } from "@/lib/posts/boost";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";
import {
  errorTextClassName,
  focusRingClassName,
  labelClassName,
  modalActionsClassName,
  modalBodyClassName,
  modalDescriptionClassName,
  modalDialogClassName,
  modalFieldShellClassName,
  modalInlineErrorClassName,
  modalSectionClassName,
  modalTitleClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type FlareBoostControlProps = {
  flareId: string;
  flareAuthorId: string;
  flareStatus: FlareStatus;
  currentUserId: string;
  redirectTo: string;
  compact?: boolean;
};

export function FlareBoostControl({
  flareId,
  flareAuthorId,
  flareStatus,
  currentUserId,
  redirectTo,
  compact = true,
}: FlareBoostControlProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canBoost = canBoostFlare(
    { author_id: flareAuthorId, status: flareStatus },
    currentUserId
  );

  if (!canBoost) {
    return null;
  }

  function openDialog() {
    setNote("");
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

      const result = await boostFlare(formData);

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
      {compact ? (
        <BoostActionTrigger onClick={openDialog} disabled={isPending} />
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={openDialog}
          className={`inline-flex h-8 items-center gap-1 rounded-full border border-border-subtle px-2.5 text-xs font-medium text-fg-muted transition-colors hover:border-fg/20 hover:text-fg disabled:cursor-not-allowed disabled:opacity-60 ${focusRingClassName}`}
          title="Know someone who can help?"
        >
          Share
        </button>
      )}

      {success ? (
        <span className="sr-only" role="status">
          Shared to your followers.
        </span>
      ) : null}

      <dialog
        ref={dialogRef}
        className={modalDialogClassName}
        onClose={() => {
          if (!isPending) {
            setError(null);
          }
        }}
      >
        <form className={modalBodyClassName} onSubmit={handleSubmit}>
          <h2 className={modalTitleClassName}>Share this flare</h2>
          <p className={modalDescriptionClassName}>
            Share it with people who might have answers. Add a note if you want.
          </p>

          <input type="hidden" name="flare_id" value={flareId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          {error ? (
            <p className={`${modalInlineErrorClassName} ${errorTextClassName}`} role="alert">
              {error}
            </p>
          ) : null}

          <div className={modalSectionClassName}>
            <label htmlFor={`boost-note-${flareId}`} className={labelClassName}>
              Add a note <span className="font-normal text-fg-muted">(optional)</span>
            </label>
            <MentionTextarea
              id={`boost-note-${flareId}`}
              name="note"
              rows={3}
              value={note}
              onChange={setNote}
              disabled={isPending}
              shellClassName={modalFieldShellClassName}
              className="min-h-[5rem]"
              placeholder="Add a note (optional)"
            />
          </div>

          <div className={modalActionsClassName}>
            <button type="button" onClick={closeDialog} className={secondaryButtonClassName} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className={primaryButtonClassName} disabled={isPending}>
              {isPending ? "Sharing…" : "Share"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
