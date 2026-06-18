export const GITHUB_VERIFY_SCOPE = "read:user";

export const GITHUB_VERIFY_COOKIE = "github_verify_oauth";

export const GITHUB_VERIFY_MIN_ACCOUNT_AGE_DAYS = Number(
  process.env.GITHUB_VERIFY_MIN_ACCOUNT_AGE_DAYS ?? "7"
);

export function getGitHubVerifyClientId(): string | null {
  return process.env.GITHUB_VERIFY_CLIENT_ID?.trim() || null;
}

export function getGitHubVerifyClientSecret(): string | null {
  return process.env.GITHUB_VERIFY_CLIENT_SECRET?.trim() || null;
}

export function isGitHubVerifyConfigured(): boolean {
  return Boolean(getGitHubVerifyClientId() && getGitHubVerifyClientSecret());
}

export function githubVerifyCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/github/verify/callback`;
}

export function githubAuthorizeUrl(origin: string, state: string): string {
  const clientId = getGitHubVerifyClientId();
  if (!clientId) {
    throw new Error("GitHub verification is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: githubVerifyCallbackUrl(origin),
    scope: GITHUB_VERIFY_SCOPE,
    state,
    allow_signup: "true",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
