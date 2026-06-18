/**
 * Demo seed — populates every feature with on-brand sample content.
 *
 * Run:   npx tsx scripts/seed.ts
 * Reset: npx tsx scripts/unseed.ts
 */

import { randomBytes } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PostStructuredFields } from "../lib/posts/structured-fields";
import { flareBodyRedundantWithTitle } from "../lib/flares/types";
import { orderedUserPair } from "../lib/messages/types";

import { diceBearAvatarUrl } from "./seed-avatars";
import {
  MY_FOLLOW_SEED_INDICES,
  MY_PROJECTS,
  SEED_ARTICLES,
  SEED_BUILDERS,
  SEED_COMMENT_PLANS,
  SEED_CONVERSATIONS,
  SEED_EMAIL_DOMAIN,
  SEED_EXTRA_FOLLOWS,
  SEED_FLARES,
  SEED_FOLLOW_ME_INDICES,
  SEED_HELPFUL_POST_PLANS,
  SEED_MILESTONES,
  SEED_REACTION_PLANS,
  SEED_TEXTURE_COMMENT_PLANS,
  SEED_TEXTURE_POSTS,
  SEED_TEXTURE_REACTION_PLANS,
  type SeedBuildPost,
  type SeedBuilder,
} from "./seed-data";
import { loadEnvLocal } from "./load-env-local";

const MY_EMAIL = "ryt2amkhan@gmail.com";

type TagMap = Map<string, string>;

type CreatedUser = {
  id: string;
  displayName: string;
};

type PostRecord = {
  id: string;
  authorId: string;
};

type PostLookupKey = `${number | "my"}:${number}:${number}`;

function seedEmail(localPart: string) {
  return `${localPart}@${SEED_EMAIL_DOMAIN}`;
}

function randomPassword() {
  return randomBytes(18).toString("base64url");
}

function normalizeTagLabel(label: string): string {
  return label.trim().toLowerCase().replace(/_/g, " ");
}

async function loadTags(supabase: SupabaseClient): Promise<TagMap> {
  const { data, error } = await supabase.from("tags").select("id, label");
  if (error || !data) throw new Error(`Failed to load tags: ${error?.message}`);
  return new Map(data.map((tag) => [normalizeTagLabel(tag.label), tag.id]));
}

function tagId(tags: TagMap, label: string) {
  const id = tags.get(normalizeTagLabel(label));
  if (!id) throw new Error(`Tag not found: ${label}`);
  return id;
}

function cleanStructured(fields?: PostStructuredFields | null) {
  if (!fields) return null;
  const cleaned = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => Boolean(value))
  ) as PostStructuredFields;
  return Object.keys(cleaned).length > 0 ? cleaned : null;
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

async function insertBuildPost(
  supabase: SupabaseClient,
  projectId: string,
  authorId: string,
  post: SeedBuildPost
): Promise<PostRecord> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      project_id: projectId,
      author_id: authorId,
      kind: "build",
      type: post.type,
      body: post.body,
      structured_fields: cleanStructured(post.structuredFields),
      article_id: null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`build post: ${error?.message}`);
  return { id: data.id, authorId };
}

async function insertSharePost(
  supabase: SupabaseClient,
  authorId: string,
  body: string,
  structuredFields?: PostStructuredFields | null
): Promise<PostRecord> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      project_id: null,
      author_id: authorId,
      kind: "share",
      type: "update",
      body,
      structured_fields: cleanStructured(structuredFields),
      article_id: null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`share post: ${error?.message}`);
  return { id: data.id, authorId };
}

async function insertRepostPost(
  supabase: SupabaseClient,
  authorId: string,
  originalPostId: string,
  quote = ""
): Promise<PostRecord> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      project_id: null,
      author_id: authorId,
      kind: "share",
      type: "update",
      body: quote,
      reposted_post_id: originalPostId,
      structured_fields: { repost: true },
      article_id: null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`repost: ${error?.message}`);
  return { id: data.id, authorId };
}

