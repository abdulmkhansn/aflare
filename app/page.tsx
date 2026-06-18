import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { FeedView } from "@/components/feed-view";
import { LandingPage, LANDING_SUBHEAD, LANDING_TAGLINE } from "@/components/marketing/landing-page";
import { PLATFORM_NAME, pageTitle } from "@/lib/app/brand";
import { getShellData } from "@/lib/app/get-shell-data";
import { getUnreadMessageCount } from "@/lib/messages/get-inbox";
import { getAuthState } from "@/utils/auth/session";

type HomePageProps = {
  searchParams: Promise<{
    posted?: string;
    error?: string;
    commentPosted?: string;
    commentError?: string;
    helpfulError?: string;
    limit?: string;
    filter?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const auth = await getAuthState();

  if (auth.status === "logged_out") {
    return {
      title: PLATFORM_NAME,
      description: `${LANDING_TAGLINE} ${LANDING_SUBHEAD}`,
    };
  }

  return {
    title: pageTitle("Feed"),
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const auth = await getAuthState();
  const params = await searchParams;

  if (auth.status === "logged_out") {
    return <LandingPage />;
  }

  if (auth.projectCount === 0) {
    redirect("/onboarding");
  }

  const [{ user, sidebar, buildJourney, recentNotifications, unreadNotificationCount }, unreadMessageCount] =
    await Promise.all([
      getShellData(auth.userId),
      getUnreadMessageCount(auth.userId),
    ]);

  return (
    <AppShell
      user={user}
      sidebar={sidebar}
      buildJourney={buildJourney}
      recentNotifications={recentNotifications}
      unreadNotificationCount={unreadNotificationCount}
      unreadMessageCount={unreadMessageCount}
    >
      <FeedView userId={auth.userId} searchParams={params} />
    </AppShell>
  );
}
