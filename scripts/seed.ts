/**
 * ONE-TIME demo seed script. NOT imported by the app.
 *
 * Run: npx tsx scripts/seed.ts
 * Teardown: npx tsx scripts/unseed.ts
 */

import { randomBytes } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { loadEnvLocal } from "./load-env-local";
import {
  ensureSeedAvatarsBucket,
  SEED_AVATARS_BUCKET,
  uploadSeedAvatars,
} from "./seed-avatars";
import {
  MY_PROJECTS,
  SEED_BUILDERS,
  type CommentSpec,
  type CreatedBuilder,
  type CreatedPost,
  type SeedBuilder,
} from "./seed-data";

// Fill in your account email before running. Your avatar stays as-is.
const MY_EMAIL = "ryt2amkhan@gmail.com";

const SEED_EMAIL_DOMAIN = "demo.kindling.local";

function seedEmail(localPart: string) {
  return `${localPart}@${SEED_EMAIL_DOMAIN}`;
}

function randomPassword() {
  return randomBytes(18).toString("base64url");
}

type TagMap = Map<string, string>;

async function loadTags(supabase: SupabaseClient): Promise<TagMap> {
  const { data, error } = await supabase.from("tags").select("id, label");
  if (error || !data) throw new Error(`Failed to load tags: ${error?.message}`);
  return new Map(data.map((tag) => [tag.label, tag.id]));
}

function tagId(tags: TagMap, label: string) {
  const id = tags.get(label);
  if (!id) throw new Error(`Tag not found: ${label}`);
  return id;
}

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

async function assertNoSeedUsers(supabase: SupabaseClient) {
  const seedUsers = (await listAllUsers(supabase)).filter((u) => u.user_metadata?.seed === true);
  if (seedUsers.length > 0) {
    throw new Error(`Found ${seedUsers.length} seed user(s). Run "npx tsx scripts/unseed.ts" first.`);
  }
}

async function findUserIdByEmail(supabase: SupabaseClient, email: string) {
  const match = (await listAllUsers(supabase)).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  return match?.id ?? null;
}

async function insertProjectTags(
  supabase: SupabaseClient,
  projectId: string,
  labels: string[],
  tags: TagMap
) {
  if (!labels.length) return;
  const { error } = await supabase.from("project_tags").insert(
    labels.map((label) => ({ project_id: projectId, tag_id: tagId(tags, label) }))
  );
  if (error) throw new Error(`project_tags: ${error.message}`);
}

async function insertProfileTags(
  supabase: SupabaseClient,
  profileId: string,
  labels: string[],
  kind: "brings" | "open_to",
  tags: TagMap
) {
  if (!labels.length) return;
  const { error } = await supabase.from("profile_tags").insert(
    labels.map((label) => ({ profile_id: profileId, tag_id: tagId(tags, label), kind }))
  );
  if (error) throw new Error(`profile_tags: ${error.message}`);
}

async function insertPosts(
  supabase: SupabaseClient,
  projectId: string,
  authorId: string,
  builder: SeedBuilder
): Promise<CreatedPost[]> {
  const created: CreatedPost[] = [];

  for (const post of builder.posts) {
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        project_id: projectId,
        author_id: authorId,
        type: post.type,
        body: post.body,
        structured_fields: null,
      })
      .select("id")
      .single();

    if (error || !inserted) throw new Error(`post: ${error?.message}`);
    created.push({ id: inserted.id, authorId, type: post.type });
  }

  return created;
}

