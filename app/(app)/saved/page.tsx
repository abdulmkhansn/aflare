import type { Metadata } from "next";

import { SavedItemsList } from "@/components/bookmarks/saved-items-list";
import { pageTitle } from "@/lib/app/brand";
import { getSavedItems } from "@/lib/bookmarks/get-saved-items";
import { emptyStateClassName, pageTitleClassName } from "@/lib/ui/classes";
import { requireOnboarded } from "@/utils/auth/session";

export const metadata: Metadata = {
  title: pageTitle("Saved"),
};

export default async function SavedPage() {
  const auth = await requireOnboarded();
  const items = await getSavedItems(auth.userId);

  return (
    <div>
      <h1 className={pageTitleClassName}>Saved</h1>
      <p className="mt-1.5 text-sm text-fg-muted">
        Posts, flares, and articles you bookmarked to come back to.
      </p>

      <div className="mt-6">
        {items.length === 0 ? (
          <div className={emptyStateClassName}>
            Nothing saved yet. When you find a post, flare, or article worth revisiting, tap Save on
            it.
          </div>
        ) : (
          <SavedItemsList items={items} />
        )}
      </div>
    </div>
  );
}
