import Groq from "groq-sdk";
import pLimit from "p-limit";
import {
  BATCH_SIZE,
  GEMINI_MODEL,
  GROQ_MODEL,
  HEURISTIC_BATCH_DELAY_MS,
  LLM_CONCURRENCY,
  LLM_MAX_RETRIES,
  LLM_RETRY_BASE_DELAY_MS
} from "../config";
import { CsvRow, IndexedCsvRow, MappedRow } from "../types";

// Helper to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = LLM_MAX_RETRIES,
  delay = LLM_RETRY_BASE_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Batch processing encountered error, retrying in ${delay}ms...`, error);
    await wait(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Standard fuzzy text matcher for local heuristic fallback
 */
function fuzzyMatchKey(headers: string[], targets: string[]): string | null {
  for (const header of headers) {
    const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const target of targets) {
      if (cleanHeader.includes(target)) {
        return header;
      }
    }
  }
  return null;
}

/**
 * Deterministic local mapper fallback when no API keys are present
 */
function localHeuristicMapper(rows: CsvRow[]): MappedRow[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);

  // Define keyword mapping targets
  const mappingRules = {
    name: ["fullname", "name", "client", "prospect", "customer", "lead", "contact"],
    email: ["emailid", "email", "mail", "addr"],
    phone: ["phone", "mobile", "contactno", "cell", "number", "tel"],
    created_at: ["date", "created", "time", "timestamp"],
    company: ["company", "org", "firm", "business", "work"],
    city: ["city", "town"],
    state: ["state", "province"],
    country: ["country", "nation"],
    lead_owner: ["owner", "assignee", "agent", "salesperson"],
    crm_status: ["status", "stage", "progress"],
    crm_note: ["remark", "note", "comment", "feedback"],
    data_source: ["datasource", "source", "channel", "campaign", "project", "property"],
    possession_time: ["possession", "timeline", "movein"],
    description: ["description", "details", "info", "about"]
  };

  // Build the mapping configuration
  const headerMap: Record<string, string> = {};
  for (const [key, keywords] of Object.entries(mappingRules)) {
    const matchedHeader = fuzzyMatchKey(headers, keywords);
    if (matchedHeader) {
      headerMap[key] = matchedHeader;
    }
  }

  // Map rows
  return rows.map((row, index) => {
    const mapped: MappedRow = { index };
    for (const key of Object.keys(mappingRules) as (keyof typeof mappingRules)[]) {
      const header = headerMap[key];
      mapped[key] = header ? row[header] ?? "" : "";
    }
    return mapped;
  });
}

/**
 * Calls Groq API to map fields
 */
async function callGroqLLM(apiKey: string, rows: IndexedCsvRow[]): Promise<MappedRow[]> {
  const groq = new Groq({ apiKey });
  const prompt = `You are a precise data extraction agent. Map the following raw CSV rows onto the target CRM schema.
  
CRM Schema Fields:
- created_at: Date of creation (parseable by JS new Date())
- name: Customer full name
- email: Primary email
- phone: Primary contact number
- company: Company name
- city: City
- state: State
- country: Country
- lead_owner: Owner/Assignee
- crm_status: Enum (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE, or blank)
- crm_note: General remarks or secondary contact details
- data_source: Enum (leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots, or blank)
- possession_time: Possession timeline (e.g. 3 months, immediate, Dec 2026)
- description: Additional details

Rules:
1. Examine the raw headers and values. Deduce the meaning. For example, headers like "Prospect", "Client", or "Buyer" map to "name".
2. Return the original "index" for each row.
3. For status fields, if the value maps to one of the enum values, output it. E.g. "Follow Up Required" -> "GOOD_LEAD_FOLLOW_UP".
4. Output a JSON object with a single key "records" containing the array of mapped rows.
5. Do NOT write any conversational prose, markdown formatting, or HTML. ONLY returning valid JSON is critical.

Input rows:
${JSON.stringify(rows, null, 2)}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a precise JSON generator. You output ONLY valid JSON matching the requested structure." },
      { role: "user", content: prompt }
    ],
    model: GROQ_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq LLM");
  }

  const parsed = JSON.parse(content);
  if (!parsed.records || !Array.isArray(parsed.records)) {
    throw new Error("Invalid response format, missing 'records' array");
  }

  return parsed.records;
}

