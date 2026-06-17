import type { Metadata } from "next";

import { createProject } from "@/app/(app)/actions/projects";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { pageTitle } from "@/lib/app/brand";
import { cardClassName } from "@/lib/ui/classes";

export const metadata: Metadata = {
  title: pageTitle("New project"),
};

type NewProjectPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New project"
        description="Add another build log. Keep shareable details public, secrets private."
      />

      <div className={cardClassName}>
        <ProjectForm action={createProject} submitLabel="Create project" error={error} />
      </div>
    </div>
  );
}
