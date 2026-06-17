export const MILESTONE_TYPES = [
  "first_project",
  "first_ship",
  "first_flare",
  "first_help_given",
  "first_flare_reply",
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export type UserMilestone = {
  user_id: string;
  milestone: MilestoneType;
  reached_at: string;
  celebrated: boolean;
};

export function isMilestoneType(value: string): value is MilestoneType {
  return MILESTONE_TYPES.includes(value as MilestoneType);
}