async function seedBuilder(
  supabase: SupabaseClient,
  builder: SeedBuilder,
  tags: TagMap,
  avatarUrl: string | null
): Promise<{ builder: CreatedBuilder; posts: CreatedPost[] }> {
  const email = seedEmail(builder.emailLocal);
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: { seed: true, full_name: builder.fullName },
  });
  if (authError || !authData.user) {
    throw new Error(`createUser ${builder.fullName}: ${authError?.message}`);
  }

  const userId = authData.user.id;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: builder.displayName,
      bio: builder.bio,
      avatar_url: avatarUrl,
    })
    .eq("id", userId);
  if (profileError) throw new Error(`profile ${builder.fullName}: ${profileError.message}`);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: userId,
      name: builder.project.name,
      one_liner: builder.project.oneLiner,
      abstract_description: builder.project.abstractDescription,
      stage: builder.project.stage,
    })
    .select("id")
    .single();
  if (projectError || !project) throw new Error(`project ${builder.fullName}: ${projectError?.message}`);

  await insertProjectTags(supabase, project.id, builder.projectTags, tags);
  await insertProfileTags(supabase, userId, builder.brings, "brings", tags);
  await insertProfileTags(supabase, userId, builder.openTo, "open_to", tags);

  const posts = await insertPosts(supabase, project.id, userId, builder);

  console.log(`  ${builder.displayName} (${email})`);
  return {
    builder: {
      id: userId,
      displayName: builder.displayName,
      projectId: project.id,
      postIds: posts.map((p) => p.id),
    },
    posts,
  };
}

async function seedMyProjects(
  supabase: SupabaseClient,
  myUserId: string,
  tags: TagMap
): Promise<CreatedPost[]> {
  const names = MY_PROJECTS.map((p) => p.name);
  const { data: existing } = await supabase
    .from("projects")
    .select("name")
    .eq("owner_id", myUserId)
    .in("name", names);

  if (existing?.length) {
    console.log(`  Skipping your projects (${existing.map((p) => p.name).join(", ")} exist).`);
    return [];
  }

  const created: CreatedPost[] = [];

  for (const spec of MY_PROJECTS) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        owner_id: myUserId,
        name: spec.name,
        one_liner: spec.oneLiner,
        abstract_description: spec.abstractDescription,
        stage: spec.stage,
      })
      .select("id")
      .single();
    if (projectError || !project) throw new Error(`my project ${spec.name}: ${projectError?.message}`);

    await insertProjectTags(supabase, project.id, spec.projectTags, tags);

    for (const post of spec.posts) {
      const { data: inserted, error: postError } = await supabase
        .from("posts")
        .insert({
          project_id: project.id,
          author_id: myUserId,
          type: post.type,
          body: post.body,
          structured_fields: null,
        })
        .select("id")
        .single();
      if (postError || !inserted) throw new Error(`my post ${spec.name}: ${postError?.message}`);
      created.push({ id: inserted.id, authorId: myUserId, type: post.type });
    }

    console.log(`  Your project: ${spec.name}`);
  }

  return created;
}

async function seedComments(supabase: SupabaseClient, specs: CommentSpec[]) {
  const created: { id: string; authorId: string }[] = [];
  for (const spec of specs) {
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: spec.postId, author_id: spec.authorId, body: spec.body })
      .select("id, author_id")
      .single();
    if (error || !data) throw new Error(`comment: ${error?.message}`);
    created.push({ id: data.id, authorId: data.author_id });
  }
  return created;
}

async function seedFollows(supabase: SupabaseClient, followerId: string, followingId: string) {
  const { error } = await supabase.from("follows").insert({
    follower_id: followerId,
    following_id: followingId,
  });
  if (error && error.code !== "23505") throw new Error(`follow: ${error.message}`);
}

async function seedHelpfulMark(supabase: SupabaseClient, commentId: string, markerId: string) {
  const { error } = await supabase.from("helpful_marks").insert({
    target_type: "comment",
    target_id: commentId,
    marker_id: markerId,
  });
  if (error && error.code !== "23505") throw new Error(`helpful_mark: ${error.message}`);
}

