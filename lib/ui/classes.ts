export const focusRingClassName =
  "outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page";

export const pageTitleClassName =
  "text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-fg sm:text-[1.875rem]";

export const pageSubtitleClassName = "mt-1.5 text-sm leading-relaxed text-fg-muted";

export const sectionTitleClassName = "text-sm font-medium text-fg";

export const panelClassName =
  "rounded-lg border border-border-subtle bg-surface-rail p-4 shadow-[var(--elevation-card)]";

export const cardClassName =
  "rounded-lg border border-border-subtle bg-surface-card p-5 shadow-[var(--elevation-card)]";

export const emptyStateClassName =
  "rounded-lg border border-border-subtle bg-surface-card p-6 text-sm text-fg-muted shadow-[var(--elevation-card)]";

export const tagPillClassName =
  "rounded-full bg-[var(--pill-neutral-bg)] px-2.5 py-0.5 text-xs text-fg";

export const statusTextClassName = "text-sm text-fg-muted";

export const errorTextClassName = "text-sm text-fg";

export const fieldClassName = `w-full rounded-md border border-[var(--border-input)] bg-surface-input px-3 py-2 text-sm text-fg shadow-[var(--elevation-input)] outline-none transition-shadow placeholder:text-fg-muted ${focusRingClassName}`;

export const labelClassName = "block text-sm font-medium text-fg";

export const primaryButtonClassName = `cursor-pointer rounded-md bg-ember px-4 py-2.5 text-sm font-medium text-warmwhite outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-60`;

export const secondaryButtonClassName = `cursor-pointer rounded-md border border-[var(--border-input)] bg-surface-card px-4 py-2.5 text-sm font-medium text-fg shadow-[var(--elevation-input)] outline-none transition-colors hover:bg-[var(--hover-subtle)] ${focusRingClassName}`;

export const textLinkClassName = `cursor-pointer text-sm text-fg-muted underline-offset-2 outline-none hover:text-fg hover:underline ${focusRingClassName}`;

export const inlineLinkClassName = `cursor-pointer text-fg underline underline-offset-2 outline-none hover:opacity-80 ${focusRingClassName}`;

export const verifiedBadgeClassName =
  "inline-flex items-center rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal";

export const interactiveCardLinkClassName = `block cursor-pointer rounded-lg border border-border-subtle bg-surface-card p-4 shadow-[var(--elevation-card)] outline-none transition-colors hover:border-fg/20 ${focusRingClassName}`;

export const headerSearchClassName = `w-full rounded-md border border-[var(--border-input)] bg-surface-input px-3 py-2 text-sm text-fg shadow-[var(--elevation-input)] outline-none placeholder:text-fg-muted disabled:cursor-not-allowed disabled:opacity-70 ${focusRingClassName}`;

export const compactButtonClassName = `cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-60`;