async function seedReposts(
  supabase: SupabaseClient,
  users: CreatedUser[],
  texturePostLookup: Map<number, PostRecord>
): Promise<number> {
  const originalPlain = texturePostLookup.get(1);
  const originalQuote = texturePostLookup.get(4);
  const originalUnavailable = texturePostLookup.get(30);

  if (!originalPlain || !originalQuote || !users[2] || !users[3] || !users[7]) {
    return 0;
  }

  await insertRepostPost(supabase, users[2].id, originalPlain.id);
  await insertRepostPost(
    supabase,
    users[3].id,
    originalQuote.id,
    "This is the whole stack in one thread — worth keeping in view."
  );

  if (originalUnavailable) {
    await insertRepostPost(supabase, users[7].id, originalUnavailable.id);
    await supabase.from("posts").delete().eq("id", originalUnavailable.id);
  }

  return originalUnavailable ? 3 : 2;
}

async function createSeedUser(
  supabase: SupabaseClient,
  builder: SeedBuilder,
  tags: TagMap
): Promise<CreatedUser> {
  const email = seedEmail(builder.emailLocal);
  const avatarUrl = diceBearAvatarUrl(builder.fullName);

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

  await insertProfileTags(supabase, userId, builder.brings, "brings", tags);
  await insertProfileTags(supabase, userId, builder.openTo, "open_to", tags);

  return { id: userId, displayName: builder.displayName };
}

async function seedBuilderContent(
  supabase: SupabaseClient,
  builderIndex: number,
  builder: SeedBuilder,
  userId: string,
  tags: TagMap,
  postLookup: Map<PostLookupKey, PostRecord>
) {
  for (let projectIndex = 0; projectIndex < builder.projects.length; projectIndex += 1) {
    const projectSpec = builder.projects[projectIndex];

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        owner_id: userId,
        name: projectSpec.name,
        one_liner: projectSpec.oneLiner,
        abstract_description: projectSpec.abstractDescription,
        stage: projectSpec.stage,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      throw new Error(`project ${projectSpec.name}: ${projectError?.message}`);
    }

    await insertProjectTags(supabase, project.id, projectSpec.projectTags, tags);

    for (let postIndex = 0; postIndex < projectSpec.posts.length; postIndex += 1) {
      const post = await insertBuildPost(
        supabase,
        project.id,
        userId,
        projectSpec.posts[postIndex]
      );
      postLookup.set(`${builderIndex}:${projectIndex}:${postIndex}`, post);
    }
  }

  for (const share of builder.sharePosts) {
    await insertSharePost(supabase, userId, share.body, share.structuredFields);
  }
}

async function seedTexturePosts(
  supabase: SupabaseClient,
  users: CreatedUser[],
  texturePostLookup: Map<number, PostRecord>
) {
  for (let textureIndex = 0; textureIndex < SEED_TEXTURE_POSTS.length; textureIndex += 1) {
    const spec = SEED_TEXTURE_POSTS[textureIndex];
    const author = users[spec.authorIndex];

    if (!author) {
      continue;
    }

    const post = await insertSharePost(
      supabase,
      author.id,
      spec.body,
      spec.structuredFields
    );
    texturePostLookup.set(textureIndex, post);
  }
}

async function seedMyProjects(
  supabase: SupabaseClient,
  myUserId: string,
  tags: TagMap,
  postLookup: Map<PostLookupKey, PostRecord>
) {
  const names = MY_PROJECTS.map((p) => p.name);
  const { data: existing } = await supabase
    .from("projects")
    .select("name")
    .eq("owner_id", myUserId)
    .in("name", names);

  if (existing?.length) {
    console.log(`  Skipping your projects (${existing.map((p) => p.name).join(", ")} exist).`);
    return 0;
  }

  for (let projectIndex = 0; projectIndex < MY_PROJECTS.length; projectIndex += 1) {
    const spec = MY_PROJECTS[projectIndex];

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

    if (projectError || !project) {
      throw new Error(`my project ${spec.name}: ${projectError?.message}`);
    }

    await insertProjectTags(supabase, project.id, spec.projectTags, tags);

    for (let postIndex = 0; postIndex < spec.posts.length; postIndex += 1) {
      const post = await insertBuildPost(supabase, project.id, myUserId, spec.posts[postIndex]);
      postLookup.set(`my:${projectIndex}:${postIndex}`, post);
    }

    console.log(`  Your project: ${spec.name}`);
  }

  return MY_PROJECTS.length;
}

