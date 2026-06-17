import Link from "next/link";

import { AflareWordmark } from "@/components/aflare-wordmark";
import {
  focusRingClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  tagPillClassName,
} from "@/lib/ui/classes";

export const LANDING_TAGLINE = "Build out loud. Together.";

export const LANDING_SUBHEAD =
  "Whatever you're building and however you started, you're in the right room. People here help. They don't judge.";

const LANDING_CONTAINER = "mx-auto w-full max-w-5xl px-6";

const SECTION_PADDING = "py-16 sm:py-20";

const HOW_IT_WORKS = [
  {
    title: "Share what you're building",
    body: "Progress, wins, what you learned, even the rough middle. Show the work as it happens.",
  },
  {
    title: "Show where you're stuck",
    body: "Blockers are normal here, not failures. Say what's blocking you and ask for a hand.",
  },
  {
    title: "Help and get helped",
    body: "One tap to say this helped. Reputation is earned by helping, never by ranking others.",
  },
  {
    title: "Build in good company",
    body: "Follow builders, find your people, and keep moving alongside others who get it.",
  },
] as const;

const WHO_ITS_FOR = [
  "First-time builders shipping with AI tools",
  "People new to building apps",
  "Seasoned builders here to help and stay current",
  "People building small things just to share",
] as const;

const STANCE_PILLS = [
  "No gatekeeping.",
  "No question too basic.",
  "No win too small.",
] as const;

export function LandingPage() {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-col bg-surface-page text-fg">
      {/* Header */}
      <header className="w-full border-b border-border-subtle">
        <div className={`${LANDING_CONTAINER} flex items-center justify-between gap-6 py-4 sm:py-5`}>
          <AflareWordmark
            href="/"
            variant="nav"
            className="shrink-0 text-2xl font-medium sm:text-[1.875rem]"
          />

          <nav className="flex shrink-0 items-center gap-3 sm:gap-4" aria-label="Account">
            <Link href="/login" className={`text-sm text-fg-muted hover:text-fg ${focusRingClassName}`}>
              Sign in
            </Link>
            <Link href="/login" className={primaryButtonClassName}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full flex-1">
        {/* Hero */}
        <section className={`w-full ${SECTION_PADDING}`}>
          <div className={LANDING_CONTAINER}>
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <AflareWordmark variant="nav" className="text-4xl sm:text-[2.75rem]" />

              <h1 className="mt-8 text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl sm:leading-tight">
                {LANDING_TAGLINE}
              </h1>

              <p className="mt-5 text-base leading-relaxed text-fg-muted sm:text-lg">
                {LANDING_SUBHEAD}
              </p>

              <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
                <Link href="/login" className={`${primaryButtonClassName} text-center`}>
                  Start building
                </Link>
                <a href="#how-it-works" className={`${secondaryButtonClassName} text-center`}>
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stance */}
        <section
          id="stance"
          className={`w-full border-y border-border-subtle bg-surface-card ${SECTION_PADDING}`}
        >
          <div className={LANDING_CONTAINER}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl">
                Everyone started somewhere.
              </h2>

              <div className="mt-8 space-y-4 text-base leading-relaxed text-fg-muted sm:text-lg">
                <p>
                  Some people here have shipped for twenty years. Some shipped their first thing last
                  week and shared a localhost link. Both belong, and honestly, we&apos;re all a few
                  steps ahead on some things and a couple behind on others. That&apos;s the whole
                  point.
                </p>
                <p>
                  The experienced help the new. The new keep everyone current. Nobody gets talked
                  down to for learning in public.
                </p>
              </div>

              <ul className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                {STANCE_PILLS.map((pill) => (
                  <li key={pill}>
                    <span className={`inline-block ${tagPillClassName} px-4 py-2 text-sm`}>
                      {pill}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className={`w-full ${SECTION_PADDING}`}>
          <div className={LANDING_CONTAINER}>
            <h2 className="text-2xl font-medium tracking-[-0.02em]">How it works</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
              Plain steps. Nothing to perform, nothing to prove before you show up.
            </p>

            <ol className="mt-10 grid gap-10 sm:grid-cols-2">
              {HOW_IT_WORKS.map((step, index) => (
                <li key={step.title} className="space-y-2">
                  <p className="text-xs font-medium text-fg-muted">Step {index + 1}</p>
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-fg-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who it's for */}
        <section
          id="who-its-for"
          className={`w-full border-t border-border-subtle bg-surface-card ${SECTION_PADDING}`}
        >
          <div className={LANDING_CONTAINER}>
            <h2 className="text-2xl font-medium tracking-[-0.02em]">Who it&apos;s for</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
              If you build and want to build in the open, you belong here.
            </p>

            <ul className="mt-8 max-w-2xl space-y-3">
              {WHO_ITS_FOR.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-fg-muted sm:text-base"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Trust */}
        <section className={`w-full ${SECTION_PADDING}`}>
          <div className={LANDING_CONTAINER}>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-base leading-relaxed text-teal sm:text-lg">
                We verify that people really build, without ever touching your code.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`w-full border-t border-border-subtle bg-surface-card ${SECTION_PADDING}`}>
          <div className={LANDING_CONTAINER}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
                {LANDING_TAGLINE}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-fg-muted sm:text-base">
                {LANDING_SUBHEAD}
              </p>
              <div className="mt-8">
                <Link href="/login" className={primaryButtonClassName}>
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-border-subtle py-10">
        <div className={`${LANDING_CONTAINER} flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between`}>
          <div>
            <AflareWordmark variant="nav" />
            <p className="mt-2 text-sm font-medium text-fg-muted">{LANDING_TAGLINE}</p>
          </div>

          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted"
            aria-label="Footer"
          >
            <a href="#how-it-works" className={`hover:text-fg ${focusRingClassName}`}>
              How it works
            </a>
            <Link href="/login" className={`hover:text-fg ${focusRingClassName}`}>
              Sign in
            </Link>
            <a href="#" className={`hover:text-fg ${focusRingClassName}`}>
              Terms
            </a>
            <a href="#" className={`hover:text-fg ${focusRingClassName}`}>
              Privacy
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
