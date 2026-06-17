import { createClient } from "@/utils/supabase/server";

import { toIlikePattern } from "./escape-ilike";

const QUICK_LIMIT = 5;

export type QuickSearchResults = {
  builders: { id: string; displayName: string | null }[];
  projects: { id: string; name: string; oneLiner: string }[];
  tags: { id: string; label: string }[];
};

export async function runQuickSearch(query: string): Promise<QuickSearchResults> {
  const supabase = await createClient();
  const pattern = toIlikePattern(query);

  const [buildersRes, projectsRes, tagsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name")
      .ilike("display_name", pattern)
      .order("display_name")
      .limit(QUICK_LIMIT),
    supabase
      .from("projects")
      .select("id, name, one_liner")
      .or(`name.ilike.${pattern},one_liner.ilike.${pattern}`)
      .order("name")
      .limit(QUICK_LIMIT),
    supabase
      .from("tags")
      .select("id, label")
      .ilike("label", pattern)
      .order("label")
      .limit(QUICK_LIMIT),
  ]);

  if (buildersRes.error) {
    throw new Error(buildersRes.error.message);
  }

  if (projectsRes.error) {
    throw new Error(projectsRes.error.message);
  }

  if (tagsRes.error) {
    throw new Error(tagsRes.error.message);
  }

  return {
    builders: (buildersRes.data ?? []).map((row) => ({
      id: row.id,
      displayName: row.display_name,
    })),
    projects: (projectsRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      oneLiner: row.one_liner,
    })),
    tags: (tagsRes.data ?? []).map((row) => ({
      id: row.id,
      label: row.label,
    })),
  };
}

export function hasQuickSearchResults(results: QuickSearchResults): boolean {
  return results.builders.length > 0 || results.projects.length > 0 || results.tags.length > 0;
}
