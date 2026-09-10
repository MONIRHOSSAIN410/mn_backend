/**
 * Vercel serverless entry point.
 * `vercel.json` rewrites every request to this file, and Vercel keeps the
 * module warm — so the Mongo connection is cached in src/config/db.js.
 */
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { missingEnv } from "../src/config/env.js";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (missingEnv.length) {
    console.error(
      `Missing environment variables: ${missingEnv.join(", ")} — ` +
        "add them in Vercel → Project → Settings → Environment Variables, then redeploy."
    );
    return sendJson(res, 503, {
      success: false,
      message: "API is not configured yet",
      missing: missingEnv,
      fix: "Vercel → Project → Settings → Environment Variables → add these, then Redeploy.",
    });
  }

  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed:", error);
    return sendJson(res, 503, { success: false, message: "Database unavailable" });
  }
  return app(req, res);
}
