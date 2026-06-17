export type CommentSearchParams = {
  commentPosted?: string;
  commentError?: string;
  helpfulError?: string;
};

export function parseCommentStatusForPost(
  searchParams: CommentSearchParams,
  postId: string
) {
  let commentError: string | undefined;

  if (searchParams.commentError) {
    const decoded = decodeURIComponent(searchParams.commentError);
    const colonIndex = decoded.indexOf(":");

    if (colonIndex !== -1) {
      const errorPostId = decoded.slice(0, colonIndex);
      const message = decoded.slice(colonIndex + 1);

      if (errorPostId === postId) {
        commentError = message;
      }
    }
  }

  return {
    commentPosted: searchParams.commentPosted === postId,
    commentError,
  };
}

export function parseHelpfulError(searchParams: CommentSearchParams) {
  return searchParams.helpfulError
    ? decodeURIComponent(searchParams.helpfulError)
    : undefined;
}
