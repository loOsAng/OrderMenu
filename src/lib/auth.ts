import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "admin-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD environment variable");
  }

  return password;
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createAdminSessionValue() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionValue(value?: string) {
  if (!value) {
    return false;
  }

  const lastDot = value.lastIndexOf(".");

  if (lastDot === -1) {
    return false;
  }

  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  const expectedSignature = sign(payload);
  const validSignature =
    signature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!validSignature) {
    return false;
  }

  const [scope, expiresAt] = payload.split(":");

  return scope === "admin" && Number(expiresAt) > Date.now();
}

export function verifyAdminPassword(password: string) {
  return password === getAdminPassword();
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export const adminSessionCookieName = SESSION_COOKIE;
