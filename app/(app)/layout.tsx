import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { PLATFORM_NAME } from "@/lib/app/brand";
import { getShellData } from "@/lib/app/get-shell-data";
import { getUnreadMessageCount } from "@/lib/messages/get-inbox";
import { getUncelebratedMilestones } from "@/lib/milestones/record-milestone";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: PLATFORM_NAME,
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await requireOnboarded();
  const supabase = await createClient();
  const [{ user, sidebar }, unreadMessageCount, pendingMilestones] = await Promise.all([
    getShellData(auth.userId),
    getUnreadMessageCount(auth.userId),
    getUncelebratedMilestones(supabase, auth.userId),
  ]);

  return (
    <AppShell
      user={user}
      sidebar={sidebar}
      unreadMessageCount={unreadMessageCount}
      pendingMilestones={pendingMilestones}
    >
      {children}
    </AppShell>
  );
}
