const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export type GitHubPublicUserMetadata = {
  login: string;
  created_at: string;
  public_repos: number;
};

const BUILDING_EVENT_TYPES = new Set([
  "PushEvent",
  "CreateEvent",
  "PullRequestEvent",
  "IssuesEvent",
  "PublicEvent",
  "ReleaseEvent",
]);

export async function exchangeGitHubCodeForToken(
  code: string,
  redirectUri: string
): Promise<string> {
  const clientId = process.env.GITHUB_VERIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_VERIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("GitHub verification is not configured.");
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not connect to GitHub. Try again.");
  }

  const data = (await response.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    throw new Error(data.error || "GitHub did not return an access token.");
  }

  return data.access_token;
}

export async function fetchGitHubPublicUserMetadata(
  accessToken: string
): Promise<GitHubPublicUserMetadata> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      ...GITHUB_API_HEADERS,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not read your public GitHub profile. Try again.");
  }

  const data = (await response.json()) as {
    login?: string;
    created_at?: string;
    public_repos?: number;
  };

  if (!data.login || !data.created_at) {
    throw new Error("GitHub returned incomplete public profile data.");
  }

  return {
    login: data.login,
    created_at: data.created_at,
    public_repos: data.public_repos ?? 0,
  };
}

export async function hasPublicBuildingActivity(
  username: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=10`,
    {
      headers: {
        ...GITHUB_API_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return false;
  }

  const events = (await response.json()) as Array<{ type?: string }>;

  return events.some((event) => event.type && BUILDING_EVENT_TYPES.has(event.type));
}
