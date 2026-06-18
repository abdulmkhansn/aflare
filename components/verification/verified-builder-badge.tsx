import { verifiedBadgeClassName } from "@/lib/ui/classes";

export const VERIFIED_BUILDER_TOOLTIP =
  "Verified builder — we confirmed real public building activity, and never touched their code.";

type VerifiedBuilderBadgeProps = {
  variant?: "full" | "compact";
  className?: string;
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function VerifiedBuilderBadge({
  variant = "full",
  className = "",
}: VerifiedBuilderBadgeProps) {
  if (variant === "compact") {
    return (
      <span
        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal ${className}`}
        title={VERIFIED_BUILDER_TOOLTIP}
        aria-label={VERIFIED_BUILDER_TOOLTIP}
      >
        <CheckIcon />
      </span>
    );
  }

  return (
    <span
      className={`${verifiedBadgeClassName} gap-1 ${className}`}
      title={VERIFIED_BUILDER_TOOLTIP}
    >
      <CheckIcon />
      Verified builder
    </span>
  );
}
