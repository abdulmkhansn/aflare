"use server";

import { revalidatePath } from "next/cache";

import { inlineError, inlineOk, type InlineActionResult } from "@/lib/actions/inline-result";
import { createMentionNotifications } from "@/lib/mentions/create-mention-notifications";
import { buildBoostStructuredFields } from "@/lib/posts/boost";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function boostFlare(formData: FormData): Promise<InlineActionResult> {
  const auth = await requireOnboarded();
  const flareId = readTrimmed(formData, "flare_id");
  const note = readTrimmed(formData, "note");

  if (!flareId) {
    return inlineError("That flare was not found.");
  }

  const supabase = await createClient();

  const { data: flare, error: flareError } = await supabase
    .from("flares")
    .select("id, author_id, status")
    .eq("id", flareId)
    .maybeSingle();

  if (flareError || !flare) {
    return inlineError("That flare was not found.");
  }

  if (flare.author_id === auth.userId) {
    return inlineError("Share someone else's flare when you know who might help.");
  }

  if (flare.status === "resolved") {
    return inlineError("This flare is resolved. Reopen it first if help is still needed.");
  }

  const { data: boost, error: insertError } = await supabase
    .from("posts")
    .insert({
      author_id: auth.userId,
      kind: "share",
      type: "update",
      body: note,
      project_id: null,
      article_id: null,
      reposted_post_id: null,
      boosted_flare_id: flareId,
      structured_fields: buildBoostStructuredFields(),
    })
    .select("id")
    .single();

  if (insertError || !boost) {
    return inlineError(insertError?.message ?? "Couldn't share that flare.");
  }

  if (note) {
    await createMentionNotifications(note, {
      actorId: auth.userId,
      postId: boost.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/flarespace");
  revalidatePath("/blockers");
  revalidatePath(`/flarespace/${flareId}`);

  return inlineOk();
}
