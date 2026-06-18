"use client";

import { useEffect, useRef, type ReactNode } from "react";

import {
  dangerButtonClassName,
  focusRingClassName,
  modalActionsClassName,
  modalBackdropClassName,
  modalBodyClassName,
  modalDescriptionClassName,
  modalPanelClassName,
  modalTitleClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className={modalBackdropClassName} role="presentation" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={modalPanelClassName}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={modalBodyClassName}>
          <h2 id="confirm-dialog-title" className={modalTitleClassName}>
            {title}
          </h2>
          <div id="confirm-dialog-description" className={modalDescriptionClassName}>
            {description}
          </div>
          <div className={modalActionsClassName}>
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className={secondaryButtonClassName}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={`${dangerButtonClassName} ${focusRingClassName}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
