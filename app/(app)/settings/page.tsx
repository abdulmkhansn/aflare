import type { Metadata } from "next";
import Link from "next/link";

import { DeleteAccountSection } from "@/components/settings/delete-account-section";
import { ThemePreference } from "@/components/settings/theme-preference";
import { VerifyBuilderSection } from "@/components/verification/verify-builder-section";
import { pageTitle } from "@/lib/app/brand";
import { isGitHubVerifyConfigured } from "@/lib/github/verify-config";
import {
  cardClassName,
  errorTextClassName,
  pageSubtitleClassName,
  pageTitleClassName,
  sectionTitleClassName,
  textLinkClassName,
} from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: pageTitle("Settings"),
};

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    verified?: string;
    disconnected?: string;
    verify_error?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const auth = await requireOnboarded();
  const { error, verified, disconnected, verify_error: verifyError } = await searchParams;
  const supabase = await createClient();

  const [{ data: authUser }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select(
        "display_name, verified_builder, github_username, verified_at"
      )
      .eq("id", auth.userId)
      .maybeSingle(),
  ]);

  const email = authUser.user?.email ?? "";
  const displayName = profile?.display_name?.trim() || "Your profile";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className={pageTitleClassName}>Settings</h1>
        <p className={pageSubtitleClassName}>
          Account details and how Aflare looks for you.
        </p>
      </header>

      {error ? (
        <p className={errorTextClassName} role="alert">
          {error}
        </p>
      ) : null}

      <section className={cardClassName}>
        <h2 className={sectionTitleClassName}>Account</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-fg-muted">Email</dt>
            <dd className="mt-1 text-fg">{email || "No email on file"}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Display name</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-fg">{displayName}</span>
              <Link href={`/u/${auth.userId}/edit`} className={textLinkClassName}>
                Edit profile
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      <section className={cardClassName}>
        <h2 className={sectionTitleClassName}>Appearance</h2>
        <p className="mt-1 text-sm text-fg-muted">Choose light or dark. We remember your pick.</p>
        <div className="mt-4">
          <ThemePreference variant="settings" />
        </div>
      </section>

      <section className={cardClassName}>
        <h2 className={sectionTitleClassName}>Notifications</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Email alerts are not wired up yet. In-app notifications still work.
        </p>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center justify-between gap-4 text-sm">
            <span className="text-fg">Email notifications</span>
            <span className="text-fg-muted">Coming soon</span>
          </li>
          <li className="flex items-center justify-between gap-4 text-sm">
            <span className="text-fg">Weekly digest</span>
            <span className="text-fg-muted">Coming soon</span>
          </li>
        </ul>
      </section>

      <VerifyBuilderSection
        verified={Boolean(profile?.verified_builder)}
        githubUsername={profile?.github_username ?? null}
        verifiedAt={profile?.verified_at ?? null}
        returnTo="/settings"
        configured={isGitHubVerifyConfigured()}
        verifiedMessage={verified === "1"}
        disconnectedMessage={disconnected === "1"}
        errorMessage={verifyError ?? null}
      />

      <div className="space-y-3 border-t border-border-subtle pt-8">
        <h2 className={sectionTitleClassName}>Danger zone</h2>
        <p className="text-sm text-fg-muted">
          Permanent actions for your account. Take your time here.
        </p>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
