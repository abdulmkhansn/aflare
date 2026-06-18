import {
  ErrorBanner,
  OnboardingShell,
  fieldClassName,
  onboardingTextareaClassName,
  labelClassName,
  primaryButtonClassName,
} from "./onboarding-shell";
import { saveProfileAndProject } from "./actions";

type StepOneProps = {
  displayName: string;
  bio: string;
  error?: string;
};

const STAGE_OPTIONS = [
  { value: "idea", label: "Idea" },
  { value: "building", label: "Building" },
  { value: "shipped", label: "Shipped" },
  { value: "parked", label: "Parked" },
] as const;

export function StepOne({ displayName, bio, error }: StepOneProps) {
  return (
    <OnboardingShell
      step={1}
      title="Who you are and what you are building"
      description="This goes on your public profile and your first project page. You can edit both later."
      asideNote="Your build log starts with one project. Add more after onboarding."
    >
      {error ? <ErrorBanner message={error} /> : null}

      <form action={saveProfileAndProject} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-charcoal/50">About you</h2>

          <div className="space-y-1.5">
            <label htmlFor="display_name" className={labelClassName}>
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              defaultValue={displayName}
              autoComplete="name"
              className={fieldClassName}
              placeholder="Your name or handle"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bio" className={labelClassName}>
              Bio <span className="font-normal text-charcoal/50">(optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={bio}
              className={onboardingTextareaClassName}
              placeholder="A short line about what you do or care about."
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-charcoal/10 pt-6">
          <h2 className="text-sm font-medium text-charcoal/50">Your first project</h2>

          <div className="space-y-1.5">
            <label htmlFor="project_name" className={labelClassName}>
              Project name
            </label>
            <input
              id="project_name"
              name="project_name"
              type="text"
              required
              className={fieldClassName}
              placeholder="Working title is fine"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="one_liner" className={labelClassName}>
              One-liner
            </label>
            <input
              id="one_liner"
              name="one_liner"
              type="text"
              required
              className={fieldClassName}
              placeholder="What it is in one sentence"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stage" className={labelClassName}>
              Stage
            </label>
            <select
              id="stage"
              name="stage"
              defaultValue="building"
              className={fieldClassName}
            >
              {STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="abstract_description" className={labelClassName}>
              Shareable description{" "}
              <span className="font-normal text-charcoal/50">(optional)</span>
            </label>
            <textarea
              id="abstract_description"
              name="abstract_description"
              rows={4}
              className={onboardingTextareaClassName}
              placeholder="A public summary of what you are building. Leave out secrets, keys, and private details."
            />
            <p className="text-xs text-charcoal/50">
              This is safe to share. Do not put credentials or unreleased specifics here.
            </p>
          </div>
        </section>

        <button type="submit" className={primaryButtonClassName}>
          Save and continue
        </button>
      </form>
    </OnboardingShell>
  );
}
