import {
  buildMentionToken,
  mentionTokenRegex,
  normalizeMentionBody,
} from "@/lib/mentions/parse-mentions";

export type MentionSpan = {
  userId: string;
  displayName: string;
  start: number;
  end: number;
};

export type TextEdit = {
  start: number;
  removedLength: number;
  insertedLength: number;
};

export function mentionDisplayLabel(displayName: string): string {
  return `@${displayName.trim() || "Unknown builder"}`;
}

export function storageToComposeDisplay(storage: string): { text: string; spans: MentionSpan[] } {
  const normalized = normalizeMentionBody(storage);
  const spans: MentionSpan[] = [];
  let text = "";
  let lastIndex = 0;
  const pattern = mentionTokenRegex();

  for (const match of normalized.matchAll(pattern)) {
    const index = match.index ?? 0;
    text += normalized.slice(lastIndex, index);

    const displayName = match[1].trim() || "Unknown builder";
    const label = mentionDisplayLabel(displayName);
    const start = text.length;

    text += label;
    spans.push({
      userId: match[2],
      displayName,
      start,
      end: start + label.length,
    });

    lastIndex = index + match[0].length;
  }

  text += normalized.slice(lastIndex);

  return { text, spans };
}

export function composeDisplayToStorage(text: string, spans: MentionSpan[]): string {
  const validSpans = spans
    .filter((span) => text.slice(span.start, span.end) === mentionDisplayLabel(span.displayName))
    .sort((a, b) => b.start - a.start);

  let result = text;

  for (const span of validSpans) {
    const token = buildMentionToken(span.displayName, span.userId);
    result = result.slice(0, span.start) + token + result.slice(span.end);
  }

  return result;
}

export function findTextEdit(oldText: string, newText: string): TextEdit {
  let start = 0;

  while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
    start += 1;
  }

  let oldEnd = oldText.length;
  let newEnd = newText.length;

  while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
    oldEnd -= 1;
    newEnd -= 1;
  }

  return {
    start,
    removedLength: oldEnd - start,
    insertedLength: newEnd - start,
  };
}

export function reconcileSpansAfterEdit(spans: MentionSpan[], edit: TextEdit): MentionSpan[] {
  const editEnd = edit.start + edit.removedLength;
  const delta = edit.insertedLength - edit.removedLength;

  return spans
    .filter((span) => span.end <= edit.start || span.start >= editEnd)
    .map((span) => {
      if (span.start >= editEnd) {
        return {
          ...span,
          start: span.start + delta,
          end: span.end + delta,
        };
      }

      return span;
    });
}

export function validateMentionSpans(text: string, spans: MentionSpan[]): MentionSpan[] {
  return spans.filter(
    (span) => text.slice(span.start, span.end) === mentionDisplayLabel(span.displayName)
  );
}

export function insertMentionInCompose(
  text: string,
  spans: MentionSpan[],
  mentionStart: number,
  cursor: number,
  displayName: string,
  userId: string
): { text: string; spans: MentionSpan[]; nextCursor: number } {
  const safeName = displayName.trim() || "Unknown builder";
  const label = mentionDisplayLabel(safeName);
  const editEnd = cursor;
  const delta = label.length + 1 - (editEnd - mentionStart);

  const keptSpans = spans
    .filter((span) => span.end <= mentionStart || span.start >= editEnd)
    .map((span) =>
      span.start >= editEnd
        ? { ...span, start: span.start + delta, end: span.end + delta }
        : span
    );

  const newText = `${text.slice(0, mentionStart)}${label} ${text.slice(editEnd)}`;
  const newSpan: MentionSpan = {
    userId,
    displayName: safeName,
    start: mentionStart,
    end: mentionStart + label.length,
  };

  return {
    text: newText,
    spans: [...keptSpans, newSpan].sort((a, b) => a.start - b.start),
    nextCursor: mentionStart + label.length + 1,
  };
}

export function isCursorInMentionSpan(cursor: number, spans: MentionSpan[]): boolean {
  return spans.some((span) => cursor > span.start && cursor <= span.end);
}

export function segmentComposeDisplay(
  text: string,
  spans: MentionSpan[]
): Array<{ type: "text"; value: string } | { type: "mention"; displayName: string }> {
  const validSpans = validateMentionSpans(text, spans).sort((a, b) => a.start - b.start);
  const segments: Array<{ type: "text"; value: string } | { type: "mention"; displayName: string }> =
    [];
  let lastIndex = 0;

  for (const span of validSpans) {
    if (span.start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, span.start) });
    }

    segments.push({ type: "mention", displayName: span.displayName });
    lastIndex = span.end;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
