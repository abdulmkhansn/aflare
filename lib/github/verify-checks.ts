import type { GitHubPublicUserMetadata } from "@/lib/github/fetch-public-metadata";
import { GITHUB_VERIFY_MIN_ACCOUNT_AGE_DAYS } from "@/lib/github/verify-config";

export type VerificationEvaluation =
  | { ok: true; metadata: GitHubPublicUserMetadata }
  | { ok: false; message: string };

function minAccountAgeMs(): number {
  return GITHUB_VERIFY_MIN_ACCOUNT_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function evaluateGitHubVerification(
  metadata: GitHubPublicUserMetadata,
  hasPublicActivity: boolean
): VerificationEvaluation {
  const accountAgeMs = Date.now() - new Date(metadata.created_at).getTime();
  const isBrandNew = accountAgeMs < minAccountAgeMs();
  const hasPublicRepos = metadata.public_repos > 0;
  const hasBuildingSignals = hasPublicRepos || hasPublicActivity;

  if (!hasBuildingSignals) {
    return {
      ok: false,
      message:
        "We couldn't find public repos or recent public activity on GitHub. Make something visible there first, then try again.",
    };
  }

  if (isBrandNew && !hasBuildingSignals) {
    return {
      ok: false,
      message:
        "Your GitHub account looks brand new, with no public building activity yet. Ship something public first, then try again.",
    };
  }

  return { ok: true, metadata };
}
