/**
 * Teardown for demo seed data.
 * Deletes every auth user where user_metadata.seed === true.
 * CASCADE removes their profiles, projects, posts, comments, flares, etc.
 *
 * Run: npx tsx scripts/unseed.ts
 *
 * Does NOT touch accounts without seed: true (including your real account).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { loadEnvLocal } from "./load-env-local";

async function listAllUsers(supabase: SupabaseClient) {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    users.push(...data.users);

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
        "Add it from Supabase Dashboard → Project Settings → API → service_role (secret)."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const allUsers = await listAllUsers(supabase);
  const seedUsers = allUsers.filter((user) => user.user_metadata?.seed === true);

  if (seedUsers.length === 0) {
    console.log("No seed users found (user_metadata.seed === true).");
    return;
  }

  console.log(`Deleting ${seedUsers.length} seed user(s)...`);

  let deleted = 0;

  for (const user of seedUsers) {
    const name = user.user_metadata?.full_name ?? user.email ?? user.id;
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error(`  Failed to delete ${name}: ${error.message}`);
      continue;
    }

    console.log(`  Deleted ${name}`);
    deleted += 1;
  }

  console.log(`\nRemoved ${deleted} seed user(s). Real accounts were not touched.`);
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/unseed.ts");

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
