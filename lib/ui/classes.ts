export const focusRingClassName =
  "outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page";

export const focusWithinRingClassName =
  "transition-shadow focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-2 focus-within:ring-offset-surface-page";

export const displayFontClassName = "font-display";

export const pageStackClassName = "space-y-6";

export const pageContainerNarrowClassName = "mx-auto max-w-2xl";

export const pageContainerArticleClassName = "mx-auto max-w-3xl";

export const pageTitleClassName = `${displayFontClassName} text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-fg sm:text-[1.875rem]`;

export const pageSubtitleClassName = "mt-1.5 text-sm leading-relaxed text-fg-muted";

export const sectionTitleClassName = "text-sm font-medium text-fg";

export const bodyTextClassName = "text-sm leading-relaxed text-fg";

export const panelClassName =
  "rounded-lg border border-border-subtle bg-surface-rail p-5 shadow-[var(--elevation-card)]";

export const cardClassName =
  "rounded-lg border border-border-subtle bg-surface-card p-5 shadow-[var(--elevation-card)]";

export const emptyStateClassName =
  "rounded-lg border border-border-subtle bg-surface-card p-5 text-sm leading-relaxed text-fg-muted shadow-[var(--elevation-card)]";

export const insetPanelClassName =
  "rounded-md border border-border-subtle bg-[var(--hover-subtle)] p-4";

export const tagPillClassName =
  "rounded-full bg-[var(--pill-neutral-bg)] px-2.5 py-0.5 text-xs text-fg";

export const statusTextClassName = "text-sm text-fg-muted";

export const errorTextClassName = "text-sm text-[var(--text-error)]";

export const fieldShellClassName = `rounded-md border border-[var(--border-input)] bg-surface-input shadow-[var(--elevation-input)] ${focusWithinRingClassName}`;

export const fieldControlClassName =
  "block w-full bg-transparent px-3 py-2 text-sm leading-relaxed text-fg outline-none placeholder:text-fg-muted";

export const textareaControlClassName = `${fieldControlClassName} resize-none min-h-[2.75rem]`;

export const fieldClassName = `${fieldShellClassName} ${fieldControlClassName}`;

export const textareaFieldClassName = `${fieldShellClassName} ${textareaControlClassName}`;

export const labelClassName = "block text-sm font-medium text-fg";

export const primaryButtonClassName = `cursor-pointer rounded-md bg-ember px-4 py-2.5 text-sm font-medium text-warmwhite outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-60`;

export const secondaryButtonClassName = `cursor-pointer rounded-md border border-[var(--border-input)] bg-surface-card px-4 py-2.5 text-sm font-medium text-fg shadow-[var(--elevation-input)] outline-none transition-colors hover:bg-[var(--hover-subtle)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRingClassName}`;

export const textLinkClassName = `cursor-pointer text-sm text-fg-muted underline-offset-2 outline-none transition-colors hover:text-fg hover:underline ${focusRingClassName}`;

export const inlineLinkClassName = `cursor-pointer text-fg underline underline-offset-2 outline-none transition-opacity hover:opacity-80 ${focusRingClassName}`;

export const verifiedBadgeClassName =
  "inline-flex items-center rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal";

export const interactiveCardLinkClassName = `block cursor-pointer rounded-lg border border-border-subtle bg-surface-card p-5 shadow-[var(--elevation-card)] outline-none transition-colors hover:border-fg/20 ${focusRingClassName}`;

export const headerSearchClassName = `${fieldClassName} disabled:cursor-not-allowed disabled:opacity-70`;

export const compactButtonClassName = `cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-60`;
