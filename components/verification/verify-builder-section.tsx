import Link from "next/link";

import { disconnectGitHubVerification } from "@/app/(app)/actions/verification";
import { VerifiedBuilderBadge } from "@/components/verification/verified-builder-badge";
import {
  cardClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  sectionTitleClassName,
  statusTextClassName,
  textLinkClassName,
} from "@/lib/ui/classes";

type VerifyBuilderSectionProps = {
  verified: boolean;
  githubUsername: string | null;
  verifiedAt: string | null;
  returnTo: string;
  configured: boolean;
  verifiedMessage?: boolean;
  disconnectedMessage?: boolean;
  errorMessage?: string | null;
};

function formatVerifiedDate(iso: string | null): string | null {
  if (!iso) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function VerifyBuilderSection({
  verified,
  githubUsername,
  verifiedAt,
  returnTo,
  configured,
  verifiedMessage = false,
  disconnectedMessage = false,
  errorMessage = null,
}: VerifyBuilderSectionProps) {
  const verifiedDate = formatVerifiedDate(verifiedAt);
  const verifyHref = `/api/github/verify?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <section className={cardClassName}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={sectionTitleClassName}>Verified builder</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Optional trust signal. Unverified builders are full members here.
          </p>
        </div>
        {verified ? <VerifiedBuilderBadge /> : null}
      </div>

      {verifiedMessage ? (
        <p className={`mt-4 ${statusTextClassName}`} role="status">
          Verified. We only read public GitHub info. Never your code.
        </p>
      ) : null}

      {disconnectedMessage ? (
        <p className={`mt-4 ${statusTextClassName}`} role="status">
          GitHub disconnected. Your verified badge is off.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 text-sm text-fg" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {verified ? (
        <div className="mt-4 space-y-3 text-sm">
          {githubUsername ? (
            <p className="text-fg-muted">
              Connected as{" "}
              <a
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className={textLinkClassName}
              >
                @{githubUsername}
              </a>
              {verifiedDate ? ` · verified ${verifiedDate}` : null}
            </p>
          ) : null}
          <p className="leading-relaxed text-fg-muted">
            We stored public metadata only: username, account age, and public repo count. No code,
            no private repos.
          </p>
          <form action={disconnectGitHubVerification}>
            <input type="hidden" name="return_to" value={returnTo} />
            <button type="submit" className={secondaryButtonClassName}>
              Disconnect GitHub
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-fg-muted">
            Connect GitHub so we can confirm you build. We only read public info. Never your code.
            We don&apos;t post, and we don&apos;t touch private repos.
          </p>
          <ul className="space-y-2 text-sm text-fg-muted">
            <li>Public profile and account age</li>
            <li>Public repo count and recent public activity</li>
            <li>No file contents, no private access</li>
          </ul>
          {configured ? (
            <Link href={verifyHref} className={`inline-flex ${primaryButtonClassName}`}>
              Connect GitHub
            </Link>
          ) : (
            <p className="text-sm text-fg-muted">
              GitHub verification is not configured on this environment yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
