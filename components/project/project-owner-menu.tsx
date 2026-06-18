"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { deleteProject, fetchProjectDeletePreview } from "@/app/(app)/actions/projects";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProjectDeleteConfirmBody } from "@/components/project/project-delete-confirm-body";
import type { ProjectDeletePreview } from "@/lib/projects/get-project-delete-preview";
import { focusRingClassName, popoverPanelClassName } from "@/lib/ui/classes";

type ProjectOwnerMenuProps = {
  projectId: string;
  redirectTo?: string;
  variant?: "default" | "compact";
  className?: string;
};

export function ProjectOwnerMenu({
  projectId,
  redirectTo = "/projects",
  variant = "default",
  className = "",
}: ProjectOwnerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState<ProjectDeletePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openConfirm() {
    setMenuOpen(false);
    setPreview(null);
    setPreviewError(null);
    setConfirmOpen(true);

    startPreviewTransition(async () => {
      const result = await fetchProjectDeletePreview(projectId);

      if ("error" in result) {
        setPreviewError(result.error ?? "That project was not found.");
        return;
      }

      setPreview(result.preview);
    });
  }

  function confirmDelete() {
    setConfirmOpen(false);
    startTransition(() => {
      deleteFormRef.current?.requestSubmit();
    });
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setPreview(null);
    setPreviewError(null);
  }

  const buttonClassName =
    variant === "compact"
      ? `rounded px-1 py-0.5 text-xs text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg disabled:opacity-60 ${focusRingClassName}`
      : `rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg disabled:opacity-60 ${focusRingClassName}`;

  const dialogTitle = preview ? `Delete ${preview.name}?` : "Delete this project?";

  const dialogBody = previewError ? (
    <p>{previewError}</p>
  ) : isLoadingPreview || !preview ? (
    <p>Loading project details…</p>
  ) : (
    <ProjectDeleteConfirmBody buildLogPostCount={preview.buildLogPostCount} />
  );

  return (
    <>
      <div className={`relative ${className}`} ref={menuRef}>
        <button
          type="button"
          aria-label="Project options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          disabled={isPending || isLoadingPreview}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          className={buttonClassName}
        >
          ···
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className={`absolute right-0 z-20 mt-1 min-w-[10rem] ${popoverPanelClassName} py-1`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              disabled={isLoadingPreview}
              onClick={openConfirm}
              className={`block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-[var(--hover-subtle)] disabled:opacity-60 ${focusRingClassName}`}
            >
              Delete project
            </button>
          </div>
        ) : null}
      </div>

      <form ref={deleteFormRef} action={deleteProject} className="hidden">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title={dialogTitle}
        description={dialogBody}
        confirmLabel="Delete project"
        confirmDisabled={isLoadingPreview || !preview || Boolean(previewError)}
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </>
  );
}