async function seedArticles(
  supabase: SupabaseClient,
  users: CreatedUser[]
): Promise<number> {
  let count = 0;

  for (const article of SEED_ARTICLES) {
    const author = users[article.authorIndex];
    if (!author) continue;

    const { data: row, error: articleError } = await supabase
      .from("articles")
      .insert({
        author_id: author.id,
        title: article.title,
        body: article.body,
        excerpt: article.excerpt,
        cover_image_url: article.coverImageUrl ?? null,
        category: null,
      })
      .select("id")
      .single();

    if (articleError || !row) throw new Error(`article: ${articleError?.message}`);

    const { error: postError } = await supabase.from("posts").insert({
      author_id: author.id,
      kind: "article",
      type: "update",
      body: article.excerpt || article.title,
      project_id: null,
      article_id: row.id,
      structured_fields: null,
    });

    if (postError) throw new Error(`article post: ${postError.message}`);
    count += 1;
  }

  return count;
}

function validateSeedFlares() {
  for (const flare of SEED_FLARES) {
    const title = flare.title?.trim() ?? "";
    const body = flare.body?.trim() ?? "";

    if (!body) {
      throw new Error(`Seed flare "${title || "(untitled)"}" is missing a body description.`);
    }

    if (title && flareBodyRedundantWithTitle(title, body)) {
      throw new Error(
        `Seed flare "${title}" repeats the title in the body — body should be the longer description.`
      );
    }
  }
}

async function seedFlares(
  supabase: SupabaseClient,
  users: CreatedUser[],
  tags: TagMap
) {
  let flareCount = 0;
  let commentCount = 0;
  let helpfulCount = 0;
  let helperCount = 0;

  for (const flare of SEED_FLARES) {
    const author = users[flare.authorIndex];
    if (!author) continue;

    const resolvedAt =
      flare.status === "resolved" ? new Date(Date.now() - 86400000 * 3).toISOString() : null;

    const { data: row, error: flareError } = await supabase
      .from("flares")
      .insert({
        author_id: author.id,
        title: flare.title ?? null,
        body: flare.body,
        status: flare.status,
        tried: flare.tried ?? null,
        ruled_out: flare.ruledOut ?? null,
        current_status: flare.currentStatus ?? null,
        resolution_note: flare.resolutionNote ?? null,
        structured_fields: cleanStructured(flare.structuredFields),
        resolved_at: resolvedAt,
      })
      .select("id")
      .single();

    if (flareError || !row) throw new Error(`flare: ${flareError?.message}`);

    if (flare.tags.length > 0) {
      const { error: tagError } = await supabase.from("flare_tags").insert(
        flare.tags.map((label) => ({
          flare_id: row.id,
          tag_id: tagId(tags, label),
        }))
      );
      if (tagError) throw new Error(`flare_tags: ${tagError.message}`);
    }

    for (const helperIndex of flare.helperIndices ?? []) {
      const helper = users[helperIndex];
      if (!helper) continue;
      const { error } = await supabase.from("flare_helpers").upsert(
        { flare_id: row.id, user_id: helper.id },
        { onConflict: "flare_id,user_id", ignoreDuplicates: true }
      );
      if (error && error.code !== "23505") throw new Error(`flare_helpers: ${error.message}`);
      helperCount += 1;
    }

    const createdComments: { id: string; authorId: string }[] = [];

    for (const comment of flare.comments ?? []) {
      const commentAuthor = users[comment.authorIndex];
      if (!commentAuthor) continue;

      const { data: commentRow, error: commentError } = await supabase
        .from("flare_comments")
        .insert({
          flare_id: row.id,
          author_id: commentAuthor.id,
          body: comment.body,
        })
        .select("id, author_id")
        .single();

      if (commentError || !commentRow) {
        throw new Error(`flare_comment: ${commentError?.message}`);
      }

      createdComments.push({ id: commentRow.id, authorId: commentRow.author_id });
      commentCount += 1;

      if (commentAuthor.id !== author.id) {
        const { error: replyHelperError } = await supabase.from("flare_helpers").upsert(
          { flare_id: row.id, user_id: commentAuthor.id },
          { onConflict: "flare_id,user_id", ignoreDuplicates: true }
        );
        if (replyHelperError && replyHelperError.code !== "23505") {
          throw new Error(`flare_helpers from reply: ${replyHelperError.message}`);
        }
        helperCount += 1;
      }

      if (comment.markHelpfulByAuthor && commentAuthor.id !== author.id) {
        const { error: markError } = await supabase.from("helpful_marks").insert({
          target_type: "flare_comment",
          target_id: commentRow.id,
          marker_id: author.id,
        });
        if (markError) {
          if (
            markError.message.includes("flare_comment") ||
            markError.message.includes("helpful_target")
          ) {
            console.warn(
              "  Skipping flare_comment helpful mark — run scripts/sql/extend-helpful-trigger-for-flare-comments.sql in Supabase."
            );
          } else if (markError.code !== "23505") {
            throw new Error(`flare helpful mark: ${markError.message}`);
          }
        } else {
          helpfulCount += 1;
        }
      }
    }

    if (flare.status === "open") {
      const { count, error: helperCountError } = await supabase
        .from("flare_helpers")
        .select("user_id", { count: "exact", head: true })
        .eq("flare_id", row.id);

      if (helperCountError) {
        throw new Error(`flare_helpers count: ${helperCountError.message}`);
      }

      if ((count ?? 0) > 0) {
        const { error: statusError } = await supabase
          .from("flares")
          .update({ status: "being_helped" })
          .eq("id", row.id)
          .eq("status", "open");

        if (statusError) {
          throw new Error(`flare status: ${statusError.message}`);
        }
      }
    }

    flareCount += 1;
  }

  return { flareCount, commentCount, helpfulCount, helperCount };
}

