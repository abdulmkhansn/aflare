import Link from "next/link";

import { AflareWordmark } from "@/components/aflare-wordmark";
import { DESCRIPTOR, TAGLINE } from "@/lib/app/brand";

const heroFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal";

const lightFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite";

const STEPS = [
  {
    title: "Keep a build log",
    body: "Write what you are building as you go. Your project page holds the story, not a slide deck.",
  },
  {
    title: "Post where you are stuck",
    body: "Share updates, blockers, and when you need testers. Say what is actually blocking you.",
  },
  {
    title: "Get found through your tags",
    body: "People with overlapping skills find you through tags. They reply on your posts.",
  },
  {
    title: "Mark what actually helped",
    body: "When a reply moves you forward, say so. That builds reputation you can point to.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-warmwhite">
      {/* Hero */}
      <header className="bg-charcoal text-warmwhite">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <AflareWordmark href="/" variant="light" />

            <nav
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
              aria-label="Marketing"
            >
              <a href="#how-it-works" className={`text-warmwhite/80 hover:text-warmwhite ${heroFocusRing}`}>
                How it works
              </a>
              <a href="#trust" className={`text-warmwhite/80 hover:text-warmwhite ${heroFocusRing}`}>
                Trust
              </a>
              <Link
                href="/login"
                className={`rounded-md bg-ember px-4 py-2 font-medium text-warmwhite hover:opacity-90 ${heroFocusRing}`}
              >
                Start building
              </Link>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-16 pt-6 sm:pb-24 sm:pt-10">
          <p className="text-sm font-medium text-warmwhite/80">{TAGLINE}</p>

          <h1 className="mt-4 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl sm:leading-tight">
            Build in the open. Show where you&apos;re stuck.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-warmwhite/75 sm:text-lg">
            {DESCRIPTOR}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className={`rounded-md bg-ember px-5 py-2.5 text-center text-sm font-medium text-warmwhite hover:opacity-90 ${heroFocusRing}`}
            >
              Start your build log
            </Link>
            <Link
              href="/login"
              className={`rounded-md border border-warmwhite/30 px-5 py-2.5 text-center text-sm font-medium text-warmwhite hover:bg-warmwhite/5 ${heroFocusRing}`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section id="how-it-works" className="bg-warmwhite py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-charcoal">How it works</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal/70">
            Post the work as you go. Help each other move forward.
          </p>

          <ol className="mt-10 grid gap-8 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} className="space-y-2">
                <p className="text-xs font-medium text-charcoal/50">Step {index + 1}</p>
                <h3 className="text-lg font-medium text-charcoal">{step.title}</h3>
                <p className="text-sm leading-relaxed text-charcoal/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-charcoal/10 bg-warmwhite py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-medium tracking-[-0.02em] text-charcoal">
              Trust is the point
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
              Aflare is built so help and credit are visible. You can see who builds, what they
              said, and what moved someone forward.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-teal/25 bg-teal/5 p-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                <h3 className="text-sm font-medium text-charcoal">Verified builder</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
                Connect GitHub to show commit activity and languages. We read activity and languages,
                never your code. Proof you build, not a badge for show.
              </p>
            </div>

            <div className="rounded-lg border border-charcoal/10 bg-white p-5">
              <h3 className="text-sm font-medium text-charcoal">Timestamped posts</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Your updates stay on the record. What you shipped, when you were stuck, and who
                replied is all there. Provenance you can point to.
              </p>
            </div>

            <div className="rounded-lg border border-teal/25 bg-teal/5 p-5 sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                <h3 className="text-sm font-medium text-charcoal">Reputation from helpful replies</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
                When someone marks your reply as helpful, your reputation grows. No algorithm, no
                gamified badges. A record that you showed up and helped.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-charcoal/10 bg-warmwhite py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AflareWordmark variant="dark" className="text-charcoal" />
            <p className="mt-2 text-sm font-medium text-charcoal">{TAGLINE}</p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-charcoal/70" aria-label="Footer">
            <a href="#how-it-works" className={`hover:text-charcoal ${lightFocusRing}`}>
              How it works
            </a>
            <a href="#trust" className={`hover:text-charcoal ${lightFocusRing}`}>
              Trust
            </a>
            <Link href="/login" className={`hover:text-charcoal ${lightFocusRing}`}>
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