/**
 * Calls Gemini API if GROQ key is missing but GEMINI key is present
 */
async function callGeminiLLM(apiKey: string, rows: IndexedCsvRow[]): Promise<MappedRow[]> {
  const prompt = `You are a precise data extraction agent. Map the following raw CSV rows onto the target CRM schema.
  
CRM Schema Fields:
- created_at: Date of creation (parseable by JS new Date())
- name: Customer full name
- email: Primary email
- phone: Primary contact number
- company: Company name
- city: City
- state: State
- country: Country
- lead_owner: Owner/Assignee
- crm_status: Enum (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE, or blank)
- crm_note: General remarks or secondary contact details
- data_source: Enum (leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots, or blank)
- possession_time: Possession timeline
- description: Additional details

Rules:
1. Examine the raw headers and values. Deduce the meaning.
2. Return the original "index" for each row.
3. Output a JSON object with a single key "records" containing the array of mapped rows.
4. Output ONLY valid JSON. No markdown fences.

Input rows:
${JSON.stringify(rows, null, 2)}`;

  // Use native fetch to avoid external packages complexity
  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            records: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  index: { type: "INTEGER" },
                  created_at: { type: "STRING" },
                  name: { type: "STRING" },
                  email: { type: "STRING" },
                  phone: { type: "STRING" },
                  company: { type: "STRING" },
                  city: { type: "STRING" },
                  state: { type: "STRING" },
                  country: { type: "STRING" },
                  lead_owner: { type: "STRING" },
                  crm_status: { type: "STRING" },
                  crm_note: { type: "STRING" },
                  data_source: { type: "STRING" },
                  possession_time: { type: "STRING" },
                  description: { type: "STRING" }
                },
                required: ["index"]
              }
            }
          },
          required: ["records"]
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.statusText} (${errorText})`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty text from Gemini response");
  }

  const parsed = JSON.parse(text);
  return parsed.records;
}

/**
 * Process rows in batches using LLM with parallel limits and retries
 */
export async function processRowsWithLLM(
  rows: CsvRow[],
  onProgress?: (processed: number, total: number) => void
): Promise<MappedRow[]> {
  const total = rows.length;
  if (total === 0) return [];

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const isMockMode = !groqApiKey && !geminiApiKey && !openaiApiKey;

  if (isMockMode) {
    console.warn("⚠️ No API keys (GROQ_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY) found. Running in Local Heuristic Fallback mode.");
    // Simulate slow network processing for beautiful progress bars
    const results: any[] = [];
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const chunkMapped = localHeuristicMapper(chunk);
      // Adjust chunk indices to absolute
      const adjusted = chunkMapped.map(item => ({
        ...item,
        index: item.index + i
      }));
      results.push(...adjusted);

      // Artificial delay for UI feedback
      await wait(HEURISTIC_BATCH_DELAY_MS);
      if (onProgress) {
        onProgress(Math.min(i + BATCH_SIZE, total), total);
      }
    }
    return results;
  }

  const limit = pLimit(LLM_CONCURRENCY);
  const batches: IndexedCsvRow[][] = [];

  for (let i = 0; i < total; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE).map((row, idx) => ({
      index: i + idx,
      ...row
    })));
  }

  let processedCount = 0;

  const tasks = batches.map((batch) => {
    return limit(() =>
      retryWithBackoff(async () => {
        let mappedBatch: MappedRow[];
        if (groqApiKey) {
          mappedBatch = await callGroqLLM(groqApiKey, batch);
        } else if (geminiApiKey) {
          mappedBatch = await callGeminiLLM(geminiApiKey, batch);
        } else {
          // Implement standard OpenAI if key is present
          throw new Error("OpenAI is configured in code but not yet selected as priority. Please provide Groq or Gemini API keys.");
        }

        processedCount += batch.length;
        if (onProgress) {
          onProgress(Math.min(processedCount, total), total);
        }
        return mappedBatch;
      })
    );
  });

  const results = await Promise.all(tasks);
  return results.flat();
}
