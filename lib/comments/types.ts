export type CommentProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  helpful_count: number;
  created_at: string;
  profiles: CommentProfile | CommentProfile[] | null;
};

export function resolveCommentProfile(comment: Comment) {
  return Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
}

export const COMMENT_SELECT = `
  id,
  post_id,
  author_id,
  body,
  helpful_count,
  created_at,
  profiles:author_id ( display_name, avatar_url )
`;
