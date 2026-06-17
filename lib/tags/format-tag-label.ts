export function formatTagLabel(label: string): string {
  const normalized = label.trim().replace(/_/g, " ");

  if (!normalized) {
    return normalized;
  }

  const lower = normalized.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
