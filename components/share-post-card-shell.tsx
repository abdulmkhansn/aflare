import type { ReactNode } from "react";

export const SHARE_POST_CARD_SHELL_CLASS =
  "overflow-hidden rounded-lg border border-border-subtle bg-surface-card";

type SharePostCardShellProps = {
  children: ReactNode;
};

export function SharePostCardShell({ children }: SharePostCardShellProps) {
  return <article className={SHARE_POST_CARD_SHELL_CLASS}>{children}</article>;
}
