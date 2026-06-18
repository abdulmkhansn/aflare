"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconFileText, IconLink, IconPhoto, IconVideo } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { createFeedPost } from "@/app/(app)/actions/posts";
import { FLARE_SEND_EXPLAINER } from "@/lib/flares/constants";
import { DEFAULT_COMPOSE_PROMPT, pickComposePrompt } from "@/lib/posts/composer-prompts";
import { POST_TYPES, BLOCKER_POST_TYPES, getPostTypeLabel } from "@/lib/posts/post-types";
import { POST_IMAGE_MAX_BYTES } from "@/lib/storage/post-images";
import { POST_VIDEO_MAX_BYTES, POST_VIDEO_MAX_SECONDS } from "@/lib/storage/post-videos";
import { uploadPostVideoWithProgress } from "@/lib/upload/direct-storage-upload";
import { readVideoDuration, uploadFileWithProgress } from "@/lib/upload/with-progress";
import {
  cardClassName,
  errorTextClassName,
  fieldClassName,
  focusRingClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

const COMPOSE_TEXTAREA_CLASS =
  "min-h-[5.5rem] w-full resize-none border-0 bg-transparent px-3.5 py-3.5 text-sm leading-[1.5] text-fg outline-none placeholder:text-fg-muted focus-visible:ring-0";

type ProjectOption = {
  id: string;
  name: string;
};

type MediaState =
  | {
      kind: "image";
      url: string;
      preview: string;
    }
  | {
      kind: "video";
      url: string;
      preview: string;
    }
  | {
      kind: "link";
      url: string;
      label: string;
    }
  | null;

type FeedComposeFormProps = {
  projects: ProjectOption[];
  posted?: boolean;
  error?: string;
};

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
      className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-[var(--hover-subtle)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClassName}`}
    >
      {children}
    </button>
  );
}

export function FeedComposeForm({ projects, posted, error }: FeedComposeFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>(DEFAULT_COMPOSE_PROMPT);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [showPostedNote, setShowPostedNote] = useState(false);
  const [media, setMedia] = useState<MediaState>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkDraftUrl, setLinkDraftUrl] = useState("");
  const [linkDraftLabel, setLinkDraftLabel] = useState("");
  const [addToProject, setAddToProject] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [postType, setPostType] = useState("update");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const showPlaceholder = body.length === 0;

  useEffect(() => {
    setPrompt(pickComposePrompt());
  }, []);

  useEffect(() => {
    if (!posted) {
      return;
    }

    setShowPostedNote(true);

    const timer = window.setTimeout(() => {
      setShowPostedNote(false);
      router.replace("/", { scroll: false });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [posted, router]);

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

  function replaceMediaNote() {
    setUploadError("Remove the current attachment before adding another.");
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (media && media.kind !== "image") {
      replaceMediaNote();
      event.target.value = "";
      return;
    }

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
      setUploadError(result.error ?? "Could not upload that image. Try again.");
    } else {
      setMedia({ kind: "image", url: result.url, preview });
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = "";
  }

  async function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (media && media.kind !== "video") {
      replaceMediaNote();
      event.target.value = "";
      return;
    }

    if (file.size > POST_VIDEO_MAX_BYTES) {
      setUploadError("That video is over 50MB. Try a shorter clip.");
      event.target.value = "";
      return;
    }

    setUploadError(null);

    try {
      const duration = await readVideoDuration(file);

      if (duration > POST_VIDEO_MAX_SECONDS + 1) {
        setUploadError("That clip is over 60 seconds. Try a shorter one.");
        event.target.value = "";
        return;
      }
    } catch {
      setUploadError("Could not read that video file. Try another format.");
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
      setUploadError(result.error ?? "Could not upload that video. Try again.");
    } else {
      setMedia({ kind: "video", url: result.url, preview });
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = "";
  }

  function openLinkForm() {
    if (media && media.kind !== "link") {
      replaceMediaNote();
      return;
    }

    setShowLinkForm(true);
    setUploadError(null);

    if (media?.kind === "link") {
      setLinkDraftUrl(media.url);
      setLinkDraftLabel(media.label);
    }
  }

  function saveLinkAttachment() {
    const trimmedUrl = linkDraftUrl.trim();

    if (!trimmedUrl) {
      setUploadError("Add a URL for the link.");
      return;
    }

    try {
      const parsed = new URL(trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`);
      setMedia({
        kind: "link",
        url: parsed.toString(),
        label: linkDraftLabel.trim(),
      });
      setShowLinkForm(false);
      setUploadError(null);
    } catch {
      setUploadError("That URL does not look valid. Include https://");
    }
  }

  const canPost =
    !uploading &&
    (!addToProject || Boolean(projectId)) &&
    (body.trim().length > 0 ||
      (media?.kind === "image" && media.url) ||
      (media?.kind === "video" && media.url) ||
      media?.kind === "link");

  const isBlockerPath =
    addToProject &&
    BLOCKER_POST_TYPES.includes(postType as (typeof BLOCKER_POST_TYPES)[number]);

  return (
    <div className={cardClassName}>
      {error ? (
        <p className={`mb-4 ${errorTextClassName}`} role="alert">
          {error}
        </p>
      ) : null}

      <form action={createFeedPost} className="space-y-5">
        <input type="hidden" name="redirect_to" value="/" />
        <input type="hidden" name="add_to_project" value={addToProject ? "1" : "0"} />
        {addToProject ? (
          <>
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="type" value={postType} />
          </>
        ) : null}
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

        <div className="relative overflow-hidden rounded-md border border-[var(--border-input)] bg-surface-input shadow-[var(--elevation-input)] focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-2 focus-within:ring-offset-surface-page">
          {showPlaceholder ? (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 px-3.5 py-3.5 text-sm leading-[1.5] text-fg-muted"
            >
              {prompt}
            </p>
          ) : null}
          <textarea
            id="feed-compose-body"
            name="body"
            rows={3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={COMPOSE_TEXTAREA_CLASS}
            aria-label="Post"
          />
        </div>

        {media?.kind === "image" ? (
          <div className="relative inline-block max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.preview}
              alt=""
              className="max-h-52 rounded-lg border border-border-subtle object-cover"
            />
            <button
              type="button"
              onClick={clearMedia}
              className={`absolute top-2 right-2 rounded-md bg-charcoal/80 px-2 py-1 text-xs text-warmwhite ${focusRingClassName}`}
            >
              Remove
            </button>
          </div>
        ) : null}

        {media?.kind === "video" ? (
          <div className="relative max-w-full">
            <video
              src={media.preview}
              controls
              playsInline
              className="max-h-52 w-full rounded-lg border border-border-subtle bg-black"
            />
            <button
              type="button"
              onClick={clearMedia}
              className={`absolute top-2 right-2 rounded-md bg-charcoal/80 px-2 py-1 text-xs text-warmwhite ${focusRingClassName}`}
            >
              Remove
            </button>
          </div>
        ) : null}

        {media?.kind === "link" && !showLinkForm ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-[var(--hover-subtle)] px-3 py-2">
            <span className="min-w-0 truncate text-sm text-fg">
              {media.label || media.url}
            </span>
            <button
              type="button"
              onClick={clearMedia}
              className={`shrink-0 text-xs text-fg-muted hover:text-fg ${focusRingClassName}`}
            >
              Remove
            </button>
          </div>
        ) : null}

        {showLinkForm ? (
          <div className="space-y-3 rounded-lg border border-border-subtle bg-[var(--hover-subtle)] p-3">
            <div className="space-y-1.5">
              <label htmlFor="feed-link-url" className={labelClassName}>
                Link URL
              </label>
              <input
                id="feed-link-url"
                type="url"
                value={linkDraftUrl}
                onChange={(event) => setLinkDraftUrl(event.target.value)}
                placeholder="https://"
                className={fieldClassName}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="feed-link-label" className={labelClassName}>
                Label <span className="font-normal text-fg-muted">(optional)</span>
              </label>
              <input
                id="feed-link-label"
                type="text"
                value={linkDraftLabel}
                onChange={(event) => setLinkDraftLabel(event.target.value)}
                placeholder="What is this link?"
                className={fieldClassName}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveLinkAttachment} className={secondaryButtonClassName}>
                Attach link
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkForm(false);
                  if (media?.kind !== "link") {
                    setLinkDraftUrl("");
                    setLinkDraftLabel("");
                  }
                }}
                className={secondaryButtonClassName}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {uploading ? (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--pill-neutral-bg)]">
              <div
                className="h-full rounded-full bg-ember transition-all"
                style={{ width: `${Math.max(uploadProgress, 8)}%` }}
              />
            </div>
            <p className="text-xs text-fg-muted">Uploading… {uploadProgress > 0 ? `${uploadProgress}%` : ""}</p>
          </div>
        ) : null}

        {uploadError ? (
          <p className="text-sm text-fg" role="alert">
            {uploadError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-4">
          <div className="flex items-center gap-1">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={handleImageChange}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={handleVideoChange}
            />
            <ComposeIconButton
              label="Photo"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
            >
              <IconPhoto className="h-5 w-5" stroke={1.75} />
            </ComposeIconButton>
            <ComposeIconButton
              label="Video"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
            >
              <IconVideo className="h-5 w-5" stroke={1.75} />
            </ComposeIconButton>
            <ComposeIconButton label="Link" onClick={openLinkForm} disabled={uploading}>
              <IconLink className="h-5 w-5" stroke={1.75} />
            </ComposeIconButton>
            <Link
              href="/articles/new"
              title="Write article"
              aria-label="Write article"
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
            >
              <IconFileText className="h-5 w-5" stroke={1.75} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {showPostedNote ? (
              <p className="text-sm text-teal" role="status" aria-live="polite">
                Posted.
              </p>
            ) : null}
            <button type="submit" className={primaryButtonClassName} disabled={!canPost}>
              Post
            </button>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setAddToProject((value) => !value)}
              className={`text-sm text-fg-muted hover:text-fg ${focusRingClassName}`}
            >
              {addToProject ? "Share to feed instead" : "Add to a project"}
            </button>

            {!addToProject ? (
              <Link
                href="/flarespace#send-flare"
                className={`text-sm text-fg-muted hover:text-fg ${focusRingClassName}`}
              >
                Stuck? Send up a flare
              </Link>
            ) : null}
          </div>

          {!addToProject ? (
            <p className="mt-2 text-xs text-fg-muted">{FLARE_SEND_EXPLAINER}</p>
          ) : null}

          {isBlockerPath ? (
            <div className="mt-3 rounded-md border border-border-subtle bg-[var(--hover-subtle)] px-3 py-2.5">
              <p className="text-sm text-fg-muted">
                For getting unstuck with the room,{" "}
                <Link href="/flarespace#send-flare" className="text-fg underline underline-offset-2">
                  send up a flare
                </Link>{" "}
                in Flarespace instead.
              </p>
              <p className="mt-1 text-xs text-fg-muted">{FLARE_SEND_EXPLAINER}</p>
            </div>
          ) : null}

          {addToProject ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <label htmlFor="compose_project_id" className={labelClassName}>
                  Project
                </label>
                <select
                  id="compose_project_id"
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  required={addToProject}
                  className={fieldClassName}
                >
                  <option value="">Pick a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <label htmlFor="compose_post_type" className={labelClassName}>
                  Type
                </label>
                <select
                  id="compose_post_type"
                  value={postType}
                  onChange={(event) => setPostType(event.target.value)}
                  className={fieldClassName}
                >
                  {POST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getPostTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