async function seedFollows(
  supabase: SupabaseClient,
  users: CreatedUser[],
  myUserId: string | null
) {
  let count = 0;

  for (let i = 0; i < users.length; i += 1) {
    const follower = users[i];
    const following = users[(i + 1) % users.length];
    const { error } = await supabase.from("follows").insert({
      follower_id: follower.id,
      following_id: following.id,
    });
    if (error && error.code !== "23505") throw new Error(`follow: ${error.message}`);
    count += 1;
  }

  for (const [from, to] of SEED_EXTRA_FOLLOWS) {
    const follower = users[from];
    const following = users[to];
    if (!follower || !following) continue;
    const { error } = await supabase.from("follows").insert({
      follower_id: follower.id,
      following_id: following.id,
    });
    if (error && error.code !== "23505") throw new Error(`follow: ${error.message}`);
    count += 1;
  }

  if (myUserId) {
    for (const index of SEED_FOLLOW_ME_INDICES) {
      const follower = users[index];
      if (!follower) continue;
      const { error } = await supabase.from("follows").insert({
        follower_id: follower.id,
        following_id: myUserId,
      });
      if (error && error.code !== "23505") throw new Error(`follow me: ${error.message}`);
      count += 1;
    }

    for (const index of MY_FOLLOW_SEED_INDICES) {
      const following = users[index];
      if (!following) continue;
      const { error } = await supabase.from("follows").insert({
        follower_id: myUserId,
        following_id: following.id,
      });
      if (error && error.code !== "23505") throw new Error(`my follow: ${error.message}`);
      count += 1;
    }
  }

  return count;
}

function resolvePost(
  postLookup: Map<PostLookupKey, PostRecord>,
  owner: number | "my",
  projectIndex: number,
  postIndex: number
) {
  return postLookup.get(`${owner}:${projectIndex}:${postIndex}`);
}

