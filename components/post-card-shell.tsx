import type { ReactNode } from "react";

import {
  POST_CARD_SHELL_CLASS,
  isPostType,
  postTypeStripeClassName,
} from "@/lib/posts/post-types";

type PostCardShellProps = {
  postType: string;
  children: ReactNode;
};

export function PostCardShell({ postType, children }: PostCardShellProps) {
  const type = isPostType(postType) ? postType : "update";

  return (
    <article
      className={`${POST_CARD_SHELL_CLASS} ${postTypeStripeClassName(type)}`}
    >
      <div className="p-5">{children}</div>
    </article>
  );
}
