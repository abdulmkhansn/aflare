import { getPostTypeLabel, isPostType, postTypeBadgeClassName } from "@/lib/posts/post-types";

type PostTypeBadgeProps = {
  type: string;
};

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  const postType = isPostType(type) ? type : "update";

  return <span className={postTypeBadgeClassName(postType)}>{getPostTypeLabel(type)}</span>;
}
