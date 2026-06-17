export const TOAST_MESSAGES = {
  flare_sent: "Flare sent.",
  reply_posted: "Posted.",
  state_saved: "Live state updated.",
  resolved: "Marked resolved. Thanks for closing the loop.",
  reopened: "Reopened. Help can pick back up.",
} as const;

export type ToastKey = keyof typeof TOAST_MESSAGES;

export function isToastKey(value: string): value is ToastKey {
  return value in TOAST_MESSAGES;
}

export function getToastMessage(key: ToastKey): string {
  return TOAST_MESSAGES[key];
}
