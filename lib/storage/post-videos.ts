import type { SupabaseClient } from "@supabase/supabase-js";

export const POST_VIDEOS_BUCKET = "post-videos";

export const POST_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export const POST_VIDEO_MAX_SECONDS = 60;

export async function ensurePostVideosBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  if (buckets?.some((bucket) => bucket.name === POST_VIDEOS_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(POST_VIDEOS_BUCKET, {
    public: true,
    fileSizeLimit: POST_VIDEO_MAX_BYTES,
  });

  if (createError) {
    throw new Error(createError.message);
  }
}
