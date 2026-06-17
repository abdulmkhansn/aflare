import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ConversationView } from "@/components/conversation-view";
import { SafetyMenu } from "@/components/safety-menu";
import { Avatar } from "@/components/avatar";
import { pageTitle } from "@/lib/app/brand";
import { hasBlockedUser, isBlockedBetween } from "@/lib/messages/blocks";
import { getConversationDetail } from "@/lib/messages/get-conversation";
import { errorTextClassName, focusRingClassName, statusTextClassName } from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    blocked?: string;
    unblocked?: string;
    reported?: string;
  }>;
};

export async function generateMetadata({ params }: ConversationPageProps): Promise<Metadata> {
  const { id } = await params;
  const auth = await requireOnboarded();
  const detail = await getConversationDetail(id, auth.userId);
  const name = detail?.otherUser.displayName?.trim();

  return {
    title: name ? pageTitle(`${name} · Messages`) : pageTitle("Conversation"),
  };
}

export default async function ConversationPage({ params, searchParams }: ConversationPageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const query = await searchParams;

  const detail = await getConversationDetail(id, auth.userId);

  if (!detail) {
    notFound();
  }

  if (await isBlockedBetween(auth.userId, detail.otherUser.id)) {
    redirect("/messages");
  }

  const displayName = detail.otherUser.displayName?.trim() || "Unknown builder";
  const isBlocked = await hasBlockedUser(auth.userId, detail.otherUser.id);
  const redirectTo = `/messages/${id}`;

  const statusMessage = query.reported
    ? "Reported. Our team will review."
    : query.blocked
      ? "Blocked. They can no longer message you."
      : query.unblocked
        ? "Unblocked. You can message each other again."
        : null;

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/messages"
            className={`shrink-0 text-sm text-fg-muted hover:text-fg ${focusRingClassName}`}
          >
            Back
          </Link>
          <Link
            href={`/u/${detail.otherUser.id}`}
            className={`flex min-w-0 items-center gap-2 ${focusRingClassName}`}
          >
            <Avatar
              displayName={detail.otherUser.displayName}
              avatarUrl={detail.otherUser.avatarUrl}
              size="sm"
            />
            <span className="truncate text-sm font-medium text-fg">{displayName}</span>
          </Link>
        </div>

        <SafetyMenu
          otherUserId={detail.otherUser.id}
          isBlocked={isBlocked}
          redirectTo={redirectTo}
        />
      </header>

      {statusMessage ? (
        <p className={`mt-3 ${statusTextClassName}`} role="status">
          {statusMessage}
        </p>
      ) : null}

      {query.error ? (
        <p className={`mt-3 ${errorTextClassName}`} role="alert">
          {query.error}
        </p>
      ) : null}

      <ConversationView
        conversationId={id}
        currentUserId={auth.userId}
        initialMessages={detail.messages}
      />
    </div>
  );
}
