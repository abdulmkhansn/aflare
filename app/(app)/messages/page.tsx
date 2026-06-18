import type { Metadata } from "next";

import { InboxList } from "@/components/inbox-list";
import { NewMessagePicker } from "@/components/new-message-picker";
import { PageHeader } from "@/components/page-header";
import { pageTitle } from "@/lib/app/brand";
import { getInbox } from "@/lib/messages/get-inbox";
import { emptyStateClassName, errorTextClassName, pageStackClassName } from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";

export const metadata: Metadata = {
  title: pageTitle("Messages"),
};

type MessagesPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const auth = await requireOnboarded();
  const { error } = await searchParams;
  const items = await getInbox(auth.userId);

  return (
    <div className={pageStackClassName}>
      <PageHeader title="Messages" description="Message other builders directly." />

      <NewMessagePicker />

      {error ? (
        <p className={errorTextClassName} role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className={emptyStateClassName}>
          No conversations yet. Tap New message to find a builder, or message someone from their
          profile.
        </div>
      ) : (
        <InboxList items={items} />
      )}
    </div>
  );
}
