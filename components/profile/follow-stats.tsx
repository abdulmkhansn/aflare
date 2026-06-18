"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { followUserInline, unfollowUserInline } from "@/app/(app)/actions/follows";
import { Avatar } from "@/components/avatar";
import type { FollowListEntry, FollowListKind } from "@/lib/profiles/get-follow-list";
import {
  DELETED_BUILDER_LABEL,
  isDeletedProfile,
  profileDisplayName,
} from "@/lib/profiles/public-fields";
import { emptyStateClassName, focusRingClassName, modalBackdropClassName, modalPanelClassName } from "@/lib/ui/classes";
import { refreshInPlace } from "@/lib/ui/refresh-in-place";
import { useInlineFormAction } from "@/lib/ui/use-inline-form-action";

type FollowListDialogProps = {
  currentUserId: string;
  kind: FollowListKind;
  entries: FollowListEntry[];
  followingIds: string[];
  onClose: () => void;
};

function FollowListRow({
  profile,
  currentUserId,
  isFollowing,
}: {
  profile: FollowListEntry;
  currentUserId: string;
  isFollowing: boolean;
}) {
  const router = useRouter();
  const action = isFollowing ? unfollowUserInline : followUserInline;
  const { onSubmit, isPending } = useInlineFormAction(action, {
    onSuccess: () => refreshInPlace(router),
  });
  const deleted = isDeletedProfile(profile);
  const name = profileDisplayName(profile);
  const isOwnProfile = profile.id === currentUserId;

  if (deleted) {
    return (
      <li className="flex items-center justify-between gap-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar displayName={name} avatarUrl={null} size="sm" deleted />
          <span className="truncate text-sm text-fg-muted">{DELETED_BUILDER_LABEL}</span>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <Link
        href={`/u/${profile.id}`}
        className={`flex min-w-0 flex-1 items-center gap-3 ${focusRingClassName}`}
      >
        <Avatar displayName={profile.display_name} avatarUrl={profile.avatar_url} size="sm" />
        <span className="truncate text-sm font-medium text-fg hover:underline">{name}</span>
      </Link>

      {!isOwnProfile ? (
        <form onSubmit={onSubmit} className="shrink-0">
          <input type="hidden" name="user_id" value={profile.id} />
          <button
            type="submit"
            disabled={isPending}
            className={`text-xs font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline disabled:opacity-60 ${focusRingClassName}`}
          >
            {isPending ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
        </form>
      ) : null}
    </li>
  );
}

function FollowListDialog({
  currentUserId,
  kind,
  entries,
  followingIds,
  onClose,
}: FollowListDialogProps) {
  const title = kind === "followers" ? "Followers" : "Following";
  const emptyMessage =
    kind === "followers"
      ? "No followers yet. When builders follow this profile, they show up here."
      : "Not following anyone yet. Find builders on the feed or Flarespace and follow from their profile.";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={modalBackdropClassName} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-list-title"
        className={`${modalPanelClassName} flex max-h-[min(80vh,32rem)] max-w-md flex-col overflow-hidden`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 id="follow-list-title" className="text-base font-medium text-fg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-[var(--hover-subtle)] hover:text-fg ${focusRingClassName}`}
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-2">
          {entries.length > 0 ? (
            <ul className="divide-y divide-border-subtle">
              {entries.map((entry) => (
                <FollowListRow
                  key={entry.id}
                  profile={entry}
                  currentUserId={currentUserId}
                  isFollowing={followingIds.includes(entry.id)}
                />
              ))}
            </ul>
          ) : (
            <p className={`my-4 ${emptyStateClassName}`}>{emptyMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type FollowStatsProps = {
  currentUserId: string;
  followerCount: number;
  followingCount: number;
  followerEntries: FollowListEntry[];
  followingEntries: FollowListEntry[];
  followingIds: string[];
};

export function FollowStats({
  currentUserId,
  followerCount,
  followingCount,
  followerEntries,
  followingEntries,
  followingIds,
}: FollowStatsProps) {
  const [openKind, setOpenKind] = useState<FollowListKind | null>(null);
  const close = useCallback(() => setOpenKind(null), []);

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
        <button
          type="button"
          onClick={() => setOpenKind("followers")}
          className={`cursor-pointer hover:text-fg hover:underline ${focusRingClassName}`}
        >
          <span className="font-medium text-fg">{followerCount}</span>{" "}
          {followerCount === 1 ? "follower" : "followers"}
        </button>
        <button
          type="button"
          onClick={() => setOpenKind("following")}
          className={`cursor-pointer hover:text-fg hover:underline ${focusRingClassName}`}
        >
          <span className="font-medium text-fg">{followingCount}</span> following
        </button>
      </div>

      {openKind ? (
        <FollowListDialog
          currentUserId={currentUserId}
          kind={openKind}
          entries={openKind === "followers" ? followerEntries : followingEntries}
          followingIds={followingIds}
          onClose={close}
        />
      ) : null}
    </>
  );
}
