export const NOTIFICATION_TYPES = [
  "flare_reply",
  "flare_helper",
  "helpful_received",
  "new_follower",
  "post_comment",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  flare_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  flare_comment_id: string | null;
  read: boolean;
  created_at: string;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
  posts:
    | {
        project_id: string | null;
      }
    | {
        project_id: string | null;
      }[]
    | null;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  actorId: string;
  actorName: string | null;
  actorAvatarUrl: string | null;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export const NOTIFICATION_SELECT = `
  id,
  user_id,
  actor_id,
  type,
  flare_id,
  post_id,
  comment_id,
  flare_comment_id,
  read,
  created_at,
  profiles:actor_id ( display_name, avatar_url ),
  posts:post_id ( project_id )
`;
