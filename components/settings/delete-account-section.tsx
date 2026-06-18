"use client";

import { useEffect, useRef, useState } from "react";

import { deleteAccount } from "@/app/(app)/actions/account";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DELETED_BUILDER_LABEL } from "@/lib/profiles/public-fields";
import { fieldClassName, labelClassName, dangerOutlineButtonClassName, dangerSurfaceClassName, modalSectionClassName } from "@/lib/ui/classes";

const CONFIRM_PHRASE = "delete my account";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const canConfirm =
    understood && confirmText.trim().toLowerCase() === CONFIRM_PHRASE && !isSubmitting;

  function resetDialog() {
    setOpen(false);
    setUnderstood(false);
    setConfirmText("");
    setIsSubmitting(false);
  }

  function handleConfirm() {
    if (!canConfirm || !formRef.current) {
      return;
    }

    setIsSubmitting(true);
    formRef.current.requestSubmit();
  }

  return (
    <section className={dangerSurfaceClassName}>
      <h2 className="text-sm font-medium text-fg">Delete account</h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        This removes your profile, name, and avatar. You will be signed out, and it cannot be
        undone.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        Replies and comments you left to help others stay in place. They will show as{" "}
        <span className="text-fg">{DELETED_BUILDER_LABEL}</span> so threads stay intact.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-4 ${dangerOutlineButtonClassName}`}
      >
        Delete account
      </button>

      <ConfirmDialog
        open={open}
        title="Delete your account?"
        confirmLabel={isSubmitting ? "Deleting..." : "Delete account"}
        confirmDisabled={!canConfirm}
        onCancel={resetDialog}
        onConfirm={handleConfirm}
        description={
          <div className="space-y-4">
            <p>
              Your account and personal info will be removed. You will be signed out right away,
              and this cannot be undone.
            </p>
            <p>
              Things you shared to help others, like replies and comments, will stay. They will
              show as <span className="text-fg">{DELETED_BUILDER_LABEL}</span> so conversations
              do not break.
            </p>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
              <input
                type="checkbox"
                checked={understood}
                onChange={(event) => setUnderstood(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-ember"
              />
              <span>I understand this is permanent and I will be signed out.</span>
            </label>

            <div className={modalSectionClassName}>
              <label htmlFor="delete-account-confirm" className={labelClassName}>
                Type <span className="font-medium">{CONFIRM_PHRASE}</span> to confirm
              </label>
              <input
                id="delete-account-confirm"
                type="text"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                autoComplete="off"
                className={fieldClassName}
                placeholder={CONFIRM_PHRASE}
              />
            </div>
          </div>
        }
      />

      <form ref={formRef} action={deleteAccount} className="hidden" aria-hidden="true" />
    </section>
  );
}
