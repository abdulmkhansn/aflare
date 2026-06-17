import type { SupabaseClient } from "@supabase/supabase-js";

export const ARTICLE_DOCS_BUCKET = "article-docs";

export const ARTICLE_DOC_MAX_BYTES = 25 * 1024 * 1024;

export async function ensureArticleDocsBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  if (buckets?.some((bucket) => bucket.name === ARTICLE_DOCS_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(ARTICLE_DOCS_BUCKET, {
    public: true,
    fileSizeLimit: ARTICLE_DOC_MAX_BYTES,
  });

  if (createError) {
    throw new Error(createError.message);
  }
}
