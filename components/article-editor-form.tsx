"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { publishArticle } from "@/app/(app)/actions/articles";
import { ArticleRichTextEditor } from "@/components/article-rich-text-editor";
import { uploadArticleDocWithProgress } from "@/lib/upload/direct-storage-upload";
import { uploadFileWithProgress } from "@/lib/upload/with-progress";
import {
  errorTextClassName,
  fieldClassName,
  textareaFieldClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type EditorMode = "write" | "document";

type ArticleEditorFormProps = {
  error?: string;
};

export function ArticleEditorForm({ error }: ArticleEditorFormProps) {
  const [mode, setMode] = useState<EditorMode>("write");
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState<"pdf" | "docx" | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const canPublish =
    title.trim().length > 0 &&
    !uploadingCover &&
    !uploadingDoc &&
    !submitting &&
    (mode === "write"
      ? bodyHtml.trim().length > 0 && bodyHtml !== "<p></p>"
      : Boolean(docUrl && docType));

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingCover(true);

    const result = await uploadFileWithProgress("/api/post-images", file, () => {});

    setUploadingCover(false);

    if (result.error || !result.url) {
      window.alert(result.error ?? "Couldn't upload that image.");
      return;
    }

    setCoverUrl(result.url);
  }

  async function handleDocChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingDoc(true);
    setUploadProgress(0);

    const result = await uploadArticleDocWithProgress(file, setUploadProgress);

    setUploadingDoc(false);
    setUploadProgress(0);

    if (result.error || !result.url || !result.doc_type) {
      window.alert(result.error ?? "Couldn't upload that document.");
      return;
    }

    setDocUrl(result.url);
    setDocType(result.doc_type);
    setDocName(file.name);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canPublish) {
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.set("mode", mode);
    formData.set("title", title.trim());

    if (mode === "write") {
      formData.set("body_html", bodyHtml);

      if (coverUrl) {
        formData.set("cover_image_url", coverUrl);
      }
    } else {
      formData.set("doc_url", docUrl ?? "");
      formData.set("doc_type", docType ?? "");
      formData.set("description", description.trim());
    }

    await publishArticle(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="inline-flex rounded-md border border-border-subtle bg-surface-card p-1">
        <button
          type="button"
          onClick={() => setMode("write")}
          className={[
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "write"
              ? "bg-[var(--hover-subtle)] text-fg"
              : "text-fg-muted hover:text-fg",
          ].join(" ")}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setMode("document")}
          className={[
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "document"
              ? "bg-[var(--hover-subtle)] text-fg"
              : "text-fg-muted hover:text-fg",
          ].join(" ")}
        >
          Attach a document
        </button>
      </div>

      {error ? (
        <p className={errorTextClassName} role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="article-title" className={labelClassName}>
          Title
        </label>
        <input
          id="article-title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What is this article about?"
          className={fieldClassName}
        />
      </div>

      {mode === "write" ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className={labelClassName}>Cover image</span>
              <button
                type="button"
                className={secondaryButtonClassName}
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? "Uploading…" : coverUrl ? "Replace image" : "Add image"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleCoverChange}
              />
            </div>
            {coverUrl ? (
              <div className="relative aspect-[2/1] overflow-hidden rounded-md border border-border-subtle">
                <Image src={coverUrl} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <p className={statusTextClassName}>Optional. Shows on the feed card and reader page.</p>
            )}
          </div>

          <div className="space-y-2">
            <span className={labelClassName}>Body</span>
            <ArticleRichTextEditor onChange={setBodyHtml} />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="article-description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="article-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="A short note about what is in the document."
              className={textareaFieldClassName}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className={labelClassName}>Document</span>
              <button
                type="button"
                className={secondaryButtonClassName}
                onClick={() => docInputRef.current?.click()}
                disabled={uploadingDoc}
              >
                {uploadingDoc ? `Uploading ${uploadProgress}%` : docUrl ? "Replace file" : "Choose file"}
              </button>
              <input
                ref={docInputRef}
                type="file"
                accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={handleDocChange}
              />
            </div>
            {docName ? (
              <p className={statusTextClassName}>
                {docName} ({docType?.toUpperCase()})
              </p>
            ) : (
              <p className={statusTextClassName}>PDF or Word (.docx), up to 25MB.</p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end border-t border-border-subtle pt-4">
        <button type="submit" className={primaryButtonClassName} disabled={!canPublish}>
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </div>
    </form>
  );
}
