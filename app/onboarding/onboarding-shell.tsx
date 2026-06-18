import { AflareWordmark } from "@/components/aflare-wordmark";
import type { ReactNode } from "react";

type OnboardingShellProps = {
  step: 1 | 2 | 3;
  title: string;
  description: string;
  children: ReactNode;
  asideNote?: ReactNode;
};

const STEPS = [
  { number: 1, label: "You and your project" },
  { number: 2, label: "How you collaborate" },
  { number: 3, label: "Verify (optional)" },
] as const;

export function OnboardingShell({
  step,
  title,
  description,
  children,
  asideNote,
}: OnboardingShellProps) {
  return (
    <div className="flex min-h-full flex-col lg:min-h-screen lg:flex-row">
      <aside className="bg-charcoal px-6 py-8 lg:flex lg:w-2/5 lg:flex-col lg:justify-between lg:px-10 lg:py-10">
        <div>
          <AflareWordmark variant="light" />
          <p className="mt-6 text-sm text-warmwhite/60">Step {step} of 3</p>

          <ol className="mt-4 space-y-2">
            {STEPS.map((item) => {
              const isCurrent = item.number === step;
              const isDone = item.number < step;

              return (
                <li
                  key={item.number}
                  className={`flex items-center gap-2 text-sm ${
                    isCurrent
                      ? "font-medium text-warmwhite"
                      : isDone
                        ? "text-warmwhite/70"
                        : "text-warmwhite/40"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                      isCurrent
                        ? "bg-ember text-warmwhite"
                        : isDone
                          ? "bg-warmwhite/15 text-warmwhite"
                          : "border border-warmwhite/20 text-warmwhite/50"
                    }`}
                  >
                    {item.number}
                  </span>
                  {item.label}
                </li>
              );
            })}
          </ol>
        </div>

        {asideNote ? (
          <div className="mt-8 text-sm text-warmwhite/60 lg:mt-0">{asideNote}</div>
        ) : null}
      </aside>

      <main className="flex flex-1 items-start justify-center bg-warmwhite px-6 py-10 lg:w-3/5 lg:px-12 lg:py-14">
        <div className="w-full max-w-lg">
          <header className="mb-8">
            <h1 className="font-display text-2xl font-medium text-charcoal">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{description}</p>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}

export const fieldClassName =
  "w-full rounded-md border border-charcoal/15 bg-white px-3 py-2 text-sm leading-relaxed text-charcoal outline-none transition-shadow placeholder:text-charcoal/40 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite";

export const onboardingTextareaClassName = `${fieldClassName} resize-none min-h-[5rem]`;

export const labelClassName = "block text-sm font-medium text-charcoal";

export const primaryButtonClassName =
  "rounded-md bg-ember px-4 py-2.5 text-sm font-medium text-warmwhite outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite disabled:cursor-not-allowed disabled:opacity-60";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-6 rounded-md border border-charcoal/10 bg-charcoal/5 px-3 py-2.5 text-sm text-charcoal"
      role="alert"
    >
      {message}
    </div>
  );
}
