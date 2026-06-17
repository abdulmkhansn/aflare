import type { Metadata } from "next";

import { AflareWordmark } from "@/components/aflare-wordmark";
import { DESCRIPTOR, pageTitle, TAGLINE } from "@/lib/app/brand";
import { signIn, signUp } from "./actions";
import { OAuthButtons } from "./oauth-buttons";

export const metadata: Metadata = {
  title: pageTitle("Sign in"),
  description: DESCRIPTOR,
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-col lg:min-h-screen lg:flex-row">
      <aside className="flex flex-col justify-between bg-charcoal px-6 py-8 lg:w-1/2 lg:px-12 lg:py-10">
        <AflareWordmark variant="light" />

        <div className="mt-8 space-y-3 lg:mt-0">
          <h1 className="max-w-md text-[22px] font-medium leading-snug text-warmwhite">
            {TAGLINE}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-warmwhite/70">{DESCRIPTOR}</p>
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs text-warmwhite/60 lg:mt-0">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
          Build in the open. No pitch deck required.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-warmwhite px-6 py-10 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-sm">
          <header className="mb-8">
            <h2 className="text-2xl font-medium text-charcoal">Sign in</h2>
            <p className="mt-1 text-sm text-charcoal/70">
              New here? Creating an account is the same flow.
            </p>
          </header>

          {error ? (
            <div
              className="mb-6 rounded-md border border-charcoal/10 bg-charcoal/5 px-3 py-2.5 text-sm text-charcoal"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none transition-shadow placeholder:text-charcoal/40 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-charcoal">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none transition-shadow placeholder:text-charcoal/40 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
              />
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <button
                type="submit"
                formAction={signIn}
                className="w-full rounded-md bg-ember px-4 py-2.5 text-sm font-medium text-warmwhite outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
              >
                Continue
              </button>

              <button
                type="submit"
                formAction={signUp}
                className="self-start text-sm text-charcoal/70 underline-offset-2 outline-none hover:text-charcoal hover:underline focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
              >
                Create account
              </button>
            </div>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-charcoal/10" />
            <span className="text-xs text-charcoal/50">or</span>
            <div className="h-px flex-1 bg-charcoal/10" />
          </div>

          <OAuthButtons />
        </div>
      </main>
    </div>
  );
}
