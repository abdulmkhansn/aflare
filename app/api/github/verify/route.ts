import { NextResponse } from "next/server";

import {
  githubAuthorizeUrl,
  isGitHubVerifyConfigured,
} from "@/lib/github/verify-config";
import { createVerifyOAuthState } from "@/lib/github/oauth-state";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const returnToRaw = searchParams.get("returnTo") ?? "/settings";
  const returnTo =
    returnToRaw.startsWith("/") && !returnToRaw.startsWith("//") ? returnToRaw : "/settings";

  if (!isGitHubVerifyConfigured()) {
    return NextResponse.redirect(
      `${origin}${returnTo}?verify_error=${encodeURIComponent("GitHub verification is not set up yet. Check back soon.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Sign in first.")}`);
  }

  const state = createVerifyOAuthState(user.id, returnTo);
  const authorizeUrl = githubAuthorizeUrl(origin, state);

  return NextResponse.redirect(authorizeUrl);
}
