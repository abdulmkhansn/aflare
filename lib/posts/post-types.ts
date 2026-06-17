export const POST_TYPES = [
  "update",
  "shipped",
  "learning",
  "stuck",
  "need_users",
  "parked",
] as const;

export type PostType = (typeof POST_TYPES)[number];

export const BLOCKER_POST_TYPES = ["stuck", "need_users"] as const;

export type BlockerPostType = (typeof BLOCKER_POST_TYPES)[number];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  update: "Update",
  shipped: "Shipped",
  learning: "TIL",
  stuck: "Stuck",
  need_users: "Need testers",
  parked: "Parked",
};

export function isPostType(value: string): value is PostType {
  return POST_TYPES.includes(value as PostType);
}

export function getPostTypeLabel(type: string): string {
  return isPostType(type) ? POST_TYPE_LABELS[type] : POST_TYPE_LABELS.update;
}

const BADGE_BASE =
  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium";

export function postTypeStripeClassName(type: PostType): string {
  switch (type) {
    case "shipped":
      return "border-l-[var(--stripe-shipped)]";
    case "stuck":
    case "need_users":
      return "border-l-[var(--stripe-ember)]";
    default:
      return "border-l-[var(--stripe-neutral)]";
  }
}

export function postTypeBadgeClassName(type: PostType): string {
  switch (type) {
    case "shipped":
      return `${BADGE_BASE} bg-[var(--badge-shipped-bg)] text-[var(--badge-shipped-fg)]`;
    case "stuck":
    case "need_users":
      return `${BADGE_BASE} bg-[var(--badge-ember-bg)] text-[var(--badge-ember-fg)]`;
    case "parked":
      return `${BADGE_BASE} bg-[var(--badge-parked-bg)] text-[var(--badge-parked-fg)]`;
    default:
      return `${BADGE_BASE} bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-fg)]`;
  }
}

export const POST_CARD_SHELL_CLASS =
  "overflow-hidden rounded-tr-lg rounded-br-lg rounded-tl-none rounded-bl-none border border-border-subtle border-l-[3px] bg-surface-card";
