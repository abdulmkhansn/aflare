"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMentionNotifications } from "@/lib/mentions/create-mention-notifications";
import { isPostType } from "@/lib/posts/post-types";
import {
  hasStructuredMedia,
  type PostStructuredFields,
} from "@/lib/posts/structured-fields";
import { recordMilestone, withCelebrationParam } from "@/lib/milestones/record-milestone";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithPostError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function readStructuredFields(formData: FormData): PostStructuredFields {
  const imageUrl = readTrimmed(formData, "image_url");
  const videoUrl = readTrimmed(formData, "uploaded_video_url");
  const linkUrl = readTrimmed(formData, "link_url");
  const linkLabel = readTrimmed(formData, "link_label");

  const fields: PostStructuredFields = {};

  if (imageUrl) {
    fields.image_url = imageUrl;
  }

  if (videoUrl) {
    fields.video_url = videoUrl;
  }

  if (linkUrl) {
    try {
      const parsed = new URL(linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`);
      fields.link_url = parsed.toString();
      if (linkLabel) {
        fields.link_label = linkLabel;
      }
    } catch {
      // ignore invalid link
    }
  }

  return fields;
}

function buildStructuredPayload(fields: PostStructuredFields): PostStructuredFields | null {
  const cleaned = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => Boolean(value))
  ) as PostStructuredFields;

  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export async function createFeedPost(formData: FormData) {
  const auth = await requireOnboarded();
  const body = readTrimmed(formData, "body");
  const addToProject = readTrimmed(formData, "add_to_project") === "1";
  const projectId = addToProject ? readTrimmed(formData, "project_id") : "";
  const typeRaw = readTrimmed(formData, "type") || "update";
  const redirectTo = readTrimmed(formData, "redirect_to") || "/";

  const structuredFields = readStructuredFields(formData);

  if (!body && !hasStructuredMedia(structuredFields)) {
    redirectWithPostError(redirectTo, "Write something or add a photo, video, or link.");
  }

  const isShare = !addToProject;
  const kind = isShare ? "share" : "build";

  if (addToProject && !projectId) {
    redirectWithPostError(redirectTo, "Pick a project for this build update.");
  }

  if (addToProject && !isPostType(typeRaw)) {
    redirectWithPostError(redirectTo, "Pick a valid post type.");
  }

  const supabase = await createClient();

  if (projectId) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError || !project) {
      redirectWithPostError(redirectTo, "That project was not found.");
    }

    if (project.owner_id !== auth.userId) {
      redirectWithPostError(redirectTo, "You can only post to your own projects.");
    }
  }

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      project_id: projectId || null,
      author_id: auth.userId,
      kind,
      type: isShare ? "update" : typeRaw,
      body: body || "",
      structured_fields: buildStructuredPayload(structuredFields),
      article_id: null,
    })
    .select("id")
    .single();

  if (insertError || !post) {
    redirectWithPostError(redirectTo, insertError?.message ?? "Couldn't post that update.");
  }

  await createMentionNotifications(body, {
    actorId: auth.userId,
    postId: post.id,
  });

  let nextRedirect = redirectTo;
  const postType = isShare ? "update" : typeRaw;

  if (postType === "shipped") {
    const { isNew } = await recordMilestone(supabase, auth.userId, "first_ship");
    const separator = redirectTo.includes("?") ? "&" : "?";
    nextRedirect = withCelebrationParam(
      `${redirectTo}${separator}posted=1`,
      isNew,
      "first_ship"
    );
  } else {
    const separator = redirectTo.includes("?") ? "&" : "?";
    nextRedirect = `${redirectTo}${separator}posted=1`;
  }

  revalidatePath("/");

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }

  redirect(nextRedirect);
}

export async function createPost(formData: FormData) {
  const auth = await requireOnboarded();
  const projectId = readTrimmed(formData, "project_id");
  const body = readTrimmed(formData, "body");
  const typeRaw = readTrimmed(formData, "type") || "update";
  const redirectTo = readTrimmed(formData, "redirect_to") || `/projects/${projectId}`;

  if (!projectId) {
    redirectWithPostError("/", "Pick a project before posting.");
  }

  if (!body) {
    redirectWithPostError(redirectTo, "Write an update before posting.");
  }

  if (!isPostType(typeRaw)) {
    redirectWithPostError(redirectTo, "Pick a valid post type.");
  }

  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    redirectWithPostError(redirectTo, "That project was not found.");
  }

  if (project.owner_id !== auth.userId) {
    redirectWithPostError(redirectTo, "You can only post to your own projects.");
  }

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      project_id: projectId,
      author_id: auth.userId,
      kind: "build",
      type: typeRaw,
      body,
      structured_fields: null,
      article_id: null,
    })
    .select("id")
    .single();

  if (insertError || !post) {
    redirectWithPostError(redirectTo, insertError?.message ?? "Couldn't post that update.");
  }

  await createMentionNotifications(body, {
    actorId: auth.userId,
    postId: post.id,
  });

  let nextRedirect = redirectTo;

  if (typeRaw === "shipped") {
    const { isNew } = await recordMilestone(supabase, auth.userId, "first_ship");
    const separator = redirectTo.includes("?") ? "&" : "?";
    nextRedirect = withCelebrationParam(
      `${redirectTo}${separator}posted=1`,
      isNew,
      "first_ship"
    );
  } else {
    const separator = redirectTo.includes("?") ? "&" : "?";
    nextRedirect = `${redirectTo}${separator}posted=1`;
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  redirect(nextRedirect);
}
