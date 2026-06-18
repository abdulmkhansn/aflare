"use client";

import { useRef, useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { MentionBody } from "@/components/mentions/mention-body";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import { fieldClassName, focusRingClassName, primaryButtonClassName, secondaryButtonClassName } from "@/lib/ui/classes";

type EditableContentBodyProps = {
  body: string;
  isAuthor: boolean;
  editAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  deleteTitle: string;
  deleteDescription: string;
  bodyClassName?: string;
  multiline?: boolean;
  emptyMenuOnly?: boolean;
};

export function EditableContentBody({
  body,
  isAuthor,
  editAction,
  deleteAction,
  hiddenFields,
  deleteTitle,
  deleteDescription,
  bodyClassName = "whitespace-pre-wrap text-sm leading-relaxed text-fg",
  multiline = true,
  emptyMenuOnly = false,
}: EditableContentBodyProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draft, setDraft] = useState(body);
  const [isPending, startTransition] = useTransition();
  const deleteFormRef = useRef<HTMLFormElement>(null);

  if (!isAuthor) {
    return <MentionBody body={body} className={bodyClassName} />;
  }

  function startEdit() {
    setDraft(body);
    setEditing(true);
    setMenuOpen(false);
  }

  function cancelEdit() {
    setDraft(body);
    setEditing(false);
  }

  function saveEdit() {
    const formData = new FormData();
    for (const [key, value] of Object.entries(hiddenFields)) {
      formData.set(key, value);
    }
    formData.set("body", draft.trim());

    startTransition(async () => {
      await editAction(formData);
      setEditing(false);
    });
  }

  const showEmptyMenuOnly = emptyMenuOnly && !body.trim() && !editing;

  function confirmDelete() {
    setConfirmOpen(false);
    setMenuOpen(false);
    deleteFormRef.current?.requestSubmit();
  }

  if (editing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <MentionTextarea
            value={draft}
            onChange={setDraft}
            rows={4}
            className={fieldClassName}
            disabled={isPending}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className={fieldClassName}
            disabled={isPending}
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveEdit}
            disabled={isPending || (!emptyMenuOnly && !draft.trim())}
            className={primaryButtonClassName}
          >
            Save
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={isPending}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (showEmptyMenuOnly) {
    return (
      <>
        <div className="flex justify-end">
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="Content options"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
              className={`rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
            >
              ···
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-1 min-w-[7rem] rounded-md border border-border-subtle bg-surface-card py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={startEdit}
                  className={`block w-full px-3 py-1.5 text-left text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                >
                  Add a thought
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <form ref={deleteFormRef} action={deleteAction} className="hidden">
          {Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>

        <ConfirmDialog
          open={confirmOpen}
          title={deleteTitle}
          description={deleteDescription}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <MentionBody body={body} className={bodyClassName} />
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Content options"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={`rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
          >
            ···
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-10 mt-1 min-w-[7rem] rounded-md border border-border-subtle bg-surface-card py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={startEdit}
                className={`block w-full px-3 py-1.5 text-left text-sm text-fg hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
              >
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className={`block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-[var(--hover-subtle)] ${focusRingClassName}`}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <form ref={deleteFormRef} action={deleteAction} className="hidden">
        {Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title={deleteTitle}
        description={deleteDescription}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
