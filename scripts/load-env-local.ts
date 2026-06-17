import { readFileSync } from "node:fs";
import { join } from "node:path";

export function loadEnvLocal(): Record<string, string> {
  const path = join(process.cwd(), ".env.local");
  let content: string;

  try {
    content = readFileSync(path, "utf8");
  } catch {
    throw new Error("Could not read .env.local. Create it in the project root first.");
  }

  const env: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}
