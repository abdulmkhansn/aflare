export const HELPFUL_TARGET_TYPES = ["comment", "article", "post", "flare_comment"] as const;

export type HelpfulTargetType = (typeof HELPFUL_TARGET_TYPES)[number];

export const HELPFUL_TARGET = {
  comment: "comment",
  article: "article",
  post: "post",
  flare_comment: "flare_comment",
} as const satisfies Record<HelpfulTargetType, HelpfulTargetType>;
