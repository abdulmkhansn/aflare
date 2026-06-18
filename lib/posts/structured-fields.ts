export type PostStructuredFields = {
  image_url?: string;
  video_url?: string;
  video_embed_url?: string;
  link_url?: string;
  link_label?: string;
  repost?: boolean;
  boost?: boolean;
};

export function parseStructuredFields(raw: unknown): PostStructuredFields {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const record = raw as Record<string, unknown>;

  return {
    image_url: readString(record.image_url),
    video_url: readString(record.video_url),
    video_embed_url: readString(record.video_embed_url),
    link_url: readString(record.link_url),
    link_label: readString(record.link_label),
    repost: record.repost === true ? true : undefined,
    boost: record.boost === true ? true : undefined,
  };
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

export function hasStructuredMedia(fields: PostStructuredFields): boolean {
  return Boolean(
    fields.image_url || fields.video_url || fields.video_embed_url || fields.link_url
  );
}

export function resolveVideoUrl(fields: PostStructuredFields): string | undefined {
  return fields.video_url ?? fields.video_embed_url;
}
