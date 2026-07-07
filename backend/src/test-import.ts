import fs from "fs";
import path from "path";
import Papa from "papaparse";
import dotenv from "dotenv";
import { processRowsWithLLM } from "./services/llm.service";
import { validateAndNormalize } from "./services/validation";
import { CrmRecord, SkippedRecord } from "./types";

// Load env configurations
dotenv.config();

async function runTest(fileName: string) {
  const filePath = path.join(__dirname, "../test-data", fileName);
  console.log(`\n==================================================`);
  console.log(`Running Import Test for file: ${fileName}`);
  console.log(`==================================================`);

  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");

  // Parse CSV content
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: "greedy"
  });

  const rows = parsed.data;
  console.log(`Parsed raw rows: ${rows.length}`);

  console.log("Processing with LLM mapping (or local heuristics if key is missing)...");
  const startTime = Date.now();
  
  const llmResults = await processRowsWithLLM(rows, (processed, total) => {
    console.log(`Progress: ${processed}/${total} rows processed...`);
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`LLM Mapping finished in ${duration}s.`);

  // Validation layer
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

  console.log(`\nTest results for ${fileName}:`);
  console.log(`- Successfully Imported: ${imported.length}`);
  console.log(`- Skipped (Failed Validation/Filter): ${skipped.length}`);

  if (imported.length > 0) {
    console.log("\nSample Mapped Record (First Item):");
    console.log(JSON.stringify(imported[0], null, 2));
  }

  if (skipped.length > 0) {
    console.log("\nSample Skipped Record (First Item):");
    console.log(JSON.stringify(skipped[0], null, 2));
  }
}

async function startTests() {
  try {
    // Check if we are running in mock mode or live mode
    const isMock = !process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY;
    if (isMock) {
      console.log("ℹ️ No API keys detected. Tests will run using local heuristic fuzzy mapping.");
    } else {
      console.log("🚀 API key detected. Running tests with live LLM processing.");
    }

    await runTest("clean_real_estate.csv");
    await runTest("messy_leads.csv");
    await runTest("skipped_leads.csv");
    await runTest("large_leads.csv");

    console.log("\n✅ All tests executed successfully!");
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

startTests();
