import { notFound, redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile-edit-form";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

type ProfileEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; avatar?: string; error?: string }>;
};

export default async function ProfileEditPage({ params, searchParams }: ProfileEditPageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const query = await searchParams;

  if (auth.userId !== id) {
    redirect(`/u/${id}`);
  }

  const supabase = await createClient();

  const [{ data: profile }, { data: tags }, { data: profileTags }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_url")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("tags").select("id, label").order("label"),
    supabase.from("profile_tags").select("kind, tag_id").eq("profile_id", id),
  ]);

  if (!profile) {
    notFound();
  }

  const selectedBrings =
    profileTags?.filter((row) => row.kind === "brings").map((row) => row.tag_id) ?? [];
  const selectedOpenTo =
    profileTags?.filter((row) => row.kind === "open_to").map((row) => row.tag_id) ?? [];

  return (
    <ProfileEditForm
      userId={id}
      displayName={profile.display_name?.trim() || ""}
      bio={profile.bio?.trim() || ""}
      avatarUrl={profile.avatar_url}
      tags={tags ?? []}
      selectedBrings={selectedBrings}
      selectedOpenTo={selectedOpenTo}
      saved={query.saved === "1"}
      avatarSaved={query.avatar === "1"}
      error={query.error}
    />
  );
}
