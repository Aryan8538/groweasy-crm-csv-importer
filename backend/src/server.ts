import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import Papa from "papaparse";
import { processRowsWithLLM } from "./services/llm.service";
import { validateAndNormalize } from "./services/validation";
import { CrmRecord, SkippedRecord } from "./types";
import { CORS_ORIGINS, MAX_FILE_BYTES, PORT } from "./config";

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for frontend - dynamically allow any requesting origin to avoid configuration mismatches
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());

// Configure Multer for memory storage (stateless file parsing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_BYTES
  },
  fileFilter: (req, file, cb) => {
    // Only accept CSV files
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    apiKeysPresent: {
      groq: !!process.env.GROQ_API_KEY,
      gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      openai: !!process.env.OPENAI_API_KEY
    }
  });
});

/**
 * POST /api/import
 * Processes an uploaded CSV, batch maps fields via LLM, post-validates, and returns results
 */
app.post(
  "/api/import",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Convert CSV buffer to string
      const csvData = req.file.buffer.toString("utf-8");

      // Parse CSV client-side equivalent (header mapping)
      const parsed = Papa.parse<Record<string, string>>(csvData, {
        header: true,
        skipEmptyLines: "greedy"
      });

      if (parsed.errors.length > 0 && parsed.data.length === 0) {
        res.status(400).json({
          error: "Failed to parse CSV file",
          details: parsed.errors
        });
        return;
      }

      const rows = parsed.data;
      if (rows.length === 0) {
        res.status(400).json({ error: "Uploaded CSV file is empty" });
        return;
      }

      // Add a limit of 100 rows for demo performance and API quota protection
      if (rows.length > 100) {
        res.status(400).json({
          error: `File contains ${rows.length} rows. For performance and API rate-limiting, imports are limited to a maximum of 100 rows per file during the demo.`
        });
        return;
      }

      // Determine client request style: SSE stream or simple JSON
      const acceptHeader = req.headers.accept;
      const isEventStream = acceptHeader && acceptHeader.includes("text/event-stream");

      if (isEventStream) {
        // Setup SSE Headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders(); // Establish connection

        // Send initial progress
        res.write(`data: ${JSON.stringify({ type: "progress", processed: 0, total: rows.length })}\n\n`);

        try {
          // Process rows using LLM
          const llmResults = await processRowsWithLLM(rows, (processed, total) => {
            res.write(`data: ${JSON.stringify({ type: "progress", processed, total })}\n\n`);
          });

          // Post-process LLM results with the validation layer
          const imported: CrmRecord[] = [];
          const skipped: SkippedRecord[] = [];

          // Map mapped records to original row data for traceability
          const resultsMap = new Map<number, any>();
          llmResults.forEach((r) => {
            if (r && typeof r.index === "number") {
              resultsMap.set(r.index, r);
            }
          });

          // Run validation for every original row
          rows.forEach((originalRow, index) => {
            const mappedRow = resultsMap.get(index);

            if (!mappedRow) {
              // Row was skipped entirely by LLM or failed to echo index
              skipped.push({
                originalIndex: index,
                rowObject: originalRow,
                reason: "Excluded during LLM mapping stage"
              });
              return;
            }

            const validation = validateAndNormalize(mappedRow, index, originalRow);
            if (validation.isValid && validation.record) {
              imported.push(validation.record);
            } else if (validation.skipped) {
              skipped.push(validation.skipped);
            }
          });

          const summary = {
            imported,
            skipped,
            totalImported: imported.length,
            totalSkipped: skipped.length
          };

          res.write(`data: ${JSON.stringify({ type: "complete", data: summary })}\n\n`);
          res.end();
        } catch (err: any) {
          console.error("LLM processing or validation error during stream:", err);
          res.write(`data: ${JSON.stringify({ type: "error", error: err.message || "Internal processing error" })}\n\n`);
          res.end();
        }
      } else {
        // Standard HTTP JSON response
        try {
          const llmResults = await processRowsWithLLM(rows);

          const imported: CrmRecord[] = [];
          const skipped: SkippedRecord[] = [];

          const resultsMap = new Map<number, any>();
          llmResults.forEach((r) => {
            if (r && typeof r.index === "number") {
              resultsMap.set(r.index, r);
            }
          });

          rows.forEach((originalRow, index) => {
            const mappedRow = resultsMap.get(index);

            if (!mappedRow) {
              skipped.push({
                originalIndex: index,
                rowObject: originalRow,
                reason: "Excluded during LLM mapping stage"
              });
              return;
            }

            const validation = validateAndNormalize(mappedRow, index, originalRow);
            if (validation.isValid && validation.record) {
              imported.push(validation.record);
            } else if (validation.skipped) {
              skipped.push(validation.skipped);
            }
          });

          res.json({
            imported,
            skipped,
            totalImported: imported.length,
            totalSkipped: skipped.length
          });
        } catch (err: any) {
          console.error("LLM processing error:", err);
          res.status(500).json({ error: "Failed to process import", details: err.message });
        }
      }
    } catch (error: any) {
      next(error);
    }
  }
);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Express App Error:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});
