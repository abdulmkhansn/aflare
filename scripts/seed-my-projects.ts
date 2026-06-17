/**
 * One-off: seed ONLY Abdul Khan's four real projects (+ posts).
 * Does not touch seed builders, follows, comments, avatars, or other users.
 *
 * Run: npx tsx scripts/seed-my-projects.ts
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { loadEnvLocal } from "./load-env-local";

const MY_EMAIL = "ryt2amkhan@gmail.com";

type ProjectStage = "idea" | "building" | "shipped" | "parked";
type PostType = "update" | "shipped" | "learning" | "stuck" | "need_users" | "parked";

type ProjectSpec = {
  name: string;
  oneLiner: string;
  abstractDescription: string;
  stage: ProjectStage;
  projectTags: string[];
  createdDaysAgo: number;
  posts: { type: PostType; body: string; createdDaysAgo: number }[];
};

const MY_PROJECT_SPECS: ProjectSpec[] = [
  {
    name: "SnovAI",
    oneLiner: "A ServiceNow intelligence platform that lives as a Chrome sidebar.",
    abstractDescription:
      "Connects to your ServiceNow instance as a read-only account and gives intelligence on top of it.",
    stage: "shipped",
    projectTags: ["backend", "fintech"],
    createdDaysAgo: 48,
    posts: [
      {
        type: "shipped",
        createdDaysAgo: 34,
        body: "Launched about a month ago. Live at snovai.io. A Chrome extension that lives as a sidebar and connects read-only to your ServiceNow instance.",
      },
      {
        type: "update",
        createdDaysAgo: 12,
        body: "In distribution now. Reaching out directly to my 1,000+ LinkedIn connections. Early traction: 25+ trial users and 7 paid conversions at $149 a month.",
      },
      {
        type: "need_users",
        createdDaysAgo: 4,
        body: "Looking for a partner or investor to help with resourcing and getting this in front of more ServiceNow teams. If that is you or you know someone, say hello.",
      },
    ],
  },
  {
    name: "Kindling",
    oneLiner: "A place for people building in the open to keep a public build log and find help.",
    abstractDescription:
      "A social graph and feed app on Next.js and Supabase, with verification that proves you build without exposing your code.",
    stage: "building",
    projectTags: ["frontend", "backend"],
    createdDaysAgo: 22,
    posts: [
      {
        type: "shipped",
        createdDaysAgo: 15,
        body: "Auth is done. Three login providers, and login is kept separate from verification on purpose.",
      },
      {
        type: "stuck",
        createdDaysAgo: 6,
        body: "Working through the feed so it is never empty for a brand new user. Balancing tag matches, who you follow, and a sensible fallback.",
      },
      {
        type: "learning",
        createdDaysAgo: 2,
        body: "TIL reputation is driven by database triggers, not app code. The app only inserts a helpful mark and the trigger does the rest.",
      },
    ],
  },
  {
    name: "AI Tool Navigator",
    oneLiner:
      "A browser sidebar that started as quick switching between ChatGPT, Claude, and Copilot and grew toward a per-task AI routing hub.",
    abstractDescription:
      "Routes you to the right AI tool for a task, with token estimation. Explored capturing context across tools.",
    stage: "parked",
    projectTags: ["frontend"],
    createdDaysAgo: 62,
    posts: [
      {
        type: "update",
        createdDaysAgo: 54,
        body: "Early version. Quick switching between AI tools from a sidebar.",
      },
      {
        type: "stuck",
        createdDaysAgo: 38,
        body: "The wall was reading browser-level data from Claude and ChatGPT inside an extension.",
      },
      {
        type: "parked",
        createdDaysAgo: 24,
        body: "Considered a bring-your-own-API-key approach to capture context from git commits and planning tools, but it sat outside my depth, so I am parking it. The piece worth keeping is the tab-switcher context memory, which could apply to any domain.",
      },
    ],
  },
  {
    name: "Influencer-brand collab platform",
    oneLiner: "Connecting brands that need influencers with influencers.",
    abstractDescription: "A two-sided marketplace idea.",
    stage: "parked",
    projectTags: ["distribution"],
    createdDaysAgo: 56,
    posts: [
      {
        type: "parked",
        createdDaysAgo: 41,
        body: "The market is crowded. I found existing platforms doing nearly the same thing. Parking it until I find a real niche worth going after.",
      },
    ],
  },
];

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9 + (days % 6), (days * 11) % 60, 0, 0);
  return date.toISOString();
}

type TagMap = Map<string, string>;

async function listAllUsers(supabase: SupabaseClient) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < 200) break;
    page += 1;
  }

  return users;
}

async function findUserIdByEmail(supabase: SupabaseClient, email: string) {
  const match = (await listAllUsers(supabase)).find(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  );
  return match?.id ?? null;
}

async function loadTags(supabase: SupabaseClient): Promise<TagMap> {
  const { data, error } = await supabase.from("tags").select("id, label");
  if (error || !data) throw new Error(`Failed to load tags: ${error?.message}`);
  return new Map(data.map((tag) => [tag.label, tag.id]));
}

function resolveTagId(tags: TagMap, label: string) {
  const id = tags.get(label);
  if (!id) throw new Error(`Tag not found in database: ${label}`);
  return id;
}

async function deleteMyProjects(supabase: SupabaseClient, ownerId: string) {
  const { data: existing, error: listError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", ownerId);

  if (listError) throw new Error(`list projects: ${listError.message}`);

  const projects = existing ?? [];
  if (projects.length === 0) {
    return { deleted: 0, names: [] as string[] };
  }

  const { error: deleteError } = await supabase.from("projects").delete().eq("owner_id", ownerId);

  if (deleteError) throw new Error(`delete projects: ${deleteError.message}`);

  return {
    deleted: projects.length,
    names: projects.map((project) => project.name),
  };
}

async function insertProjectWithPosts(
  supabase: SupabaseClient,
  ownerId: string,
  spec: ProjectSpec,
  tags: TagMap
) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: ownerId,
      name: spec.name,
      one_liner: spec.oneLiner,
      abstract_description: spec.abstractDescription,
      stage: spec.stage,
      created_at: daysAgoIso(spec.createdDaysAgo),
      updated_at: daysAgoIso(spec.createdDaysAgo),
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(`insert project ${spec.name}: ${projectError?.message}`);
  }

  if (spec.projectTags.length > 0) {
    const { error: tagError } = await supabase.from("project_tags").insert(
      spec.projectTags.map((label) => ({
        project_id: project.id,
        tag_id: resolveTagId(tags, label),
      }))
    );
    if (tagError) throw new Error(`project_tags ${spec.name}: ${tagError.message}`);
  }

  for (const post of spec.posts) {
    const { error: postError } = await supabase.from("posts").insert({
      project_id: project.id,
      author_id: ownerId,
      type: post.type,
      body: post.body,
      structured_fields: null,
      created_at: daysAgoIso(post.createdDaysAgo),
    });
    if (postError) throw new Error(`insert post on ${spec.name}: ${postError.message}`);
  }

  return { projectId: project.id, postCount: spec.posts.length };
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

  console.log(`Looking up ${MY_EMAIL}...\n`);

  const profileId = await findUserIdByEmail(supabase, MY_EMAIL);

  if (!profileId) {
    console.error(`No auth user found for ${MY_EMAIL}. Sign in once, then run this again.`);
    process.exit(1);
  }

  console.log(`Profile id: ${profileId}\n`);

  console.log("Deleting your existing projects (cascade removes their posts and comments)...");
  const { deleted, names } = await deleteMyProjects(supabase, profileId);
  console.log(`  Deleted ${deleted} project(s)${names.length ? `: ${names.join(", ")}` : ""}.\n`);

  const tags = await loadTags(supabase);

  console.log("Creating four projects...\n");

  const created: { name: string; postCount: number }[] = [];

  for (const spec of MY_PROJECT_SPECS) {
    const result = await insertProjectWithPosts(supabase, profileId, spec, tags);
    created.push({ name: spec.name, postCount: result.postCount });
    console.log(`  ${spec.name} (${result.postCount} posts)`);
  }

  const totalPosts = created.reduce((sum, row) => sum + row.postCount, 0);

  console.log("\n--- Summary ---");
  console.log(`Profile id:         ${profileId}`);
  console.log(`Old projects deleted: ${deleted}`);
  console.log(`Projects created:   ${created.length}`);
  console.log(`Posts created:      ${totalPosts}`);
  console.log("Breakdown:");
  for (const row of created) {
    console.log(`  ${row.name}: ${row.postCount} post(s)`);
  }
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/seed-my-projects.ts");

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