async function seedCommentsAndHelpful(
  supabase: SupabaseClient,
  users: CreatedUser[],
  myUserId: string | null,
  postLookup: Map<PostLookupKey, PostRecord>,
  texturePostLookup: Map<number, PostRecord>
) {
  let commentCount = 0;
  let helpfulCount = 0;

  for (const plan of SEED_COMMENT_PLANS) {
    const post = resolvePost(postLookup, plan.owner, plan.projectIndex, plan.postIndex);
    if (!post) continue;

    const authorId =
      plan.authorIndex === "my"
        ? myUserId
        : users[plan.authorIndex]?.id;

    if (!authorId || authorId === post.authorId) continue;

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, author_id: authorId, body: plan.body })
      .select("id")
      .single();

    if (error || !comment) throw new Error(`comment: ${error?.message}`);
    commentCount += 1;

    if (plan.markHelpfulByPostAuthor) {
      const { error: markError } = await supabase.from("helpful_marks").insert({
        target_type: "comment",
        target_id: comment.id,
        marker_id: post.authorId,
      });
      if (markError && markError.code !== "23505") {
        throw new Error(`comment helpful: ${markError.message}`);
      }
      helpfulCount += 1;
    }
  }

  for (const plan of SEED_HELPFUL_POST_PLANS) {
    const post = resolvePost(postLookup, plan.owner, plan.projectIndex, plan.postIndex);
    if (!post) continue;

    const markerId =
      plan.markerIndex === "my" ? myUserId : users[plan.markerIndex]?.id;

    if (!markerId || markerId === post.authorId) continue;

    const { error } = await supabase.from("helpful_marks").insert({
      target_type: "post",
      target_id: post.id,
      marker_id: markerId,
    });
    if (error && error.code !== "23505") throw new Error(`post helpful: ${error.message}`);
    helpfulCount += 1;
  }

  for (const plan of SEED_TEXTURE_COMMENT_PLANS) {
    const post = texturePostLookup.get(plan.textureIndex);
    if (!post) continue;

    const authorId = users[plan.authorIndex]?.id;
    if (!authorId || authorId === post.authorId) continue;

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, author_id: authorId, body: plan.body })
      .select("id")
      .single();

    if (error || !comment) throw new Error(`texture comment: ${error?.message}`);
    commentCount += 1;

    if (plan.markHelpfulByPostAuthor) {
      const { error: markError } = await supabase.from("helpful_marks").insert({
        target_type: "comment",
        target_id: comment.id,
        marker_id: post.authorId,
      });
      if (markError && markError.code !== "23505") {
        throw new Error(`texture comment helpful: ${markError.message}`);
      }
      helpfulCount += 1;
    }
  }

  return { commentCount, helpfulCount };
}

async function seedReactions(
  supabase: SupabaseClient,
  users: CreatedUser[],
  postLookup: Map<PostLookupKey, PostRecord>,
  texturePostLookup: Map<number, PostRecord>
) {
  let count = 0;

  for (const plan of SEED_REACTION_PLANS) {
    const post = resolvePost(postLookup, plan.owner, plan.projectIndex, plan.postIndex);
    const user = users[plan.userIndex];
    if (!post || !user || user.id === post.authorId) continue;

    const { error } = await supabase.from("post_reactions").upsert(
      {
        post_id: post.id,
        user_id: user.id,
        reaction: plan.reaction,
      },
      { onConflict: "post_id,user_id" }
    );

    if (error) throw new Error(`post_reaction: ${error.message}`);
    count += 1;
  }

  for (const plan of SEED_TEXTURE_REACTION_PLANS) {
    const post = texturePostLookup.get(plan.textureIndex);
    const user = users[plan.userIndex];
    if (!post || !user || user.id === post.authorId) continue;

    const { error } = await supabase.from("post_reactions").upsert(
      {
        post_id: post.id,
        user_id: user.id,
        reaction: plan.reaction,
      },
      { onConflict: "post_id,user_id" }
    );

    if (error) throw new Error(`texture post_reaction: ${error.message}`);
    count += 1;
  }

  return count;
}

async function seedMilestones(supabase: SupabaseClient, users: CreatedUser[]) {
  let count = 0;

  for (const row of SEED_MILESTONES) {
    const user = users[row.userIndex];
    if (!user) continue;

    const { error } = await supabase.from("user_milestones").insert({
      user_id: user.id,
      milestone: row.milestone,
      celebrated: row.celebrated ?? false,
    });

    if (error && error.code !== "23505") {
      throw new Error(`user_milestone: ${error.message}`);
    }

    if (!error) count += 1;
  }

  return count;
}

