import { followUser, unfollowUser } from "@/app/(app)/actions/follows";
import {
  compactButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/lib/ui/classes";

type FollowButtonProps = {
  profileId: string;
  isFollowing: boolean;
  compact?: boolean;
  redirectTo?: string;
};

export function FollowButton({
  profileId,
  isFollowing,
  compact = false,
  redirectTo,
}: FollowButtonProps) {
  const action = isFollowing ? unfollowUser : followUser;
  const label = isFollowing ? "Unfollow" : "Follow";
  const className = compact
    ? isFollowing
      ? `${secondaryButtonClassName} !px-2.5 !py-1 !text-xs`
      : `${compactButtonClassName} bg-ember text-warmwhite`
    : isFollowing
      ? secondaryButtonClassName
      : primaryButtonClassName;

  return (
    <form action={action}>
      <input type="hidden" name="user_id" value={profileId} />
      {redirectTo ? <input type="hidden" name="redirect_to" value={redirectTo} /> : null}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
