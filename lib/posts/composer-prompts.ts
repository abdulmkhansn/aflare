export const FEED_COMPOSE_PROMPTS = [
  "Share what you're working on.",
  "Post a win, a blocker, or something you figured out.",
  "What are you building right now?",
  "Stuck on something? Ask the room.",
] as const;

export const DEFAULT_COMPOSE_PROMPT = FEED_COMPOSE_PROMPTS[0];

export function pickComposePrompt(seed?: number): string {
  const index =
    seed !== undefined
      ? Math.abs(seed) % FEED_COMPOSE_PROMPTS.length
      : Math.floor(Math.random() * FEED_COMPOSE_PROMPTS.length);

  return FEED_COMPOSE_PROMPTS[index];
}
