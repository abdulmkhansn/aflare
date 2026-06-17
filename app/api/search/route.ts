import { NextResponse } from "next/server";

import { hasQuickSearchResults, runQuickSearch } from "@/lib/search/run-quick-search";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      builders: [],
      projects: [],
      tags: [],
      hasResults: false,
    });
  }

  const results = await runQuickSearch(query);

  return NextResponse.json({
    ...results,
    hasResults: hasQuickSearchResults(results),
  });
}
