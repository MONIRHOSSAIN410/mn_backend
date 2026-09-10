import "dotenv/config";

/**
 * Vercel pre-fills variables from .env.example with EMPTY values. An empty
 * string is not a setting, so treat it exactly like "not set".
 */
const read = (key) => {
  const value = process.env[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
};

const isDeployed = Boolean(process.env.VERCEL);

/**
 * Required settings that are missing on a real deployment. Throwing here used
 * to crash the whole function at import time (Vercel: FUNCTION_INVOCATION_FAILED,
 * no useful message). Now api/index.js answers every request with a clear 503
 * that names what to add instead.
 */
export const missingEnv = [];

const required = (key, devFallback) => {
  const value = read(key);
  if (value) return value;
  if (isDeployed) missingEnv.push(key);
  return devFallback;
};

export const env = {
  NODE_ENV: read("NODE_ENV") ?? (isDeployed ? "production" : "development"),
  PORT: Number(read("PORT") ?? 5000),
  MONGODB_URI: required("MONGODB_URI", "mongodb://127.0.0.1:27017/mobile-shop"),
  JWT_SECRET: required("JWT_SECRET", "change-this-secret-in-production"),
  JWT_EXPIRES_IN: read("JWT_EXPIRES_IN") ?? "30d",
  // Shared with the Next.js auth layer so only it can call /api/auth/oauth.
  OAUTH_SHARED_SECRET: required(
    "OAUTH_SHARED_SECRET",
    "change-this-oauth-bridge-secret"
  ),
  CLIENT_URLS: (read("CLIENT_URLS") ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean),
};

export const isProd = env.NODE_ENV === "production";
