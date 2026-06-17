import { FACET_LABELS } from "@/lib/milestones/constants";
import type { ContributionFacets } from "@/lib/recognition/get-profile-recognition";
import { cardClassName } from "@/lib/ui/classes";

type ContributionFacetsProps = {
  facets: ContributionFacets;
};

export function ContributionFacets({ facets }: ContributionFacetsProps) {
  const items = [
    { title: FACET_LABELS.helped, body: facets.helped },
    { title: FACET_LABELS.building, body: facets.building },
    { title: FACET_LABELS.showingUp, body: facets.showingUp },
  ];

  return (
    <section aria-label="Contribution">
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className={`${cardClassName} flex flex-col justify-between gap-2 py-4`}
          >
            <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
              {item.title}
            </h2>
            <p className="text-sm leading-relaxed text-fg">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
