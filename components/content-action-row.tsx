"use client";

import { IconMessageCircle, IconRepeat, IconUserPlus } from "@tabler/icons-react";

import { ReactionTooltip, helpfulButtonClass } from "@/components/reactions/social-reaction-controls";
import { THIS_HELPED_REACTION } from "@/lib/reactions/constants";
import { errorTextClassName, focusRingClassName } from "@/lib/ui/classes";

export const contentActionRowClassName = "mt-3 flex flex-wrap items-center gap-1.5";
export const contentActionRowNestedClassName = "mt-2 flex flex-wrap items-center gap-1.5";

export function ContentActionRow({
  children,
  nested = false,
}: {
  children: React.ReactNode;
  nested?: boolean;
}) {
  return (
    <div className={nested ? contentActionRowNestedClassName : contentActionRowClassName}>
      {children}
    </div>
  );
}

export function actionPillClassName(active = false) {
  return [
    "group/action relative inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors",
    focusRingClassName,
    active
      ? "border-ember/30 bg-ember/10 text-fg"
      : "border-border-subtle text-fg-muted hover:border-fg/20 hover:text-fg",
  ].join(" ");
}

type HelpfulActionButtonProps = {
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
  readOnly?: boolean;
};

export function HelpfulActionButton({
  count,
  active,
  disabled = false,
  onClick,
  readOnly = false,
}: HelpfulActionButtonProps) {
  const label = THIS_HELPED_REACTION.label;
  const className = helpfulButtonClass(active);

  const content = (
    <>
      <span aria-hidden="true">{THIS_HELPED_REACTION.emoji}</span>
      {count > 0 ? <span>{count}</span> : null}
      {!readOnly ? <ReactionTooltip label={label} groupName="helpful" /> : null}
    </>
  );

  if (readOnly) {
    return (
      <span className={className} aria-label={`${label} · ${count}`}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={count > 0 ? `${label} · ${count}` : label}
      aria-pressed={active}
      title={label}
    >
      {content}
    </button>
  );
}

type CommentCountActionProps = {
  label: string;
  onClick: () => void;
};

export function CommentCountAction({ label, onClick }: CommentCountActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={actionPillClassName()}
      aria-label={label}
      title={label}
    >
      <IconMessageCircle className="h-3.5 w-3.5" stroke={1.75} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

type RepostActionTriggerProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function RepostActionTrigger({ onClick, disabled = false }: RepostActionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={actionPillClassName()}
      aria-label="Repost"
      title="Repost"
    >
      <IconRepeat className="h-3.5 w-3.5" stroke={1.75} aria-hidden="true" />
      <span className="sr-only">Repost</span>
    </button>
  );
}

type BoostActionTriggerProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function BoostActionTrigger({ onClick, disabled = false }: BoostActionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={actionPillClassName()}
      aria-label="Share"
      title="Know someone who can help?"
    >
      <IconUserPlus className="h-3.5 w-3.5" stroke={1.75} aria-hidden="true" />
      <span>Share</span>
    </button>
  );
}

export function ActionRowError({ message }: { message: string }) {
  return (
    <p className={`w-full ${errorTextClassName}`} role="alert">
      {message}
    </p>
  );
}
