import type { AppNotification, NotificationRow, NotificationType } from "@/lib/notifications/types";

function resolveActorProfile(row: NotificationRow) {
  return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
}

function resolvePostProjectId(row: NotificationRow) {
  const post = Array.isArray(row.posts) ? row.posts[0] : row.posts;
  return post?.project_id ?? null;
}

export function notificationMessage(type: NotificationType, actorName: string | null): string {
  const name = actorName?.trim() || "Someone";

  switch (type) {
    case "flare_reply":
      return `${name} replied to your flare`;
    case "flare_helper":
      return `${name} offered to help on your flare`;
    case "new_follower":
      return `${name} followed you`;
    case "post_comment":
      return `${name} commented on your post`;
    case "mention":
      return `${name} mentioned you`;
    case "helpful_received":
      return `${name} found your reply helpful`;
    default:
      return `${name} sent you a notification`;
  }
}

export function notificationHref(row: NotificationRow): string {
  const projectId = resolvePostProjectId(row);

  switch (row.type) {
    case "flare_reply":
    case "flare_helper":
      return row.flare_id ? `/flarespace/${row.flare_id}` : "/flarespace";
    case "new_follower":
      return `/u/${row.actor_id}`;
    case "post_comment":
      return projectId ? `/projects/${projectId}` : "/";
    case "mention":
      if (row.flare_id) {
        return `/flarespace/${row.flare_id}`;
      }
      if (projectId) {
        return `/projects/${projectId}`;
      }
      return "/";
    case "helpful_received":
      if (row.flare_id) {
        return `/flarespace/${row.flare_id}`;
      }
      if (projectId) {
        return `/projects/${projectId}`;
      }
      return "/";
    default:
      return "/";
  }
}

export function mapNotificationRow(row: NotificationRow): AppNotification {
  const profile = resolveActorProfile(row);

  return {
    id: row.id,
    type: row.type,
    actorId: row.actor_id,
    actorName: profile?.display_name ?? null,
    actorAvatarUrl: profile?.avatar_url ?? null,
    message: notificationMessage(row.type, profile?.display_name ?? null),
    href: notificationHref(row),
    read: row.read,
    createdAt: row.created_at,
  };
}
