import arcjet, { shield, detectBot } from "@arcjet/next";

/**
 * Arcjet security client — shared across all API routes.
 * Applies bot detection and attack shield in LIVE mode.
 * Use aj.withRule(tokenBucket(...)) on rate-sensitive routes.
 */
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
  ],
});
