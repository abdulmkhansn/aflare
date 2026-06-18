import { AVATAR_IMAGE_TYPES, AVATAR_MAX_BYTES, AVATARS_BUCKET } from "@/lib/storage/avatars";
import { createClient } from "@/utils/supabase/client";

type UploadAvatarResult = {
  url?: string;
  error?: string;
};

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

/** Stable object path inside the `avatars` bucket — re-uploads replace the same key. */
function avatarObjectPath(userId: string, contentType: string) {
  return `${userId}/avatar.${extensionForType(contentType)}`;
}

export async function uploadAvatarWithProgress(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadAvatarResult> {
  if (!AVATAR_IMAGE_TYPES.has(file.type)) {
    return { error: "Use a JPG, PNG, WebP, or GIF image." };
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "Profile photos must be 2MB or smaller." };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You need to be signed in to upload." };
  }

  const objectPath = avatarObjectPath(user.id, file.type);

  onProgress?.(10);

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(objectPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  onProgress?.(100);

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(objectPath);

  return { url: data.publicUrl };
}
