"use client";

import { IconLink, IconPhoto, IconVideo } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { createFlare } from "@/app/(app)/actions/flares";
import { MentionTextarea } from "@/components/mentions/mention-textarea";
import {
  FLARE_COMPOSE_HINT,
  FLARE_COMPOSE_PLACEHOLDER,
  FLARE_TRIED_NUDGE,
} from "@/lib/flares/constants";
import { tagChipClassName } from "@/lib/flares/tag-chip-styles";
import type { TagOption } from "@/lib/flares/flare-tag-labels";
import { POST_IMAGE_MAX_BYTES } from "@/lib/storage/post-images";
import { POST_VIDEO_MAX_BYTES, POST_VIDEO_MAX_SECONDS } from "@/lib/storage/post-videos";
import { uploadPostVideoWithProgress } from "@/lib/upload/direct-storage-upload";
import { readVideoDuration, uploadFileWithProgress } from "@/lib/upload/with-progress";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import {
  cardClassName,
  errorTextClassName,
  fieldClassName,
  focusRingClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type MediaState =
  | { kind: "image"; url: string; preview: string }
  | { kind: "video"; url: string; preview: string }
  | { kind: "link"; url: string; label: string }
  | null;

type ProjectOption = {
  id: string;
  name: string;
};

type FlareComposeFormProps = {
  tags: TagOption[];
  projects?: ProjectOption[];
  redirectTo?: string;
  error?: string;
};

const TRIED_HINTS = ["tried", "attempted", "checked", "tested", "already", "restarted", "cleared"];

function bodyLooksShort(body: string) {
  return body.trim().length < 80;
}

function bodyMentionsTried(body: string) {
  const lower = body.toLowerCase();
  return TRIED_HINTS.some((hint) => lower.includes(hint));
}

function ComposeIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-[var(--hover-subtle)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClassName}`}
    >
      {children}
    </button>
  );
}

export function FlareComposeForm({
  tags,
  projects = [],
  redirectTo = "/flarespace",
  error,
}: FlareComposeFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaState>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkDraftUrl, setLinkDraftUrl] = useState("");
  const [linkDraftLabel, setLinkDraftLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dismissedNudge, setDismissedNudge] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const showTriedNudge =
    !dismissedNudge &&
    body.trim().length > 0 &&
    (bodyLooksShort(body) || !bodyMentionsTried(body));

  function openDetails() {
    setShowDetails(true);
  }

  function handleBodyFocus() {
    openDetails();
  }

  function handleBodyChange(value: string) {
    setBody(value);
    if (value.trim().length > 0) {
      openDetails();
    }
  }

  function toggleTag(tagId: string) {
    openDetails();
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]
    );
  }

  function clearMedia() {
    if (media?.kind === "image" || media?.kind === "video") {
      URL.revokeObjectURL(media.preview);
    }

    setMedia(null);
    setShowLinkForm(false);
    setLinkDraftUrl("");
    setLinkDraftLabel("");
    setUploadError(null);
    setUploadProgress(0);
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    openDetails();

    if (file.size > POST_IMAGE_MAX_BYTES) {
      setUploadError("Images must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);

    const preview = URL.createObjectURL(file);
    setMedia({ kind: "image", url: "", preview });

    const result = await uploadFileWithProgress("/api/post-images", file, setUploadProgress);

    if (!result.url) {
      URL.revokeObjectURL(preview);
      setMedia(null);
      setUploadError(result.error ?? "Couldn't upload that image. Try again.");
    } else {
      setMedia({ kind: "image", url: result.url, preview });
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = "";
  }

  async function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    openDetails();

    if (file.size > POST_VIDEO_MAX_BYTES) {
      setUploadError("That video is over 50MB. Try a shorter clip.");
      event.target.value = "";
      return;
    }

    try {
      const duration = await readVideoDuration(file);
      if (duration > POST_VIDEO_MAX_SECONDS + 1) {
        setUploadError("That clip is over 60 seconds. Try a shorter one.");
        event.target.value = "";
        return;
      }
    } catch {
      setUploadError("Couldn't read that video file. Try another format.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const preview = URL.createObjectURL(file);
    setMedia({ kind: "video", url: "", preview });

    const result = await uploadPostVideoWithProgress(file, setUploadProgress);

    if (!result.url) {
      URL.revokeObjectURL(preview);
      setMedia(null);
      setUploadError(result.error ?? "Couldn't upload that video. Try again.");
    } else {
      setMedia({ kind: "video", url: result.url, preview });
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = "";
  }

  function saveLinkAttachment() {
    const trimmedUrl = linkDraftUrl.trim();
    if (!trimmedUrl) {
      setUploadError("Add a URL for the link.");
      return;
    }

    try {
      const parsed = new URL(trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`);
      setMedia({ kind: "link", url: parsed.toString(), label: linkDraftLabel.trim() });
      setShowLinkForm(false);
      setUploadError(null);
      openDetails();
    } catch {
      setUploadError("That URL does not look valid. Include https://");
    }
  }

  const canSubmit =
    !uploading &&
    (body.trim().length > 0 ||
      (media?.kind === "image" && media.url) ||
      (media?.kind === "video" && media.url) ||
      media?.kind === "link");

  return (
    <div className={cardClassName} id="send-flare">
      {error ? (
        <p className={`mb-3 ${errorTextClassName}`} role="alert">
          {error}
        </p>
      ) : null}

      {uploadError ? (
        <p className={`mb-3 ${errorTextClassName}`} role="alert">
          {uploadError}
        </p>
      ) : null}

      <form action={createFlare} className="space-y-3">
        <input type="hidden" name="redirect_to" value={redirectTo} />
        {media?.kind === "image" && media.url ? (
          <input type="hidden" name="image_url" value={media.url} />
        ) : null}
        {media?.kind === "video" && media.url ? (
          <input type="hidden" name="uploaded_video_url" value={media.url} />
        ) : null}
        {media?.kind === "link" ? (
          <>
            <input type="hidden" name="link_url" value={media.url} />
            {media.label ? <input type="hidden" name="link_label" value={media.label} /> : null}
          </>
        ) : null}
        {selectedTagIds.map((tagId) => (
          <input key={tagId} type="hidden" name="tag_ids" value={tagId} />
        ))}

        <MentionTextarea
          id="flare_body"
          name="body"
          value={body}
          onChange={handleBodyChange}
          onFocus={handleBodyFocus}
          rows={3}
          placeholder={FLARE_COMPOSE_PLACEHOLDER}
          className={`${fieldClassName} min-h-[4.5rem] resize-y`}
        />

        <p className="text-xs text-fg-muted">{FLARE_COMPOSE_HINT}</p>

        {showTriedNudge ? (
          <div className="flex items-start justify-between gap-3 rounded-md bg-[var(--hover-subtle)] px-3 py-2">
            <p className="text-xs text-fg-muted">{FLARE_TRIED_NUDGE}</p>
            <button
              type="button"
              onClick={() => setDismissedNudge(true)}
              className={`shrink-0 text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {showDetails ? (
          <div className="space-y-3 border-t border-border-subtle pt-3">
            <div>
              <label htmlFor="flare_title" className="sr-only">
                Title (optional)
              </label>
              <input
                id="flare_title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={fieldClassName}
                placeholder="Title (optional)"
              />
            </div>

            {projects.length > 0 ? (
              <div>
                <label htmlFor="flare_project_id" className="text-xs text-fg-muted">
                  About a project <span className="text-fg-muted/70">(optional)</span>
                </label>
                <select
                  id="flare_project_id"
                  name="project_id"
                  defaultValue=""
                  className={`mt-1 ${fieldClassName}`}
                >
                  <option value="">Not tied to a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {tags.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-fg-muted">Add tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={tagChipClassName(active)}
                      >
                        {formatTagLabel(tag.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={openDetails}
            className={`text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Add details
          </button>
        )}

        {media?.kind === "image" ? (
          <div className="relative overflow-hidden rounded-lg border border-border-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.preview} alt="" className="max-h-40 w-full object-cover" />
            <button
              type="button"
              onClick={clearMedia}
              className={`absolute right-2 top-2 rounded-md bg-charcoal/80 px-2 py-1 text-xs text-warmwhite ${focusRingClassName}`}
            >
              Remove
            </button>
          </div>
        ) : null}

        {media?.kind === "video" ? (
          <div className="relative overflow-hidden rounded-lg border border-border-subtle">
            <video src={media.preview} controls playsInline className="max-h-40 w-full" />
            <button
              type="button"
              onClick={clearMedia}
              className={`absolute right-2 top-2 rounded-md bg-charcoal/80 px-2 py-1 text-xs text-warmwhite ${focusRingClassName}`}
            >
              Remove
            </button>
          </div>
        ) : null}

        {media?.kind === "link" ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2">
            <span className="truncate text-sm text-fg">{media.label || media.url}</span>
            <button type="button" onClick={clearMedia} className={`text-xs text-fg-muted ${focusRingClassName}`}>
              Remove
            </button>
          </div>
        ) : null}

        {showLinkForm ? (
          <div className="space-y-2 rounded-md border border-border-subtle p-3">
            <input
              value={linkDraftUrl}
              onChange={(event) => setLinkDraftUrl(event.target.value)}
              className={fieldClassName}
              placeholder="https://"
            />
            <input
              value={linkDraftLabel}
              onChange={(event) => setLinkDraftLabel(event.target.value)}
              className={fieldClassName}
              placeholder="Link label (optional)"
            />
            <div className="flex gap-2">
              <button type="button" onClick={saveLinkAttachment} className={primaryButtonClassName}>
                Add link
              </button>
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className={secondaryButtonClassName}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-0.5">
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            <ComposeIconButton label="Photo" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
              <IconPhoto className="h-4 w-4" stroke={1.75} />
            </ComposeIconButton>
            <ComposeIconButton label="Video" onClick={() => videoInputRef.current?.click()} disabled={uploading}>
              <IconVideo className="h-4 w-4" stroke={1.75} />
            </ComposeIconButton>
            <ComposeIconButton
              label="Link"
              onClick={() => {
                openDetails();
                setShowLinkForm(true);
              }}
              disabled={uploading}
            >
              <IconLink className="h-4 w-4" stroke={1.75} />
            </ComposeIconButton>
          </div>

          <div className="flex items-center gap-2">
            {uploading ? (
              <p className="text-xs text-fg-muted">Uploading… {uploadProgress}%</p>
            ) : null}
            <button type="submit" className={primaryButtonClassName} disabled={!canSubmit}>
              Send up a flare
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
