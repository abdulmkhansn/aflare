import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { loadEnvLocal } from "./load-env-local";

async function backfillFlareHelpers(supabase: SupabaseClient) {
  const { data: flares, error: flaresError } = await supabase
    .from("flares")
    .select("id, author_id, status");

  if (flaresError) {
    throw new Error(flaresError.message);
  }

  const flareAuthorById = new Map((flares ?? []).map((flare) => [flare.id, flare.author_id]));

  const { data: comments, error: commentsError } = await supabase
    .from("flare_comments")
    .select("flare_id, author_id, created_at");

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  const helperRows = new Map<string, { flare_id: string; user_id: string; joined_at: string }>();

  for (const comment of comments ?? []) {
    const flareAuthorId = flareAuthorById.get(comment.flare_id);
    if (!flareAuthorId || comment.author_id === flareAuthorId) {
      continue;
    }

    const key = `${comment.flare_id}:${comment.author_id}`;
    const existing = helperRows.get(key);
    const joinedAt = comment.created_at;

    if (!existing || joinedAt < existing.joined_at) {
      helperRows.set(key, {
        flare_id: comment.flare_id,
        user_id: comment.author_id,
        joined_at: joinedAt,
      });
    }
  }

  for (const flare of flares ?? []) {
    const { error } = await supabase
      .from("flare_helpers")
      .delete()
      .eq("flare_id", flare.id)
      .eq("user_id", flare.author_id);

    if (error) {
      throw new Error(error.message);
    }
  }

  let inserted = 0;

  for (const row of helperRows.values()) {
    const { error } = await supabase.from("flare_helpers").upsert(
      { flare_id: row.flare_id, user_id: row.user_id, joined_at: row.joined_at },
      { onConflict: "flare_id,user_id", ignoreDuplicates: true }
    );

    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }

    inserted += 1;
  }

  let statusUpdates = 0;

  for (const flare of flares ?? []) {
    if (flare.status !== "open") {
      continue;
    }

    const { count, error: countError } = await supabase
      .from("flare_helpers")
      .select("user_id", { count: "exact", head: true })
      .eq("flare_id", flare.id);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((count ?? 0) === 0) {
      continue;
    }

    const { error: updateError } = await supabase
      .from("flares")
      .update({ status: "being_helped" })
      .eq("id", flare.id)
      .eq("status", "open");

    if (updateError) {
      throw new Error(updateError.message);
    }

    statusUpdates += 1;
  }

  return { helperCandidates: helperRows.size, inserted, statusUpdates };
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const result = await backfillFlareHelpers(supabase);

  console.log(
    `Backfill complete: ${result.helperCandidates} helper rows synced, ${result.statusUpdates} flares moved open → being_helped.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
