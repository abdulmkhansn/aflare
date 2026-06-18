export const MENTION_TOKEN_PATTERN =
  /@\[([^\]]+)\]\(([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\)/;

/** @deprecated Use mentionTokenRegex() — shared global regex can retain lastIndex between calls. */
export const MENTION_TOKEN_REGEX = new RegExp(MENTION_TOKEN_PATTERN.source, "gi");

export type MentionBodySegment =
  | { type: "text"; value: string }
  | { type: "mention"; displayName: string; userId: string };

export function mentionTokenRegex(): RegExp {
  return new RegExp(MENTION_TOKEN_PATTERN.source, "gi");
}

export function normalizeMentionBody(body: unknown): string {
  if (typeof body !== "string") {
    return "";
  }

  return body;
}

export function buildMentionToken(displayName: string, userId: string): string {
  const safeName = displayName.replace(/]/g, "").trim() || "Unknown builder";
  return `@[${safeName}](${userId})`;
}

export function extractMentionedUserIds(body: string): string[] {
  const ids: string[] = [];
  const pattern = mentionTokenRegex();

  for (const match of normalizeMentionBody(body).matchAll(pattern)) {
    ids.push(match[2]);
  }

  return ids;
}

export function mentionPlainText(body: string): string {
  return normalizeMentionBody(body).replace(mentionTokenRegex(), "$1");
}

export function segmentMentionBody(body: unknown): MentionBodySegment[] {
  const text = normalizeMentionBody(body);

  if (!text) {
    return [];
  }

  const segments: MentionBodySegment[] = [];
  const pattern = mentionTokenRegex();
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    segments.push({
      type: "mention",
      displayName: match[1].trim() || "Unknown builder",
      userId: match[2],
    });

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

export function hasMentionTokens(body: unknown): boolean {
  return mentionTokenRegex().test(normalizeMentionBody(body));
}
