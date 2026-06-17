import {
  ARTICLE_DOC_MAX_BYTES,
  ARTICLE_DOCS_BUCKET,
} from "@/lib/storage/article-docs";
import { POST_VIDEOS_BUCKET } from "@/lib/storage/post-videos";
import { createClient } from "@/utils/supabase/client";

type DirectUploadResult = {
  url?: string;
  doc_type?: "pdf" | "docx";
  error?: string;
};

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const ARTICLE_DOC_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function encodeStoragePath(objectPath: string) {
  return objectPath.split("/").map(encodeURIComponent).join("/");
}

function parseUploadError(responseText: string, fallback: string) {
  try {
    const body = JSON.parse(responseText) as { message?: string; error?: string };
    return body.message ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}

async function uploadFileToStorageWithProgress(
  bucket: string,
  objectPath: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<DirectUploadResult> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: "You need to be signed in to upload." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return { error: "Upload is not configured." };
  }

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodeStoragePath(objectPath)}`;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
        resolve({ url: data.publicUrl });
        return;
      }

      resolve({
        error: parseUploadError(xhr.responseText, "Upload failed. Try again."),
      });
    });

    xhr.addEventListener("error", () => {
      resolve({ error: "Upload failed. Check your connection and try again." });
    });

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", publishableKey);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.send(file);
  });
}

function videoExtensionForType(type: string) {
  if (type === "video/webm") {
    return "webm";
  }

  if (type === "video/quicktime") {
    return "mov";
  }

  return "mp4";
}

function docTypeForMime(type: string): "pdf" | "docx" {
  return type === "application/pdf" ? "pdf" : "docx";
}

export async function uploadPostVideoWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<DirectUploadResult> {
  if (!VIDEO_TYPES.has(file.type)) {
    return {
      error: "Use an MP4 or WebM video. Other formats may not play in the browser.",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to upload." };
  }

  const extension = videoExtensionForType(file.type);
  const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  return uploadFileToStorageWithProgress(POST_VIDEOS_BUCKET, objectPath, file, onProgress);
}

export async function uploadArticleDocWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<DirectUploadResult> {
  if (!ARTICLE_DOC_TYPES.has(file.type)) {
    return { error: "Use a PDF or Word (.docx) file." };
  }

  if (file.size > ARTICLE_DOC_MAX_BYTES) {
    return { error: "Documents must be 25MB or smaller." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to upload." };
  }

  const docType = docTypeForMime(file.type);
  const objectPath = `${user.id}/${crypto.randomUUID()}.${docType}`;

  const result = await uploadFileToStorageWithProgress(
    ARTICLE_DOCS_BUCKET,
    objectPath,
    file,
    onProgress
  );

  if (result.error || !result.url) {
    return result;
  }

  return { url: result.url, doc_type: docType };
}
