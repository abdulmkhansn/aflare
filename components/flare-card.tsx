import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { isDeletedProfile, profileAvatarUrl, profileDisplayName } from "@/lib/profiles/public-fields";
import { BookmarkControl } from "@/components/bookmarks/bookmark-control";
import { MentionBody } from "@/components/mentions/mention-body";
import { FlareStatusBadge } from "@/components/flare-status-badge";
import {
  flareBodyRedundantWithTitle,
  resolveFlareAuthor,
  resolveFlareHelpers,
  resolveFlareTags,
  type FlareListItem,
} from "@/lib/flares/types";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { formatRelativeTime } from "@/lib/time/relative-time";
import { cardClassName, focusRingClassName, tagPillClassName } from "@/lib/ui/classes";

type FlareCardProps = {
  flare: FlareListItem;
  isBookmarked?: boolean;
};

export function FlareCard({ flare, isBookmarked = false }: FlareCardProps) {
  const author = resolveFlareAuthor(flare);
  const helpers = resolveFlareHelpers(flare);
  const tags = resolveFlareTags(flare);
  const displayName = profileDisplayName(author);
  const title = flare.title?.trim();
  const body = flare.body?.trim() ?? "";
  const showBody = Boolean(body) && !(title && flareBodyRedundantWithTitle(title, body));

  return (
    <article className={`${cardClassName} transition-colors hover:border-ember/30`}>
      <Link href={`/flarespace/${flare.id}`} className={`block ${focusRingClassName}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title ? <h3 className="text-sm font-medium text-fg">{title}</h3> : null}
            {showBody ? (
              <MentionBody
                body={body}
                className={`line-clamp-4 text-sm leading-relaxed text-fg ${title ? "mt-1" : ""}`}
              />
            ) : null}
          </div>
          <FlareStatusBadge status={flare.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <Avatar
              displayName={displayName}
              avatarUrl={profileAvatarUrl(author)}
              size="sm"
              deleted={isDeletedProfile(author)}
            />
            <span className="text-xs text-fg-muted">{displayName}</span>
          </div>

          <time className="text-xs text-fg-muted" dateTime={flare.created_at}>
            {formatRelativeTime(flare.created_at)}
          </time>

          {helpers.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {helpers.slice(0, 4).map((helper) => {
                  const profile = Array.isArray(helper.profiles)
                    ? helper.profiles[0]
                    : helper.profiles;

                  return (
                    <span key={helper.user_id} className="inline-flex rounded-full ring-2 ring-surface-card">
                      <Avatar
                        displayName={profile?.display_name ?? null}
                        avatarUrl={profile?.avatar_url ?? null}
                        size="sm"
                      />
                    </span>
                  );
                })}
              </div>
              {helpers.length > 4 ? (
                <span className="text-xs text-fg-muted">+{helpers.length - 4}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag.id} className={tagPillClassName}>
                {formatTagLabel(tag.label)}
              </span>
            ))}
          </div>
        ) : null}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
        <Link
          href={`/flarespace/${flare.id}`}
          className={`text-sm font-medium text-fg hover:underline ${focusRingClassName}`}
        >
          View in Flarespace
        </Link>
        <BookmarkControl targetType="flare" targetId={flare.id} isSaved={isBookmarked} />
      </div>
    </article>
  );
}
