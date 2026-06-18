import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { formatRelativeTime } from "@/lib/time/relative-time";
import type { InboxItem } from "@/lib/messages/types";
import { interactiveCardLinkClassName } from "@/lib/ui/classes";

type InboxListProps = {
  items: InboxItem[];
};

function snippet(body: string | null) {
  if (!body) {
    return "Start the conversation";
  }

  const trimmed = body.trim().replace(/\s+/g, " ");

  if (trimmed.length <= 80) {
    return trimmed;
  }

  return `${trimmed.slice(0, 79)}…`;
}

export function InboxList({ items }: InboxListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const name = item.displayName?.trim() || "Unknown builder";

        return (
          <li key={item.conversationId}>
            <Link href={`/messages/${item.conversationId}`} className={interactiveCardLinkClassName}>
              <div className="flex items-start gap-3">
                <Avatar
                  displayName={item.displayName}
                  avatarUrl={item.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-fg">{name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.unreadCount > 0 ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[11px] font-medium text-warmwhite">
                          {item.unreadCount}
                        </span>
                      ) : null}
                      {item.lastMessageAt ? (
                        <time className="text-xs text-fg-muted" dateTime={item.lastMessageAt}>
                          {formatRelativeTime(item.lastMessageAt)}
                        </time>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1 truncate text-sm text-fg-muted">
                    {snippet(item.lastMessageBody)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
