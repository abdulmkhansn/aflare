import type { SupabaseClient } from "@supabase/supabase-js";

export const POST_IMAGES_BUCKET = "post-images";

export const POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export async function ensurePostImagesBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  if (buckets?.some((bucket) => bucket.name === POST_IMAGES_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(POST_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: POST_IMAGE_MAX_BYTES,
  });

  if (createError) {
    throw new Error(createError.message);
  }
}
