import {
  ErrorBanner,
  OnboardingShell,
  primaryButtonClassName,
} from "./onboarding-shell";
import { saveProfileTags } from "./actions";
import { formatTagLabel } from "@/lib/tags/format-tag-label";

export type TagOption = {
  id: string;
  label: string;
};

type StepTwoProps = {
  tags: TagOption[];
  selectedBrings: string[];
  selectedOpenTo: string[];
  error?: string;
};

function TagGroup({
  title,
  helper,
  name,
  tags,
  selected,
}: {
  title: string;
  helper: string;
  name: "brings" | "open_to";
  tags: TagOption[];
  selected: string[];
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-charcoal">{title}</legend>
      <p className="text-sm text-charcoal/70">{helper}</p>

      {tags.length === 0 ? (
        <p className="text-sm text-charcoal/60">
          No tags are available yet. Continue and you can add these later from your profile.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {tags.map((tag) => (
            <li key={`${name}-${tag.id}`}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-charcoal/10 bg-white px-3 py-2 text-sm text-charcoal transition-colors hover:border-charcoal/20 has-checked:border-ember/40 has-checked:bg-ember/5">
                <input
                  type="checkbox"
                  name={name}
                  value={tag.id}
                  defaultChecked={selected.includes(tag.id)}
                  className="h-4 w-4 rounded border-charcoal/20 text-ember focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
                />
                {formatTagLabel(tag.label)}
              </label>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

export function StepTwo({ tags, selectedBrings, selectedOpenTo, error }: StepTwoProps) {
  return (
    <OnboardingShell
      step={2}
      title="How you work with others"
      description="These tags describe what you contribute and what kind of partnership you are open to. They are not job posts."
      asideNote="Pick what fits today. You can update your tags any time from your profile."
    >
      {error ? <ErrorBanner message={error} /> : null}

      <form action={saveProfileTags} className="space-y-8">
        <TagGroup
          title="What I bring"
          helper="Skills, experience, or ways you can help someone else's project."
          name="brings"
          tags={tags}
          selected={selectedBrings}
        />

        <TagGroup
          title="Open to collaborating on"
          helper="Kinds of projects or problems where you would welcome a partner or co-builder."
          name="open_to"
          tags={tags}
          selected={selectedOpenTo}
        />

        <button type="submit" className={primaryButtonClassName}>
          Save and continue
        </button>
      </form>
    </OnboardingShell>
  );
}
