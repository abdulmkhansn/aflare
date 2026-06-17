"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isBlockedBetween } from "@/lib/messages/blocks";
import { orderedUserPair } from "@/lib/messages/types";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

import type { MessageRow } from "@/lib/messages/types";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function startConversation(formData: FormData) {
  const auth = await requireOnboarded();
  const otherUserId = readTrimmed(formData, "user_id");
  const redirectTo = readTrimmed(formData, "redirect_to");
  const errorBase = redirectTo || (otherUserId ? `/u/${otherUserId}` : "/messages");

  if (!otherUserId) {
    redirect(redirectTo || "/messages");
  }

  if (otherUserId === auth.userId) {
    redirect(redirectTo || `/u/${auth.userId}`);
  }

  if (await isBlockedBetween(auth.userId, otherUserId)) {
    redirect(`${errorBase}?error=${encodeURIComponent("You cannot message this person.")}`);
  }

  const supabase = await createClient();
  const [user_a, user_b] = orderedUserPair(auth.userId, otherUserId);

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a", user_a)
    .eq("user_b", user_b)
    .maybeSingle();

  if (existingError) {
    redirect(`${errorBase}?error=${encodeURIComponent(existingError.message)}`);
  }

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({ user_a, user_b })
    .select("id")
    .single();

  if (createError) {
    if (createError.code === "23505") {
      const { data: raced } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_a", user_a)
        .eq("user_b", user_b)
        .maybeSingle();

      if (raced) {
        redirect(`/messages/${raced.id}`);
      }
    }

    redirect(`${errorBase}?error=${encodeURIComponent(createError.message)}`);
  }

  redirect(`/messages/${created.id}`);
}

export type SendMessageResult =
  | { ok: true; message: MessageRow }
  | { ok: false; error: string };

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<SendMessageResult> {
  const auth = await requireOnboarded();
  const trimmed = body.trim();

  if (!conversationId) {
    return { ok: false, error: "Conversation not found. Go back to Messages and try again." };
  }

  if (!trimmed) {
    return { ok: false, error: "Write a message before sending." };
  }

  const supabase = await createClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    return { ok: false, error: conversationError.message };
  }

  if (!conversation) {
    return { ok: false, error: "Conversation not found. Go back to Messages and try again." };
  }

  if (conversation.user_a !== auth.userId && conversation.user_b !== auth.userId) {
    return { ok: false, error: "You do not have access to this conversation." };
  }

  const otherUserId =
    conversation.user_a === auth.userId ? conversation.user_b : conversation.user_a;

  if (await isBlockedBetween(auth.userId, otherUserId)) {
    return {
      ok: false,
      error: "You cannot send messages to this person. Unblock them first if you changed your mind.",
    };
  }

  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: auth.userId,
      body: trimmed,
    })
    .select("id, conversation_id, sender_id, body, read_at, created_at")
    .single();

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);

  return { ok: true, message: message as MessageRow };
}

export async function markMessagesRead(conversationId: string) {
  const auth = await requireOnboarded();
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.user_a !== auth.userId && conversation.user_b !== auth.userId)
  ) {
    return;
  }

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", auth.userId)
    .is("read_at", null);

  revalidatePath("/messages");
}
