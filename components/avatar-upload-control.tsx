"use client";

import { useRef, useState } from "react";

import { saveAvatarUrl } from "@/app/(app)/actions/profile";
import { Avatar } from "@/components/avatar";
import { uploadAvatarWithProgress } from "@/lib/upload/upload-avatar";
import { focusRingClassName, secondaryButtonClassName } from "@/lib/ui/classes";

type AvatarUploadControlProps = {
  displayName: string | null;
  avatarUrl: string | null;
  redirectTo: string;
};

export function AvatarUploadControl({
  displayName,
  avatarUrl,
  redirectTo,
}: AvatarUploadControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const result = await uploadAvatarWithProgress(file);

    setUploading(false);

    if (result.error || !result.url) {
      setError(result.error ?? "Upload failed.");
      event.target.value = "";
      return;
    }

    const preview = `${result.url}?v=${Date.now()}`;
    setPreviewUrl(preview);

    if (urlInputRef.current) {
      urlInputRef.current.value = result.url;
    }

    formRef.current?.requestSubmit();
    event.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar
        displayName={displayName}
        avatarUrl={previewUrl ?? avatarUrl}
        size="md"
      />

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`${secondaryButtonClassName} !py-1.5 text-xs ${focusRingClassName}`}
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        <p className="mt-1 text-xs text-fg-muted">JPG, PNG, WebP, or GIF. Max 2MB.</p>
        {error ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <form ref={formRef} action={saveAvatarUrl} className="hidden">
        <input ref={urlInputRef} type="hidden" name="avatar_url" defaultValue="" />
        <input type="hidden" name="redirect_to" value={redirectTo} />
      </form>
    </div>
  );
}
