import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { updateProject } from "@/app/(app)/actions/projects";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { pageTitle } from "@/lib/app/brand";
import { cardClassName } from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: EditProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("name").eq("id", id).maybeSingle();

  return {
    title: project?.name ? pageTitle(`Edit ${project.name}`) : pageTitle("Edit project"),
  };
}

export default async function EditProjectPage({ params, searchParams }: EditProjectPageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, owner_id, name, one_liner, stage, abstract_description")
    .eq("id", id)
    .maybeSingle();

  if (projectError || !project) {
    notFound();
  }

  if (project.owner_id !== auth.userId) {
    redirect(`/projects/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit project"
        description={`Update the public details for ${project.name}.`}
      />

      <div className={cardClassName}>
        <ProjectForm
          action={updateProject}
          submitLabel="Save project"
          projectId={project.id}
          error={error}
          initialValues={{
            name: project.name,
            oneLiner: project.one_liner,
            stage: project.stage,
            abstractDescription: project.abstract_description ?? "",
          }}
        />
      </div>
    </div>
  );
}
