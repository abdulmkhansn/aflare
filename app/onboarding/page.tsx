import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { pageTitle } from "@/lib/app/brand";
import { parseOnboardingStep, requireAuth } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

import { StepOne } from "./step-one";
import { StepThree } from "./step-three";
import { StepTwo } from "./step-two";

export const metadata: Metadata = {
  title: pageTitle("Set up your profile"),
};

type OnboardingPageProps = {
  searchParams: Promise<{ step?: string; error?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const auth = await requireAuth();
  const params = await searchParams;
  const step = parseOnboardingStep(params.step);
  const hasProject = auth.projectCount > 0;

  if (!hasProject && step > 1) {
    redirect("/onboarding?step=1");
  }

  if (hasProject && step === 1) {
    redirect("/");
  }

  const supabase = await createClient();

  if (step === 1) {
    return (
      <StepOne
        displayName={auth.profile?.display_name ?? ""}
        bio={auth.profile?.bio ?? ""}
        error={params.error}
      />
    );
  }

  if (step === 2) {
    const [{ data: tags, error: tagsError }, { data: profileTags, error: profileTagsError }] =
      await Promise.all([
        supabase.from("tags").select("id, label").order("label"),
        supabase
          .from("profile_tags")
          .select("tag_id, kind")
          .eq("profile_id", auth.userId),
      ]);

    if (tagsError || profileTagsError) {
      return (
        <StepTwo
          tags={[]}
          selectedBrings={[]}
          selectedOpenTo={[]}
          error={
            params.error ??
            tagsError?.message ??
            profileTagsError?.message ??
            "Could not load tags. Refresh the page."
          }
        />
      );
    }

    const selectedBrings =
      profileTags?.filter((row) => row.kind === "brings").map((row) => row.tag_id) ?? [];
    const selectedOpenTo =
      profileTags?.filter((row) => row.kind === "open_to").map((row) => row.tag_id) ?? [];

    return (
      <StepTwo
        tags={tags ?? []}
        selectedBrings={selectedBrings}
        selectedOpenTo={selectedOpenTo}
        error={params.error}
      />
    );
  }

  return <StepThree />;
}
