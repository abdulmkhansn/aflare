export function parseBatchLimit(raw: string | undefined): number {
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 20) {
    return 20;
  }

  return Math.min(Math.floor(parsed / 20) * 20, 200);
}

export function nextBatchLimit(currentLimit: number): number {
  return Math.min(currentLimit + 20, 200);
}

export function buildShowMoreHref(
  pathname: string,
  currentLimit: number,
  searchParams: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "limit") {
      params.set(key, value);
    }
  }

  params.set("limit", String(nextBatchLimit(currentLimit)));

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}
