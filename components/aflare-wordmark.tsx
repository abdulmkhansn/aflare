import Link from "next/link";

type AflareWordmarkProps = {
  href?: string;
  variant?: "light" | "dark" | "nav" | "app";
  className?: string;
};

const variantClasses = {
  light: "text-warmwhite",
  dark: "text-charcoal",
  nav: "text-fg",
  app: "text-fg",
};

export function AflareWordmark({
  href,
  variant = "dark",
  className = "",
}: AflareWordmarkProps) {
  const content = (
    <span className={`text-lg font-medium ${variantClasses[variant]} ${className}`}>
      A<span className="text-ember">flare</span>
    </span>
  );

  if (href) {
    const focusClass =
      variant === "light"
        ? "inline-block outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal cursor-pointer"
        : variant === "nav"
          ? "inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-rail"
          : variant === "app"
            ? "inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-header"
            : variant === "dark"
              ? "inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
              : "inline-block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page";

    return (
      <Link href={href} className={focusClass}>
        {content}
      </Link>
    );
  }

  return content;
}
