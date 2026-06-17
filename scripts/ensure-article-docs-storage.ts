import { createClient } from "@supabase/supabase-js";

import {
  ARTICLE_DOCS_BUCKET,
  ensureArticleDocsBucket,
} from "../lib/storage/article-docs";
import { loadEnvLocal } from "./load-env-local";

export const ARTICLE_DOCS_POLICY_SQL = `
create policy "Public read article-docs"
on storage.objects for select
to public
using (bucket_id = '${ARTICLE_DOCS_BUCKET}');

create policy "Authenticated upload article-docs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = '${ARTICLE_DOCS_BUCKET}'
  and auth.uid()::text = (storage.foldername(name))[1]
);
`;

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Ensuring ${ARTICLE_DOCS_BUCKET} bucket…`);
  await ensureArticleDocsBucket(supabase);
  console.log(`Bucket "${ARTICLE_DOCS_BUCKET}" is ready (public read).`);

  console.log(
    "\nApply matching storage policies in Supabase SQL editor (same pattern as post-images):\n"
  );
  console.log(ARTICLE_DOCS_POLICY_SQL.trim());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
