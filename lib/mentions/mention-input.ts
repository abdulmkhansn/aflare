import {
  insertMentionInCompose,
  mentionDisplayLabel,
  type MentionSpan,
} from "./compose-mentions";

export type ActiveMentionQuery = {
  start: number;
  query: string;
};

export function getActiveMentionQuery(
  text: string,
  cursor: number,
  spans: MentionSpan[] = []
): ActiveMentionQuery | null {
  if (cursor < 0) {
    return null;
  }

  const before = text.slice(0, cursor);
  const lastAt = before.lastIndexOf("@");

  if (lastAt === -1) {
    return null;
  }

  const afterAt = before.slice(lastAt + 1);

  if (afterAt.startsWith("[")) {
    return null;
  }

  const match = afterAt.match(/^([^\s@[\]()]*)/);

  if (!match) {
    return null;
  }

  const insideExistingMention = spans.some(
    (span) => lastAt >= span.start && lastAt < span.end
  );

  if (insideExistingMention) {
    return null;
  }

  return { start: lastAt, query: match[1] };
}

/** @deprecated Prefer insertMentionInCompose — inserts storage tokens into plain text. */
export function insertMentionAt(
  text: string,
  mentionStart: number,
  cursor: number,
  displayName: string,
  userId: string
): { nextValue: string; nextCursor: number } {
  const { text: nextText, nextCursor } = insertMentionInCompose(
    text,
    [],
    mentionStart,
    cursor,
    displayName,
    userId
  );

  return { nextValue: nextText, nextCursor };
}

export { insertMentionInCompose, mentionDisplayLabel };