async function seedConversations(supabase: SupabaseClient, users: CreatedUser[]) {
  let conversationCount = 0;
  let messageCount = 0;

  for (const spec of SEED_CONVERSATIONS) {
    const userA = users[spec.participantA];
    const userB = users[spec.participantB];
    if (!userA || !userB) continue;

    const [orderedA, orderedB] = orderedUserPair(userA.id, userB.id);

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({ user_a: orderedA, user_b: orderedB })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      throw new Error(`conversation: ${conversationError?.message}`);
    }

    conversationCount += 1;

    for (const message of spec.messages) {
      const sender = users[message.senderIndex];
      if (!sender) continue;

      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: sender.id,
        body: message.body,
      });

      if (messageError) throw new Error(`message: ${messageError.message}`);
      messageCount += 1;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);
  }

  return { conversationCount, messageCount };
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

  validateSeedFlares();

  await assertNoSeedUsers(supabase);
  const tags = await loadTags(supabase);
  const postLookup = new Map<PostLookupKey, PostRecord>();
  const texturePostLookup = new Map<number, PostRecord>();

  console.log("Creating seed users (DiceBear avatars)...\n");

  const users: CreatedUser[] = [];

  for (let index = 0; index < SEED_BUILDERS.length; index += 1) {
    const builder = SEED_BUILDERS[index];
    const user = await createSeedUser(supabase, builder, tags);
    users.push(user);
    await seedBuilderContent(supabase, index, builder, user.id, tags, postLookup);
    console.log(`  ${builder.displayName} (${seedEmail(builder.emailLocal)})`);
  }

  console.log("\nSeeding texture share posts...");
  await seedTexturePosts(supabase, users, texturePostLookup);

  let myUserId: string | null = null;
  let myProjectsCreated = 0;

  if (!MY_EMAIL.trim()) {
    console.log("\nMY_EMAIL is empty — skipping your projects and follow graph involving you.");
  } else {
    myUserId = await findUserIdByEmail(supabase, MY_EMAIL.trim());
    if (!myUserId) {
      console.warn(`\nNo auth user for MY_EMAIL (${MY_EMAIL}). Skipping your section.`);
    } else {
      console.log(`\nAdding projects for ${MY_EMAIL} (your avatar unchanged)...`);
      myProjectsCreated = await seedMyProjects(supabase, myUserId, tags, postLookup);
    }
  }

  console.log("\nSeeding articles...");
  const articleCount = await seedArticles(supabase, users);

  console.log("Seeding flares, helpers, and flare threads...");
  const flareStats = await seedFlares(supabase, users, tags);

  console.log("Seeding follows...");
  const followCount = await seedFollows(supabase, users, myUserId);

  console.log("Seeding comments, helpful marks, and reactions...");
  const commentStats = await seedCommentsAndHelpful(
    supabase,
    users,
    myUserId,
    postLookup,
    texturePostLookup
  );
  const reactionCount = await seedReactions(supabase, users, postLookup, texturePostLookup);

  console.log("Seeding milestones...");
  const milestoneCount = await seedMilestones(supabase, users);

  console.log("Seeding conversations...");
  const messageStats = await seedConversations(supabase, users);

  console.log("Seeding reposts...");
  const repostCount = await seedReposts(supabase, users, texturePostLookup);

  const buildPostCount = postLookup.size;
  const builderShareCount = SEED_BUILDERS.reduce((sum, b) => sum + b.sharePosts.length, 0);
  const sharePostCount = builderShareCount + SEED_TEXTURE_POSTS.length;
  const textureCommentCount = SEED_TEXTURE_COMMENT_PLANS.length;
  const textureReactionCount = SEED_TEXTURE_REACTION_PLANS.length;

  console.log("\n--- Seed summary ---");
  console.log(`Seed users:         ${users.length}`);
  console.log(`Your projects:      ${myProjectsCreated} (skipped if already present)`);
  console.log(`Build posts:        ${buildPostCount}`);
  console.log(`Share posts:        ${sharePostCount} (${builderShareCount} per-builder + ${SEED_TEXTURE_POSTS.length} texture)`);
  console.log(`Reposts:            ${repostCount} (plain, quote, and unavailable original)`);
  console.log(`Articles:           ${articleCount}`);
  console.log(`Flares:             ${flareStats.flareCount}`);
  console.log(`Flare helpers:      ${flareStats.helperCount}`);
  console.log(`Flare comments:     ${flareStats.commentCount}`);
  console.log(`Post comments:      ${commentStats.commentCount} (incl. ${textureCommentCount} on texture posts)`);
  console.log(`Helpful marks:      ${commentStats.helpfulCount + flareStats.helpfulCount}`);
  console.log(`Post reactions:     ${reactionCount} (incl. ${textureReactionCount} on texture posts)`);
  console.log(`Follows:            ${followCount}`);
  console.log(`Milestones:         ${milestoneCount}`);
  console.log(`Conversations:      ${messageStats.conversationCount}`);
  console.log(`Messages:           ${messageStats.messageCount}`);
  console.log(`Avatars:            DiceBear thumbs style (URL in profiles.avatar_url)`);
  console.log("\nTeardown: npx tsx scripts/unseed.ts");
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/seed.ts");

if (isDirectRun) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
