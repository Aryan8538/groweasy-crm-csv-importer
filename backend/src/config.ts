/**
 * Centralized runtime configuration.
 *
 * Every tunable constant and environment-derived value lives here so that
 * behavior can be understood and adjusted from a single place, rather than
 * being rediscovered as magic numbers scattered across the request handlers
 * and the LLM service.
 */

/** Port the HTTP server listens on. */
export const PORT = Number(process.env.PORT) || 5000;

/** Browser origins permitted to call the API (the Next.js dev server). */
export const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((url) => url.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

/** Maximum accepted upload size. Mirrored by the client-side guard. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * LLM batching and throttling.
 * Rows are grouped into batches of BATCH_SIZE and at most LLM_CONCURRENCY
 * batches are in flight at once to stay within provider rate limits.
 */
export const BATCH_SIZE = 25;
export const LLM_CONCURRENCY = 3;

/** Exponential-backoff policy for a single failed batch. */
export const LLM_MAX_RETRIES = 2;
export const LLM_RETRY_BASE_DELAY_MS = 1500;

/**
 * Artificial per-batch delay used only in heuristic (no-API-key) mode so the
 * streamed progress bar remains legible during local demos.
 */
export const HEURISTIC_BATCH_DELAY_MS = 800;

/** Provider model identifiers. */
export const GROQ_MODEL = "llama-3.3-70b-versatile";
export const GEMINI_MODEL = "gemini-1.5-flash";
