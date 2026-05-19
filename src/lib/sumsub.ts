import { createHmac } from "crypto";

const BASE = "https://api.sumsub.com";

const APP_TOKEN  = process.env.SUMSUB_APP_TOKEN  ?? "";
const SECRET_KEY = process.env.SUMSUB_SECRET_KEY ?? "";

export const SUMSUB_LEVEL_1 = process.env.SUMSUB_LEVEL_1_NAME ?? "basic-kyc-level";
export const SUMSUB_LEVEL_2 = process.env.SUMSUB_LEVEL_2_NAME ?? "advanced-kyc-level";

function headers(method: string, path: string, body = "") {
  const ts  = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", SECRET_KEY)
    .update(ts + method.toUpperCase() + path + body)
    .digest("hex");
  return {
    "X-App-Token":      APP_TOKEN,
    "X-App-Access-Ts":  ts,
    "X-App-Access-Sig": sig,
    "Content-Type":     "application/json",
    Accept:             "application/json",
  };
}

async function call<T>(method: string, path: string, body?: object): Promise<T> {
  const raw = body ? JSON.stringify(body) : undefined;
  const res = await fetch(BASE + path, {
    method,
    headers: headers(method, path, raw ?? ""),
    body:    raw,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.description ?? `Sumsub error ${res.status}`);
  return json as T;
}

/** Create or retrieve an applicant. Returns the applicant object. */
export async function upsertApplicant(
  userId: string,
  email:  string,
  level:  string,
): Promise<{ id: string }> {
  // Check if one already exists for this user
  try {
    const existing = await call<{ id: string }>(
      "GET",
      `/resources/applicants/-;externalUserId=${encodeURIComponent(userId)}/one`,
    );
    return existing;
  } catch {
    // Doesn't exist yet — create one
    return call<{ id: string }>(
      "POST",
      `/resources/applicants?levelName=${encodeURIComponent(level)}`,
      { externalUserId: userId, email, fixedInfo: {} },
    );
  }
}

/** Get a short-lived SDK access token for the embedded WebSDK. */
export async function getAccessToken(userId: string, level: string): Promise<string> {
  const data = await call<{ token: string }>(
    "POST",
    `/resources/accessTokens?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(level)}&ttlInSecs=1800`,
  );
  return data.token;
}

/** Verify the webhook signature sent by Sumsub. */
export function verifyWebhookSignature(
  rawBody:   string,
  sigHeader: string,
  secret:    string,
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return sigHeader === expected;
}
