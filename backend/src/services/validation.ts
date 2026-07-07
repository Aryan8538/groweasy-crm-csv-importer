import { CrmRecord, CrmStatus, DataSource, SkippedRecord } from "../types";

// Supported CRM statuses and data sources
const VALID_CRM_STATUSES = new Set<CrmStatus>([
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE"
]);

const VALID_DATA_SOURCES = new Set<DataSource>([
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots"
]);

/**
 * Robust date parser with fallback strategies
 */
export function parseDateFallback(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (!trimmed) return "";

  // 1. Try standard JS Date parsing
  const standardDate = new Date(trimmed);
  if (!isNaN(standardDate.getTime())) {
    return standardDate.toISOString();
  }

  // 2. Try unix timestamp parsing (e.g., 1719876543 or 1719876543000)
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (trimmed.length === 10) {
      // Seconds
      return new Date(num * 1000).toISOString();
    } else if (trimmed.length === 13) {
      // Milliseconds
      return new Date(num).toISOString();
    }
  }

  // 3. Try parsing European/Indian formats like DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmYRegex = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
  const match = trimmed.match(dmYRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    const second = match[6] ? parseInt(match[6], 10) : 0;

    // Check bounds
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const parsedDate = new Date(year, month - 1, day, hour, minute, second);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
  }

  return "";
}

/**
 * Clean text fields to be CSV safe (escape newlines, strip excessive whitespace)
 */
export function makeCsvSafe(text: string | null | undefined): string {
  if (!text) return "";
  // Escape raw newlines, replace tabs with spaces
  return text
    .replace(/\r?\n/g, " ")
    .replace(/\t/g, " ")
    .trim();
}

/**
 * Extracts phone details from a string, returns primary number, country code, and secondary numbers
 */
export function extractPhones(phoneStr: string | null | undefined): {
  countryCode: string;
  primaryPhone: string;
  secondaryPhones: string[];
} {
  if (!phoneStr) {
    return { countryCode: "", primaryPhone: "", secondaryPhones: [] };
  }

  // Split by common delimiters: comma, semicolon, slash, or "and"
  const parts = phoneStr.split(/[,;/]|\band\b/i).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { countryCode: "", primaryPhone: "", secondaryPhones: [] };
  }

  const cleanCandidates = parts.map(part => {
    // Keep only digits and starting +
    const digitsAndPlus = part.replace(/[^\d+]/g, "");
    return digitsAndPlus;
  }).filter(p => p.length >= 7); // minimum realistic phone digits

  if (cleanCandidates.length === 0) {
    return { countryCode: "", primaryPhone: "", secondaryPhones: [] };
  }

  const primaryCandidate = cleanCandidates[0];
  const secondaryPhones = cleanCandidates.slice(1);

  let countryCode = "";
  let primaryPhone = primaryCandidate;

  if (primaryCandidate.startsWith("+")) {
    const digits = primaryCandidate.substring(1);
    if (digits.startsWith("91") && digits.length === 12) {
      countryCode = "+91";
      primaryPhone = digits.substring(2);
    } else if (digits.startsWith("1") && digits.length === 11) {
      countryCode = "+1";
      primaryPhone = digits.substring(1);
    } else if (digits.length > 10) {
      // Split so that the primary phone is the last 10 digits, which is standard for mobiles
      countryCode = "+" + digits.substring(0, digits.length - 10);
      primaryPhone = digits.substring(digits.length - 10);
    } else {
      countryCode = "";
      primaryPhone = digits;
    }
  } else {
    // Check if it's an Indian number starting with 91 and having 12 digits (e.g. 919876543210)
    if (primaryCandidate.startsWith("91") && primaryCandidate.length === 12) {
      countryCode = "+91";
      primaryPhone = primaryCandidate.substring(2);
    } else if (primaryCandidate.length === 10) {
      // standard 10 digit local mobile
      countryCode = "";
      primaryPhone = primaryCandidate;
    }
  }

  return { countryCode, primaryPhone, secondaryPhones };
}

/**
 * Extracts emails from a string
 */
