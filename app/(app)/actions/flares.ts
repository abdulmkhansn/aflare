"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

function flareErrorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function flareDetailRedirect(flareId: string, message: string, key = "error"): never {
  redirect(`/flarespace/${flareId}?${key}=${encodeURIComponent(message)}`);
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

function readTagIds(formData: FormData): string[] {
  return formData
    .getAll("tag_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function revalidateFlarePaths(flareId?: string) {
  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath("/blockers");

  if (flareId) {
    revalidatePath(`/flarespace/${flareId}`);
  }
}

async function ensureFlareAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  flareId: string,
  userId: string
) {
  const { data: flare, error } = await supabase
    .from("flares")
    .select("id, author_id")
    .eq("id", flareId)
    .maybeSingle();

  if (error || !flare) {
    return null;
  }

  if (flare.author_id !== userId) {
    return null;
  }

  return flare;
}

async function addHelperIfMissing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  flareId: string,
  userId: string
) {
  const { error } = await supabase.from("flare_helpers").upsert(
    { flare_id: flareId, user_id: userId },
    { onConflict: "flare_id,user_id", ignoreDuplicates: true }
  );

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }
}

export async function createFlare(formData: FormData) {
  const auth = await requireOnboarded();
  const body = readTrimmed(formData, "body");
  const title = readTrimmed(formData, "title") || null;
  const redirectTo = readTrimmed(formData, "redirect_to") || "/flarespace";
  const structuredFields = readStructuredFields(formData);
  const tagIds = readTagIds(formData);

  if (!body && !hasStructuredMedia(structuredFields)) {
    flareErrorRedirect(redirectTo, "Write something or add a screenshot, image, or link.");
  }

  const supabase = await createClient();

  const { data: flare, error: insertError } = await supabase
    .from("flares")
    .insert({
      author_id: auth.userId,
      body: body || "",
      title,
      structured_fields: buildStructuredPayload(structuredFields),
    })
    .select("id")
    .single();

  if (insertError || !flare) {
    flareErrorRedirect(redirectTo, insertError?.message ?? "Could not send up that flare.");
  }

  if (tagIds.length > 0) {
    const { error: tagError } = await supabase.from("flare_tags").insert(
      tagIds.map((tagId) => ({
        flare_id: flare.id,
        tag_id: tagId,
      }))
    );

    if (tagError) {
      flareErrorRedirect(redirectTo, tagError.message);
    }
  }

  revalidateFlarePaths(flare.id);

  const { isNew } = await recordMilestone(supabase, auth.userId, "first_flare");
  redirect(
    withCelebrationParam("/flarespace?view=mine&toast=flare_sent", isNew, "first_flare")
  );
}

export async function updateFlareState(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const field = readTrimmed(formData, "field");

  if (!flareId || !["tried", "ruled_out", "current_status"].includes(field)) {
    flareErrorRedirect("/flarespace", "That update could not be saved.");
  }

  const supabase = await createClient();
  const flare = await ensureFlareAuthor(supabase, flareId, auth.userId);

  if (!flare) {
    flareDetailRedirect(flareId, "Only the person who sent up this flare can edit the live state.");
  }

  const value = readTrimmed(formData, "value") || null;

  const { error } = await supabase
    .from("flares")
    .update({ [field]: value })
    .eq("id", flareId);

  if (error) {
    flareDetailRedirect(flareId, error.message);
  }

  revalidateFlarePaths(flareId);
  redirect(`/flarespace/${flareId}?toast=state_saved`);
}

export async function joinFlareHelper(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const redirectTo = readTrimmed(formData, "redirect_to") || `/flarespace/${flareId}`;

  if (!flareId) {
    flareErrorRedirect("/flarespace", "That flare was not found.");
  }

  const supabase = await createClient();

  const { data: flare, error: flareError } = await supabase
    .from("flares")
    .select("id, status")
    .eq("id", flareId)
    .maybeSingle();

  if (flareError || !flare) {
    flareDetailRedirect(flareId, "That flare was not found.");
  }

  if (flare.status === "resolved") {
    flareDetailRedirect(flareId, "This flare is resolved. Reopen it first if help is still needed.");
  }

  const { error } = await supabase.from("flare_helpers").upsert(
    { flare_id: flareId, user_id: auth.userId },
    { onConflict: "flare_id,user_id", ignoreDuplicates: true }
  );

  if (error) {
    flareDetailRedirect(flareId, error.message);
  }

  revalidateFlarePaths(flareId);
  redirect(redirectTo);
}

