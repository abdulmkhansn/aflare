export type InlineActionResult = { ok: true } | { ok: false; error: string };

export function inlineOk(): InlineActionResult {
  return { ok: true };
}

export function inlineError(error: string): InlineActionResult {
  return { ok: false, error };
}
