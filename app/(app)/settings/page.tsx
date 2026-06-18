import type { Metadata } from "next";

import { pageTitle } from "@/lib/app/brand";
import { emptyStateClassName, pageTitleClassName } from "@/lib/ui/classes";

export const metadata: Metadata = {
  title: pageTitle("Settings"),
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className={pageTitleClassName}>Settings</h1>
      <p className="mt-1.5 text-sm text-fg-muted">
        Account and app preferences will live here. Nothing to change yet.
      </p>

      <div className={`mt-6 ${emptyStateClassName}`}>
        Settings are on the way. For now, edit your profile from the menu in the top bar.
      </div>
    </div>
  );
}