export async function leaveFlareHelper(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const redirectTo = readTrimmed(formData, "redirect_to") || `/flarespace/${flareId}`;

  if (!flareId) {
    flareErrorRedirect("/flarespace", "That flare was not found.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("flare_helpers")
    .delete()
    .eq("flare_id", flareId)
    .eq("user_id", auth.userId);

  if (error) {
    flareDetailRedirect(flareId, error.message);
  }

  revalidateFlarePaths(flareId);
  redirect(redirectTo);
}

export async function createFlareComment(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const body = readTrimmed(formData, "body");
  const redirectTo = readTrimmed(formData, "redirect_to") || `/flarespace/${flareId}`;

  if (!flareId) {
    flareErrorRedirect("/flarespace", "That flare was not found.");
  }

  if (!body) {
    redirect(`${redirectTo}?commentError=${encodeURIComponent("Write a reply before posting.")}`);
  }

  const supabase = await createClient();

  const { data: flare, error: flareError } = await supabase
    .from("flares")
    .select("id, status, author_id")
    .eq("id", flareId)
    .maybeSingle();

  if (flareError || !flare) {
    redirect(`${redirectTo}?commentError=${encodeURIComponent("That flare was not found.")}`);
  }

  if (flare.status === "resolved") {
    redirect(
      `${redirectTo}?commentError=${encodeURIComponent("This flare is resolved. Reopen it to keep the thread going.")}`
    );
  }

  const { error: insertError } = await supabase.from("flare_comments").insert({
    flare_id: flareId,
    author_id: auth.userId,
    body,
  });

  if (insertError) {
    redirect(`${redirectTo}?commentError=${encodeURIComponent(insertError.message)}`);
  }

  await addHelperIfMissing(supabase, flareId, auth.userId);

  let nextRedirect = `${redirectTo}?toast=reply_posted`;

  if (flare.author_id !== auth.userId) {
    const { isNew } = await recordMilestone(supabase, auth.userId, "first_flare_reply");
    nextRedirect = withCelebrationParam(nextRedirect, isNew, "first_flare_reply");
  }

  revalidateFlarePaths(flareId);
  redirect(nextRedirect);
}

export async function resolveFlare(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const resolutionNote = readTrimmed(formData, "resolution_note") || null;

  if (!flareId) {
    flareErrorRedirect("/flarespace", "That flare was not found.");
  }

  const supabase = await createClient();
  const flare = await ensureFlareAuthor(supabase, flareId, auth.userId);

  if (!flare) {
    flareDetailRedirect(flareId, "Only the person who sent up this flare can mark it resolved.");
  }

  const { error } = await supabase
    .from("flares")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolution_note: resolutionNote,
    })
    .eq("id", flareId);

  if (error) {
    flareDetailRedirect(flareId, error.message);
  }

  revalidateFlarePaths(flareId);
  redirect(`/flarespace/${flareId}?toast=resolved`);
}

export async function reopenFlare(formData: FormData) {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");

  if (!flareId) {
    flareErrorRedirect("/flarespace", "That flare was not found.");
  }

  const supabase = await createClient();
  const flare = await ensureFlareAuthor(supabase, flareId, auth.userId);

  if (!flare) {
    flareDetailRedirect(flareId, "Only the person who sent up this flare can reopen it.");
  }

  const { count, error: countError } = await supabase
    .from("flare_helpers")
    .select("user_id", { count: "exact", head: true })
    .eq("flare_id", flareId);

  if (countError) {
    flareDetailRedirect(flareId, countError.message);
  }

  const nextStatus = (count ?? 0) > 0 ? "being_helped" : "open";

  const { error } = await supabase
    .from("flares")
    .update({
      status: nextStatus,
      resolved_at: null,
    })
    .eq("id", flareId);

  if (error) {
    flareDetailRedirect(flareId, error.message);
  }

  revalidateFlarePaths(flareId);
  redirect(`/flarespace/${flareId}?toast=reopened`);
}
