import { NextResponse } from "next/server";

import {
  exchangeGitHubCodeForToken,
  fetchGitHubPublicUserMetadata,
  hasPublicBuildingActivity,
} from "@/lib/github/fetch-public-metadata";
import { parseVerifyOAuthState } from "@/lib/github/oauth-state";
import { evaluateGitHubVerification } from "@/lib/github/verify-checks";
import {
  githubVerifyCallbackUrl,
  isGitHubVerifyConfigured,
} from "@/lib/github/verify-config";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");

  const fallbackReturnTo = "/settings";

  if (oauthError) {
    const message =
      oauthDescription?.trim() ||
      "GitHub connection was cancelled. Your account was not verified.";
    return NextResponse.redirect(
      `${origin}${fallbackReturnTo}?verify_error=${encodeURIComponent(message)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${origin}${fallbackReturnTo}?verify_error=${encodeURIComponent("Verification did not finish. Try again.")}`
    );
  }

  if (!isGitHubVerifyConfigured()) {
    return NextResponse.redirect(
      `${origin}${fallbackReturnTo}?verify_error=${encodeURIComponent("GitHub verification is not set up yet.")}`
    );
  }

  const parsedState = parseVerifyOAuthState(state);

  if (!parsedState) {
    return NextResponse.redirect(
      `${origin}${fallbackReturnTo}?verify_error=${encodeURIComponent("Verification session expired. Try again.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== parsedState.userId) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Sign in to finish verification.")}`
    );
  }

  const returnTo = parsedState.returnTo;

  try {
    const redirectUri = githubVerifyCallbackUrl(origin);
    const accessToken = await exchangeGitHubCodeForToken(code, redirectUri);
    const metadata = await fetchGitHubPublicUserMetadata(accessToken);
    const publicActivity = await hasPublicBuildingActivity(metadata.login, accessToken);
    const evaluation = evaluateGitHubVerification(metadata, publicActivity);

    if (!evaluation.ok) {
      return NextResponse.redirect(
        `${origin}${returnTo}?verify_error=${encodeURIComponent(evaluation.message)}`
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verified_builder: true,
        github_username: evaluation.metadata.login,
        verified_at: new Date().toISOString(),
        github_public_repo_count: evaluation.metadata.public_repos,
        github_account_created_at: evaluation.metadata.created_at,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.redirect(
        `${origin}${returnTo}?verify_error=${encodeURIComponent(updateError.message)}`
      );
    }

    return NextResponse.redirect(`${origin}${returnTo}?verified=1`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed. Try again.";
    return NextResponse.redirect(
      `${origin}${returnTo}?verify_error=${encodeURIComponent(message)}`
    );
  }
}
