import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { SafetyMenu } from "@/components/safety-menu";
import { Avatar } from "@/components/avatar";
import { ProjectStageBadge } from "@/components/project-stage-badge";
import { pageTitle } from "@/lib/app/brand";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import { hasBlockedUser, isBlockedBetween } from "@/lib/messages/blocks";
import {
  cardClassName,
  emptyStateClassName,
  errorTextClassName,
  interactiveCardLinkClassName,
  pageTitleClassName,
  sectionTitleClassName,
  tagPillClassName,
  verifiedBadgeClassName,
  statusTextClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    blocked?: string;
    unblocked?: string;
    reported?: string;
  }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .maybeSingle();

  const name = profile?.display_name?.trim();

  return {
    title: name ? pageTitle(name) : pageTitle("Profile"),
  };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const { error, blocked, unblocked, reported } = await searchParams;
  const supabase = await createClient();
  const isOwnProfile = auth.userId === id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, display_name, bio, avatar_url, verified_builder, reputation_score, github_username"
    )
    .eq("id", id)
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

  const [{ data: profileTags }, { data: projects }, { data: followRow }, blockedBetween, hasBlocked] =
    await Promise.all([
    supabase
      .from("profile_tags")
      .select("kind, tag_id, tags ( id, label )")
      .eq("profile_id", id),
    supabase
      .from("projects")
      .select("id, name, one_liner, stage")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),
    isOwnProfile
      ? Promise.resolve({ data: null })
      : supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", auth.userId)
          .eq("following_id", id)
          .maybeSingle(),
    isOwnProfile ? Promise.resolve(false) : isBlockedBetween(auth.userId, id),
    isOwnProfile ? Promise.resolve(false) : hasBlockedUser(auth.userId, id),
  ]);

  const brings =
    profileTags
      ?.filter((row) => row.kind === "brings")
      .map((row) => (Array.isArray(row.tags) ? row.tags[0] : row.tags))
      .filter(Boolean) ?? [];

  const openTo =
    profileTags
      ?.filter((row) => row.kind === "open_to")
      .map((row) => (Array.isArray(row.tags) ? row.tags[0] : row.tags))
      .filter(Boolean) ?? [];

  const displayName = profile.display_name?.trim() || "Unknown builder";

  const statusMessage = reported
    ? "Reported. Our team will review."
    : blocked
      ? "Blocked. They can no longer message you."
      : unblocked
        ? "Unblocked. You can message each other again."
        : null;

  return (
    <div className="space-y-6">
      <header className={cardClassName}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={pageTitleClassName}>{displayName}</h1>
                {profile.verified_builder ? (
                  <span className={verifiedBadgeClassName}>Verified builder</span>
                ) : null}
              </div>
              {profile.bio ? (
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{profile.bio}</p>
              ) : null}
              <div className="mt-3">
                <p className="text-sm font-medium text-fg">
                  Reputation {profile.reputation_score ?? 0}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                  From people marking this builder&apos;s replies and articles helpful.
                </p>
              </div>
            </div>
          </div>

          {!isOwnProfile ? (
            <div className="flex flex-wrap items-center gap-2">
              {!blockedBetween ? <MessageButton otherUserId={id} /> : null}
              <FollowButton profileId={id} isFollowing={Boolean(followRow)} />
              <SafetyMenu
                otherUserId={id}
                isBlocked={hasBlocked}
                redirectTo={`/u/${id}`}
              />
            </div>
          ) : null}
        </div>

        {statusMessage ? (
          <p className={`mt-4 ${statusTextClassName}`} role="status">
            {statusMessage}
          </p>
        ) : null}

        {error ? (
          <p className={`mt-4 ${errorTextClassName}`} role="alert">
            {error}
          </p>
        ) : null}

        {(brings.length > 0 || openTo.length > 0) && (
          <div className="mt-5 space-y-4 border-t border-border-subtle pt-4">
            {brings.length > 0 ? (
              <div>
                <h2 className={sectionTitleClassName}>What I bring</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {brings.map((tag) => (
                    <li key={tag!.id} className={tagPillClassName}>
                      {formatTagLabel(tag!.label)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {openTo.length > 0 ? (
              <div>
                <h2 className={sectionTitleClassName}>Open to collaborating on</h2>
                <p className="mt-1 text-xs text-fg-muted">
                  Kinds of projects or problems this person welcomes help with.
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {openTo.map((tag) => (
                    <li key={tag!.id} className={tagPillClassName}>
                      {formatTagLabel(tag!.label)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </header>

      <section className="space-y-4">
        <h2 className={sectionTitleClassName}>Projects</h2>

        {projects && projects.length > 0 ? (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className={interactiveCardLinkClassName}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-fg">{project.name}</h3>
                    <ProjectStageBadge stage={project.stage} />
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">{project.one_liner}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className={emptyStateClassName}>
            {isOwnProfile
              ? "No projects yet. Create one with New project in the sidebar."
              : "This builder has not added a project yet."}
          </div>
        )}
      </section>
    </div>
  );
}
