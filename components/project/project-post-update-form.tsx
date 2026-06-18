"use client";

import { useState } from "react";

import { createPost } from "@/app/(app)/actions/posts";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import { POST_TYPES, getPostTypeLabel } from "@/lib/posts/post-types";
import {
  cardClassName,
  errorTextClassName,
  fieldClassName,
  focusRingClassName,
  primaryButtonClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type ProjectPostUpdateFormProps = {
  projectId: string;
  posted?: boolean;
  error?: string;
};

export function ProjectPostUpdateForm({
  projectId,
  posted,
  error,
}: ProjectPostUpdateFormProps) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${primaryButtonClassName} !py-2 text-sm ${focusRingClassName}`}
      >
        Post an update
      </button>
    );
  }

  return (
    <div className={`${cardClassName} !p-4`}>
      {posted ? (
        <p className={`mb-2 ${statusTextClassName}`} role="status">
          Posted to the build log.
        </p>
      ) : null}

      {error ? (
        <p className={`mb-2 ${errorTextClassName}`} role="alert">
          {error}
        </p>
      ) : null}

      <form action={createPost} className="space-y-3">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="redirect_to" value={`/projects/${projectId}`} />

        <MentionTextarea
          name="body"
          rows={3}
          required
          autoFocus
          value={body}
          onChange={setBody}
          className="min-h-[5rem]"
          placeholder="What changed, what you learned, or where you are stuck."
        />

        <div className="flex flex-wrap items-center gap-2">
          <select name="type" defaultValue="update" className={`${fieldClassName} !w-auto !py-1.5 text-xs`}>
            {POST_TYPES.map((type) => (
              <option key={type} value={type}>
                {getPostTypeLabel(type)}
              </option>
            ))}
          </select>

          <button type="submit" className={`${primaryButtonClassName} !py-2 text-sm`}>
            Post
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
