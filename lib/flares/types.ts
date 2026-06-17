import type { PostStructuredFields } from "@/lib/posts/structured-fields";

export const FLARE_STATUSES = ["open", "being_helped", "resolved"] as const;

export type FlareStatus = (typeof FLARE_STATUSES)[number];

export type FlareTag = {
  tag_id: string;
  tags:
    | { id: string; label: string }
    | { id: string; label: string }[]
    | null;
};

export type FlareHelperProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

export type FlareHelper = {
  user_id: string;
  joined_at: string;
  profiles: FlareHelperProfile | FlareHelperProfile[] | null;
};

export type FlareAuthorProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

export type FlareRow = {
  id: string;
  author_id: string;
  title: string | null;
  body: string;
  status: FlareStatus;
  tried: string | null;
  ruled_out: string | null;
  current_status: string | null;
  resolution_note: string | null;
  structured_fields: PostStructuredFields | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  profiles: FlareAuthorProfile | FlareAuthorProfile[] | null;
  flare_tags: FlareTag[] | null;
  flare_helpers: FlareHelper[] | null;
};

export type FlareListItem = FlareRow;

export type FlareCommentProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

export type FlareComment = {
  id: string;
  flare_id: string;
  author_id: string;
  body: string;
  helpful_count: number;
  created_at: string;
  profiles: FlareCommentProfile | FlareCommentProfile[] | null;
};

export const FLARE_SELECT = `
  id,
  author_id,
  title,
  body,
  status,
  tried,
  ruled_out,
  current_status,
  resolution_note,
  structured_fields,
  created_at,
  updated_at,
  resolved_at,
  profiles:author_id ( display_name, avatar_url ),
  flare_tags ( tag_id, tags ( id, label ) ),
  flare_helpers ( user_id, joined_at, profiles:user_id ( display_name, avatar_url ) )
`;

export const FLARE_COMMENT_SELECT = `
  id,
  flare_id,
  author_id,
  body,
  helpful_count,
  created_at,
  profiles:author_id ( display_name, avatar_url )
`;

export function resolveFlareAuthor(flare: FlareRow) {
  return Array.isArray(flare.profiles) ? flare.profiles[0] : flare.profiles;
}

export function resolveFlareHelpers(flare: FlareRow): FlareHelper[] {
  return flare.flare_helpers ?? [];
}

export function resolveFlareTags(flare: FlareRow) {
  return (flare.flare_tags ?? []).flatMap((row) => {
    const tag = Array.isArray(row.tags) ? row.tags[0] : row.tags;
    return tag ? [tag] : [];
  });
}

export function resolveFlareCommentProfile(comment: FlareComment) {
  return Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
}

export function flareExcerpt(flare: FlareRow, maxLength = 140): string {
  const source = flare.title?.trim() || flare.body.trim();
  const normalized = source.replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}
