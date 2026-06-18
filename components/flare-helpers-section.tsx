import Link from "next/link";

import { joinFlareHelper, leaveFlareHelper } from "@/app/(app)/actions/flares";
import { Avatar } from "@/components/avatar";
import { isDeletedProfile, profileAvatarUrl, profileDisplayName } from "@/lib/profiles/public-fields";
import { resolveFlareHelpers, type FlareRow } from "@/lib/flares/types";
import { focusRingClassName, secondaryButtonClassName } from "@/lib/ui/classes";

type FlareHelpersSectionProps = {
  flare: FlareRow;
  currentUserId: string;
  redirectTo: string;
  isHelper: boolean;
};

export function FlareHelpersSection({
  flare,
  currentUserId,
  redirectTo,
  isHelper,
}: FlareHelpersSectionProps) {
  const helpers = resolveFlareHelpers(flare);
  const isResolved = flare.status === "resolved";
  const canHelp = !isResolved && currentUserId !== flare.author_id;

  if (isResolved && helpers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
      <span className="text-fg-muted">Who&apos;s helping</span>
      <span className="text-fg-muted" aria-hidden="true">
        ·
      </span>

      {helpers.length > 0 ? (
        <div className="inline-flex flex-wrap items-center gap-1.5">
          {helpers.map((helper) => {
            const profile = Array.isArray(helper.profiles)
              ? helper.profiles[0]
              : helper.profiles;
            const name = profileDisplayName(profile);
            const deleted = isDeletedProfile(profile);

            if (deleted) {
              return (
                <span
                  key={helper.user_id}
                  title={name}
                  className="inline-flex rounded-full"
                >
                  <Avatar displayName={name} avatarUrl={null} size="sm" deleted />
                </span>
              );
            }

            return (
              <Link
                key={helper.user_id}
                href={`/u/${helper.user_id}`}
                title={name}
                className={`inline-flex rounded-full ${focusRingClassName}`}
              >
                <Avatar
                  displayName={profile?.display_name ?? null}
                  avatarUrl={profileAvatarUrl(profile)}
                  size="sm"
                />
              </Link>
            );
          })}
          <span className="text-fg-muted">
            {helpers.length} {helpers.length === 1 ? "person" : "people"}
          </span>
        </div>
      ) : (
        <span className="text-fg-muted">No one helping yet. Tap I can help if you have something useful.</span>
      )}

      {canHelp ? (
        isHelper ? (
          <form action={leaveFlareHelper} className="inline">
            <input type="hidden" name="flare_id" value={flare.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <button type="submit" className={`${secondaryButtonClassName} !px-2.5 !py-1 text-xs`}>
              Step back
            </button>
          </form>
        ) : (
          <form action={joinFlareHelper} className="inline">
            <input type="hidden" name="flare_id" value={flare.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <button
              type="submit"
              className={`rounded-md border border-ember/40 px-2.5 py-1 text-xs text-ember transition-colors hover:bg-ember/10 ${focusRingClassName}`}
            >
              I can help
            </button>
          </form>
        )
      ) : null}
    </div>
  );
}