function pickReplier(builders: CreatedBuilder[], postAuthorId: string, index: number) {
  const candidates = builders.filter((b) => b.id !== postAuthorId);
  return candidates[index % candidates.length];
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

  await assertNoSeedUsers(supabase);
  const tags = await loadTags(supabase);

  console.log("Fetching synthetic avatars (thispersondoesnotexist.com)...\n");
  await ensureSeedAvatarsBucket(supabase);
  const {
    urlsBySlug: avatarUrls,
    uploadedCount: avatarsUploaded,
    fallbackNames: avatarFallbacks,
  } = await uploadSeedAvatars(supabase, SEED_BUILDERS);

  console.log("\nCreating seed builders...\n");

  const builders: CreatedBuilder[] = [];
  const allPosts: CreatedPost[] = [];

  for (const builder of SEED_BUILDERS) {
    const result = await seedBuilder(
      supabase,
      builder,
      tags,
      avatarUrls.get(builder.emailLocal) ?? null
    );
    builders.push(result.builder);
    allPosts.push(...result.posts);
  }

  let myUserId: string | null = null;
  let myPosts: CreatedPost[] = [];
  let myProjectsCreated = 0;

  if (!MY_EMAIL.trim()) {
    console.log("\nMY_EMAIL is empty. Skipping your projects and follow graph involving you.");
  } else {
    myUserId = await findUserIdByEmail(supabase, MY_EMAIL.trim());
    if (!myUserId) {
      console.warn(`\nNo auth user for MY_EMAIL (${MY_EMAIL}). Skipping your section.`);
    } else {
      console.log(`\nAdding projects for ${MY_EMAIL} (avatar unchanged)...`);
      myPosts = await seedMyProjects(supabase, myUserId, tags);
      myProjectsCreated = myPosts.length > 0 ? MY_PROJECTS.length : 0;
      allPosts.push(...myPosts);
    }
  }

  console.log("\nCreating follows...");
  let followCount = 0;

  for (let i = 0; i < builders.length; i += 1) {
    await seedFollows(supabase, builders[i].id, builders[(i + 1) % builders.length].id);
    followCount += 1;
  }

  const extraFollows: [number, number][] = [
    [0, 4], [1, 7], [2, 9], [3, 12], [5, 10], [6, 1], [8, 4], [11, 0], [13, 2],
  ];
  for (const [from, to] of extraFollows) {
    await seedFollows(supabase, builders[from].id, builders[to].id);
    followCount += 1;
  }

  if (myUserId) {
    for (const i of [0, 1, 2, 4, 6, 8, 11]) {
      await seedFollows(supabase, builders[i].id, myUserId);
      followCount += 1;
    }
    for (const i of [1, 4, 9, 13]) {
      await seedFollows(supabase, myUserId, builders[i].id);
      followCount += 1;
    }
  }

  console.log(`  ${followCount} follow row(s)`);

  console.log("\nCreating comments...");
  const commentSpecs: CommentSpec[] = [];

  const blockerPosts = allPosts.filter((p) => p.type === "stuck" || p.type === "need_users");
  blockerPosts.slice(0, 10).forEach((post, index) => {
    const replier = pickReplier(builders, post.authorId, index);
    commentSpecs.push({
      postId: post.id,
      authorId: replier.id,
      body: "I ran into something like this. Happy to compare notes if a short call helps.",
    });
  });

  const snovaiNeedUsers = myPosts.find((p) => p.type === "need_users");
  const kindlingStuck = myPosts.find((p) => p.type === "stuck" && p.authorId === myUserId);

  if (snovaiNeedUsers && myUserId) {
    commentSpecs.push({
      postId: snovaiNeedUsers.id,
      authorId: builders[6].id,
      body: "Enterprise buyers usually want the read-only story first. Lead with that in outreach.",
    });
  }

  if (kindlingStuck && myUserId) {
    commentSpecs.push({
      postId: kindlingStuck.id,
      authorId: builders[2].id,
      body: "We used a small global recent list as fallback on a beta community. It kept new users from bouncing.",
    });
  }

  commentSpecs.push(
    {
      postId: builders[0].postIds[1],
      authorId: builders[4].id,
      body: "We documented controls before code on our last healthcare pilot. I can share the template.",
    },
    {
      postId: builders[1].postIds[2],
      authorId: builders[3].id,
      body: "I know two freelancers paid in EUR and USD. Want an intro?",
    },
    {
      postId: builders[3].postIds[1],
      authorId: builders[12].id,
      body: "Regional grocer buyers are slow. Samples plus one follow-up call beat cold email for us.",
    },
    {
      postId: builders[9].postIds[1],
      authorId: builders[5].id,
      body: "I can help wire auth if you want a short pairing session on Supabase RLS.",
    },
    {
      postId: builders[10].postIds[1],
      authorId: builders[7].id,
      body: "UK fintech landing pages often need clearer FCA wording on the waitlist. I can review copy.",
    }
  );

  const comments = await seedComments(supabase, commentSpecs);
  console.log(`  ${comments.length} comment(s)`);

  console.log("\nCreating helpful marks...");
  let markCount = 0;

  const markPlan: { commentIndex: number; markerBuilderIndex: number }[] = [
    { commentIndex: 0, markerBuilderIndex: 1 },
    { commentIndex: 0, markerBuilderIndex: 2 },
    { commentIndex: 1, markerBuilderIndex: 0 },
    { commentIndex: 1, markerBuilderIndex: 3 },
    { commentIndex: 2, markerBuilderIndex: 4 },
    { commentIndex: 2, markerBuilderIndex: 5 },
    { commentIndex: 3, markerBuilderIndex: 6 },
    { commentIndex: 3, markerBuilderIndex: 1 },
    { commentIndex: 3, markerBuilderIndex: 2 },
    { commentIndex: 4, markerBuilderIndex: 8 },
    { commentIndex: 5, markerBuilderIndex: 9 },
    { commentIndex: 6, markerBuilderIndex: 0 },
    { commentIndex: 6, markerBuilderIndex: 3 },
    { commentIndex: 7, markerBuilderIndex: 1 },
    { commentIndex: 8, markerBuilderIndex: 4 },
    { commentIndex: 9, markerBuilderIndex: 6 },
    { commentIndex: 10, markerBuilderIndex: 2 },
    { commentIndex: 11, markerBuilderIndex: 5 },
    { commentIndex: 12, markerBuilderIndex: 7 },
    { commentIndex: 13, markerBuilderIndex: 8 },
  ];

  for (const { commentIndex, markerBuilderIndex } of markPlan) {
    const comment = comments[commentIndex];
    const marker = builders[markerBuilderIndex];
    if (!comment || !marker || comment.authorId === marker.id) continue;
    await seedHelpfulMark(supabase, comment.id, marker.id);
    markCount += 1;
  }

  if (myUserId) {
    for (const commentIndex of [0, 6, 10, 11]) {
      const comment = comments[commentIndex];
      if (comment && comment.authorId !== myUserId) {
        await seedHelpfulMark(supabase, comment.id, myUserId);
        markCount += 1;
      }
    }
  }

  console.log(`  ${markCount} helpful mark(s)`);

  console.log("\n--- Seed summary ---");
  console.log(`Seed builders:      ${builders.length}`);
  console.log(`Your projects:      ${myProjectsCreated}`);
  console.log(`Projects total:     ${builders.length + myProjectsCreated}`);
  console.log(`Posts total:        ${allPosts.length}`);
  console.log(`Comments:           ${comments.length}`);
  console.log(`Helpful marks:      ${markCount}`);
  console.log(`Follows:            ${followCount}`);
  console.log(
    `Avatars:            ${avatarsUploaded} uploaded to Supabase Storage bucket "${SEED_AVATARS_BUCKET}", ${avatarFallbacks.length} initials fallback`
  );
  if (avatarFallbacks.length > 0) {
    console.log(`  Fallback builders: ${avatarFallbacks.join(", ")}`);
  }
  console.log("\nTeardown: npx tsx scripts/unseed.ts");
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/seed.ts");

if (isDirectRun) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
