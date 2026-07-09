export type CrmStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots";

export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus | "";
  crm_note: string;
  data_source: DataSource | "";
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  originalIndex: number;
  rowObject: CsvRow;
  reason: string;
}

export interface ImportResult {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
}

/** A single parsed CSV row, keyed by its (arbitrary, user-supplied) headers. */
export type CsvRow = Record<string, string>;

/** LLM providers supported for the mapping stage, in priority order. */
export type LlmProvider = "groq" | "gemini";

/**
 * A source row handed to the mapping stage, tagged with its absolute position
 * in the upload so results can be traced back to the original row.
 */
export interface IndexedCsvRow {
  index: number;
  [column: string]: string | number;
}

/**
 * The intermediate record emitted by the mapping stage (LLM or heuristic),
 * before deterministic validation. Every field is best-effort and untrusted —
 * `validateAndNormalize` is responsible for turning this into a `CrmRecord`.
 * `index` ties the mapped record back to its `IndexedCsvRow`.
 */
export interface MappedRow {
  index: number;
  created_at?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
  /** Some mappings pre-split the phone under the CRM field name. */
  mobile_without_country_code?: string;
}

/** Result of validating a single mapped record. */
export interface ValidationResult {
  isValid: boolean;
  record?: CrmRecord;
  skipped?: SkippedRecord;
}
