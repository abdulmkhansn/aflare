const ILIKE_ESCAPE = /[%_\\]/g;

export function toIlikePattern(query: string): string {
  const escaped = query.replace(ILIKE_ESCAPE, (char) => `\\${char}`);
  return `%${escaped}%`;
}
