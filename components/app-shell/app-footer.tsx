import Link from "next/link";

import { AflareWordmark } from "@/components/aflare-wordmark";
import { DESCRIPTOR, TAGLINE } from "@/lib/app/brand";
import { focusRingClassName } from "@/lib/ui/classes";

type AppFooterProps = {
  userId: string;
};

export function AppFooter({ userId }: AppFooterProps) {
  return (
    <footer className="mt-10 border-t border-border-subtle pt-8 pb-2">
      <AflareWordmark variant="app" />
      <p className="mt-2 text-sm font-medium text-fg">{TAGLINE}</p>
      <p className="mt-1 text-sm text-fg-muted">{DESCRIPTOR}</p>
      <nav
        className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-fg-muted"
        aria-label="Footer"
      >
        <Link href="/blockers" className={`cursor-pointer hover:text-fg ${focusRingClassName}`}>
          Blockers
        </Link>
        <Link
          href={`/u/${userId}`}
          className={`cursor-pointer hover:text-fg ${focusRingClassName}`}
        >
          Profile
        </Link>
        <span>Terms</span>
        <span>Privacy</span>
      </nav>
    </footer>
  );
}
