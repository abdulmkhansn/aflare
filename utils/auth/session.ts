import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export type ProfileSummary = {
  id: string;
  display_name: string | null;
  bio: string | null;
};

export type AuthState =
  | { status: "logged_out" }
  | {
      status: "logged_in";
      userId: string;
      profile: ProfileSummary | null;
      projectCount: number;
    };

export async function getAuthState(): Promise<AuthState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "logged_out" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  const { count, error: countError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    status: "logged_in",
    userId: user.id,
    profile,
    projectCount: count ?? 0,
  };
}

export function isOnboarded(state: Extract<AuthState, { status: "logged_in" }>) {
  return state.projectCount > 0;
}

export async function requireAuth() {
  const state = await getAuthState();

  if (state.status === "logged_out") {
    redirect("/login");
  }

  return state;
}

export async function requireOnboarded() {
  const state = await requireAuth();

  if (!isOnboarded(state)) {
    redirect("/onboarding");
  }

  return state;
}

export function parseOnboardingStep(raw: string | undefined): 1 | 2 | 3 {
  const step = Number(raw);

  if (step === 2 || step === 3) {
    return step;
  }

  return 1;
}
