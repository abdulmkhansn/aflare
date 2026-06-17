import { OnboardingShell, primaryButtonClassName } from "./onboarding-shell";
import { finishOnboarding } from "./actions";

export function StepThree() {
  return (
    <OnboardingShell
      step={3}
      title="Verified Builder (optional)"
      description="You can skip this and still use Aflare."
      asideNote={
        <p className="flex items-start gap-2">
          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
          <span>
            Verification is optional. Your profile and project are already live after the first
            step.
          </span>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="rounded-md border border-charcoal/10 bg-white px-4 py-4">
          <p className="text-sm leading-relaxed text-charcoal">
            Later, you can connect GitHub to become a Verified Builder. We read commit activity
            and language stats only. We never read your code.
          </p>
          <p className="mt-3 text-sm text-teal">
            Repo access is not part of sign-in. You will choose that separately when verification
            ships.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form action={finishOnboarding}>
            <button type="submit" className={primaryButtonClassName}>
              Verify later
            </button>
          </form>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="GitHub verification is not available yet"
            className="rounded-md border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-medium text-charcoal/40 outline-none"
          >
            Connect GitHub to verify
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
