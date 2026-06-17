export const POST_KINDS = ["build", "share", "article"] as const;

export type PostKind = (typeof POST_KINDS)[number];

export function isPostKind(value: string): value is PostKind {
  return POST_KINDS.includes(value as PostKind);
}

type PostKindInput = {
  kind?: string | null;
  project_id?: string | null;
};

export function resolvePostKind(post: PostKindInput): PostKind {
  if (post.kind && isPostKind(post.kind)) {
    return post.kind;
  }

  if (post.project_id) {
    return "build";
  }

  return "share";
}

export function isSharePost(post: PostKindInput): boolean {
  return resolvePostKind(post) === "share";
}

export function isBuildPost(post: PostKindInput): boolean {
  return resolvePostKind(post) === "build";
}
