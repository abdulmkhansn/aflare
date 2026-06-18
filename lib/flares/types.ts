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
  edited_at: string | null;
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
  edited_at: string | null;
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
  edited_at,
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
  edited_at,
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

function normalizeFlareText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/[.?!…]+$/g, "");
}

function truncateFlareText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

/** True when body is empty or repeats the title without adding detail. */
export function flareBodyRedundantWithTitle(
  title: string | null | undefined,
  body: string | null | undefined
): boolean {
  const bodyTrimmed = body?.trim() ?? "";
  if (!bodyTrimmed) {
    return true;
  }

  const titleTrimmed = title?.trim() ?? "";
  if (!titleTrimmed) {
    return false;
  }

  const normTitle = normalizeFlareText(titleTrimmed);
  const normBody = normalizeFlareText(bodyTrimmed);

  if (normTitle === normBody) {
    return true;
  }

  if (normBody.startsWith(normTitle)) {
    const remainder = normBody.slice(normTitle.length).replace(/[^\w\s]/g, "").trim();
    if (!remainder) {
      return true;
    }
  }

  if (normTitle.startsWith(normBody)) {
    const remainder = normTitle.slice(normBody.length).replace(/[^\w\s]/g, "").trim();
    if (!remainder) {
      return true;
    }
  }

  return false;
}

/** One-line preview when only a single line is shown (e.g. sidebar). */
export function flareExcerpt(flare: FlareRow, maxLength = 140): string {
  const title = flare.title?.trim();
  const body = flare.body?.trim() ?? "";
  const source = title || body;

  return truncateFlareText(source, maxLength);
}

/**
 * Body preview for cards that already show the title.
 * Returns null when the body is empty or repeats the title.
 */
export function flareCardBodyExcerpt(flare: FlareRow, maxLength = 140): string | null {
  const title = flare.title?.trim();
  const body = flare.body?.trim() ?? "";

  if (!body || flareBodyRedundantWithTitle(title, body)) {
    return null;
  }

  return truncateFlareText(body, maxLength);
}