export function extractEmails(emailStr: string | null | undefined): {
  primaryEmail: string;
  secondaryEmails: string[];
} {
  if (!emailStr) {
    return { primaryEmail: "", secondaryEmails: [] };
  }

  // Regex to find email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = emailStr.match(emailRegex);

  if (!matches || matches.length === 0) {
    return { primaryEmail: "", secondaryEmails: [] };
  }

  return {
    primaryEmail: matches[0].toLowerCase().trim(),
    secondaryEmails: matches.slice(1).map(e => e.toLowerCase().trim())
  };
}

/**
 * Validates and normalizes raw output records from the LLM
 */
export function validateAndNormalize(
  rawRecord: any,
  originalRowIndex: number,
  originalRowObject: Record<string, string>
): { isValid: boolean; record?: CrmRecord; skipped?: SkippedRecord } {
  try {
    // 1. Raw contact fields extraction
    const rawEmail = rawRecord.email || "";
    const rawPhone = rawRecord.phone || rawRecord.mobile_without_country_code || "";

    const { primaryEmail, secondaryEmails } = extractEmails(rawEmail);
    const { countryCode, primaryPhone, secondaryPhones } = extractPhones(rawPhone);

    // Skip condition check: both email and phone are empty
    if (!primaryEmail && !primaryPhone) {
      return {
        isValid: false,
        skipped: {
          originalIndex: originalRowIndex,
          rowObject: originalRowObject,
          reason: "Missing both valid email and mobile number"
        }
      };
    }

    // 2. Validate Enums
    let crmStatus: CrmStatus | "" = "";
    if (rawRecord.crm_status) {
      const statusUpper = rawRecord.crm_status.trim().toUpperCase().replace(/\s+/g, "_");
      if (VALID_CRM_STATUSES.has(statusUpper as CrmStatus)) {
        crmStatus = statusUpper as CrmStatus;
      }
    }

    let dataSource: DataSource | "" = "";
    if (rawRecord.data_source) {
      const sourceLower = rawRecord.data_source.trim().toLowerCase().replace(/[-\s]+/g, "_");
      if (VALID_DATA_SOURCES.has(sourceLower as DataSource)) {
        dataSource = sourceLower as DataSource;
      }
    }

    // 3. Normalize Date
    const createdAt = parseDateFallback(rawRecord.created_at);

    // 4. Build CRM note with extra contact info and unmapped helpful things
    let crmNote = rawRecord.crm_note ? rawRecord.crm_note.trim() : "";
    
    // Append secondary emails
    if (secondaryEmails.length > 0) {
      const extraEmailsStr = `[Additional Emails: ${secondaryEmails.join(", ")}]`;
      crmNote = crmNote ? `${crmNote} ${extraEmailsStr}` : extraEmailsStr;
    }

    // Append secondary phone numbers
    if (secondaryPhones.length > 0) {
      const extraPhonesStr = `[Additional Phones: ${secondaryPhones.join(", ")}]`;
      crmNote = crmNote ? `${crmNote} ${extraPhonesStr}` : extraPhonesStr;
    }

    // Escape all fields to ensure CSV safety
    const record: CrmRecord = {
      created_at: createdAt,
      name: makeCsvSafe(rawRecord.name || ""),
      email: primaryEmail,
      country_code: countryCode,
      mobile_without_country_code: primaryPhone,
      company: makeCsvSafe(rawRecord.company || ""),
      city: makeCsvSafe(rawRecord.city || ""),
      state: makeCsvSafe(rawRecord.state || ""),
      country: makeCsvSafe(rawRecord.country || ""),
      lead_owner: makeCsvSafe(rawRecord.lead_owner || ""),
      crm_status: crmStatus,
      crm_note: makeCsvSafe(crmNote),
      data_source: dataSource,
      possession_time: makeCsvSafe(rawRecord.possession_time || ""),
      description: makeCsvSafe(rawRecord.description || "")
    };

    return { isValid: true, record };
  } catch (error: any) {
    return {
      isValid: false,
      skipped: {
        originalIndex: originalRowIndex,
        rowObject: originalRowObject,
        reason: `Validation layer exception: ${error.message || error}`
      }
    };
  }
}
