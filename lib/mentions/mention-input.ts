import { buildMentionToken } from "./parse-mentions";

export type ActiveMentionQuery = {
  start: number;
  query: string;
};

export function getActiveMentionQuery(
  text: string,
  cursor: number
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

  return { start: lastAt, query: match[1] };
}

export function insertMentionAt(
  text: string,
  mentionStart: number,
  cursor: number,
  displayName: string,
  userId: string
): { nextValue: string; nextCursor: number } {
  const token = buildMentionToken(displayName, userId);
  const nextValue = `${text.slice(0, mentionStart)}${token} ${text.slice(cursor)}`;
  const nextCursor = mentionStart + token.length + 1;

  return { nextValue, nextCursor };
}
