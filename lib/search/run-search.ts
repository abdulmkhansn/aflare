import { createClient } from "@/utils/supabase/server";

import { toIlikePattern } from "./escape-ilike";

const RESULT_LIMIT = 20;

export type SearchBuilderResult = {
  id: string;
  displayName: string | null;
};

export type SearchProjectResult = {
  id: string;
  name: string;
  oneLiner: string;
};

export type SearchTagResult = {
  id: string;
  label: string;
  projects: { id: string; name: string }[];
  profiles: { id: string; displayName: string | null }[];
};

export type SearchResults = {
  builders: SearchBuilderResult[];
  projects: SearchProjectResult[];
  tags: SearchTagResult[];
};

export async function runSearch(query: string): Promise<SearchResults> {
  const supabase = await createClient();
  const pattern = toIlikePattern(query);

  const [buildersRes, projectsRes, tagsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name")
      .ilike("display_name", pattern)
      .order("display_name")
      .limit(RESULT_LIMIT),
    supabase
      .from("projects")
      .select("id, name, one_liner")
      .or(`name.ilike.${pattern},one_liner.ilike.${pattern}`)
      .order("name")
      .limit(RESULT_LIMIT),
    supabase
      .from("tags")
      .select("id, label")
      .ilike("label", pattern)
      .order("label")
      .limit(RESULT_LIMIT),
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

  const matchedTags = tagsRes.data ?? [];
  const tagIds = matchedTags.map((tag) => tag.id);

  const projectsByTagId = new Map<string, { id: string; name: string }[]>();
  const profilesByTagId = new Map<string, { id: string; displayName: string | null }[]>();

  if (tagIds.length > 0) {
    const [projectTagsRes, profileTagsRes] = await Promise.all([
      supabase
        .from("project_tags")
        .select("tag_id, projects:project_id ( id, name )")
        .in("tag_id", tagIds),
      supabase
        .from("profile_tags")
        .select("tag_id, profiles:profile_id ( id, display_name )")
        .in("tag_id", tagIds),
    ]);

    if (projectTagsRes.error) {
      throw new Error(projectTagsRes.error.message);
    }

    if (profileTagsRes.error) {
      throw new Error(profileTagsRes.error.message);
    }

    for (const row of projectTagsRes.data ?? []) {
      const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;

      if (!project) {
        continue;
      }

      const list = projectsByTagId.get(row.tag_id) ?? [];

      if (!list.some((item) => item.id === project.id)) {
        list.push({ id: project.id, name: project.name });
      }

      projectsByTagId.set(row.tag_id, list);
    }

    for (const row of profileTagsRes.data ?? []) {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

      if (!profile) {
        continue;
      }

      const list = profilesByTagId.get(row.tag_id) ?? [];

      if (!list.some((item) => item.id === profile.id)) {
        list.push({ id: profile.id, displayName: profile.display_name });
      }

      profilesByTagId.set(row.tag_id, list);
    }
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
    tags: matchedTags.map((tag) => ({
      id: tag.id,
      label: tag.label,
      projects: (projectsByTagId.get(tag.id) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
      profiles: (profilesByTagId.get(tag.id) ?? []).sort((a, b) =>
        (a.displayName ?? "").localeCompare(b.displayName ?? "")
      ),
    })),
  };
}

export function hasSearchResults(results: SearchResults): boolean {
  return results.builders.length > 0 || results.projects.length > 0 || results.tags.length > 0;
}
