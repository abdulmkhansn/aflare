import { redirect } from "next/navigation";

type BlockersRedirectProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function BlockersRedirectPage({ searchParams }: BlockersRedirectProps) {
  const params = await searchParams;
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      next.set(key, value);
    }
  }

  const query = next.toString();
  redirect(query ? `/flarespace?${query}` : "/flarespace");
}
