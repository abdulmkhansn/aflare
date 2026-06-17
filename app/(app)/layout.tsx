import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { PLATFORM_NAME } from "@/lib/app/brand";
import { getShellData } from "@/lib/app/get-shell-data";
import { getUnreadMessageCount } from "@/lib/messages/get-inbox";
import { requireOnboarded } from "@/utils/auth/session";

export const metadata: Metadata = {
  title: PLATFORM_NAME,
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await requireOnboarded();
  const [{ user, sidebar }, unreadMessageCount] = await Promise.all([
    getShellData(auth.userId),
    getUnreadMessageCount(auth.userId),
  ]);

  return (
    <AppShell user={user} sidebar={sidebar} unreadMessageCount={unreadMessageCount}>
      {children}
    </AppShell>
  );
}
