import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import { GITHUB_VERIFY_COOKIE } from "@/lib/github/verify-config";

export { GITHUB_VERIFY_COOKIE };

type VerifyOAuthPayload = {
  userId: string;
  returnTo: string;
  nonce: string;
};

function signingSecret(): string {
  const secret = process.env.GITHUB_VERIFY_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing GITHUB_VERIFY_CLIENT_SECRET.");
  }

  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return timingSafeEqual(aBuf, bBuf);
}

export function createVerifyOAuthState(userId: string, returnTo: string): string {
  const payload: VerifyOAuthPayload = {
    userId,
    returnTo,
    nonce: randomBytes(16).toString("hex"),
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function parseVerifyOAuthState(state: string): VerifyOAuthPayload | null {
  const [encoded, signature] = state.split(".");

  if (!encoded || !signature || !safeEqual(sign(encoded), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as VerifyOAuthPayload;

    if (!payload.userId || !payload.returnTo || !payload.nonce) {
      return null;
    }

    if (!payload.returnTo.startsWith("/") || payload.returnTo.startsWith("//")) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
