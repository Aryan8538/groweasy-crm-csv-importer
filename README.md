# GrowEasy AI-Powered CSV Importer

GrowEasy AI-Powered CSV Importer is a stateless, batch-processing, and schema-validating application. It takes any arbitrary CSV containing lead data (with unknown column headers, messy formatting, and combined cells) and utilizes an LLM (Groq / Gemini) to dynamically map, normalize, and extract records into GrowEasy's strict 15-field CRM schema.

---

## ⚡ Key Features

1. **AI-Driven Column Mapping**: Eliminates manual matching. The system accepts any column naming convention (`Client`, `Full Name`, `Prospect`, `Mail ID`, `Cell`, etc.) and determines the semantic meaning using the LLM.
2. **Client-Side CSV Preview**: Parses files in-browser using `PapaParse` to let users confirm they uploaded the correct file before consuming AI tokens.
3. **Real-Time Progress Streaming**: Uses **Server-Sent Events (SSE)** to stream batch-by-batch progress updates to the frontend, rendering a live progress bar.
4. **Resilient Parallel Throttling**: Batches records (~25 rows per batch) and fires requests with a concurrency limit of 3 (`p-limit`) to avoid rate-limiting, backed by exponential backoff retries.
5. **Deterministic Validation Layer**: Sanitizes LLM outputs in code. Validates enums, extracts secondary contacts (emails/phones) using regex, parses messy dates via fallbacks, and filters invalid rows to the "Skipped" dashboard.
6. **No-Setup Play Sandboxes**: Includes "Load Template" buttons in the UI that immediately run realistic test CSV files (Clean Real Estate, Messy CRM Export, Skipped Records) without needing local files or API keys.

---

## 📁 Repository Structure

```
Grow Easy Task/
├── README.md               # Project documentation
├── backend/
│   ├── src/
│   │   ├── server.ts       # Express app setup, Multer configurations, and SSE routes
│   │   ├── services/
│   │   │   ├── llm.service.ts # Groq/Gemini client, concurrency manager, retry, and local fallbacks
│   │   │   └── validation.ts  # Regex data cleaners, date fallbacks, and enum validators
│   │   └── types/
│   │       └── index.ts    # TypeScript definitions for the CRM Schema
│   ├── test-data/          # Generated test CSVs
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx    # Main landing page with glassmorphism layout
    │   │   └── layout.tsx  # Fonts, SEO metadata, and styling loaders
    │   ├── components/
    │   │   ├── ImportWizard.tsx # 4-step wizard state machine and SSE client
    │   │   ├── FileUpload.tsx   # Drag-and-drop zone and template injector
    │   │   ├── PreviewTable.tsx # Sticky header scrollable preview grid
    │   │   └── ResultsView.tsx  # Mapped vs Skipped dashboards with CSV/JSON exports
    │   ├── utils/
    │   │   └── sampleData.ts    # Raw mock CSV strings for sandbox buttons
    │   └── types/
    │       └── index.ts    # Shared TypeScript client models
    ├── package.json
    └── tsconfig.json
```

---

## 📋 CRM Schema & Output Contract

Every mapped lead is normalized to the following **15-field CRM schema**:

| Field | Type | Validation / Integrity Rules |
| :--- | :--- | :--- |
| `created_at` | `string` | Normalized to ISO format. Fails back to Indian/European standard formats, unix timestamps, or defaults to `""` (blank). |
| `name` | `string` | Full name of the prospect. |
| `email` | `string` | Primary email (first valid email found). Secondary emails are moved to `crm_note`. |
| `country_code` | `string` | E.g. `+91` or `+1`. Extracted dynamically from phone. |
| `mobile_without_country_code` | `string` | Primary phone digits. Secondary phones are moved to `crm_note`. |
| `company` | `string` | Name of the organization. |
| `city` | `string` | Client's city. |
| `state` | `string` | Client's state. |
| `country` | `string` | Client's country. |
| `lead_owner` | `string` | GrowEasy CRM lead owner (e.g. Sales Agent name). |
| `crm_status` | `enum` | One of: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`, or `""` (blank). Rejected enums are replaced with `""`. |
| `crm_note` | `string` | Overflow emails, secondary phones, notes, or raw comments merged together. |
| `data_source` | `enum` | One of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or `""` (blank). |
| `possession_time` | `string` | Projected property occupancy timeline (e.g. "Immediate", "3 months"). |
| `description` | `string` | General details. |

> [!IMPORTANT]
> **Lead Skip Rule:** A lead is skipped entirely if it contains *neither* a resolvable primary email *nor* a mobile number. It is routed to the **Skipped Records** list, along with the precise reason (e.g. *"Missing both valid email and mobile number"*).

---

## 🚀 Local Quickstart

### Prerequisite: Node.js (v18+)

1. **Clone & Open the Directory**
   Ensure you are in the `Grow Easy Task` root folder.

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   *Optional:* Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   # Add your GROQ_API_KEY or GEMINI_API_KEY to test live LLM processing.
   # If no keys are specified, the server runs in a highly robust "Local Heuristic Fallback" mode.
   ```
   Start the backend server (runs on port `5000`):
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   Open a new terminal window at the project root:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing and Verification

### 1. Automated Import Test Script (Command Line)
The backend includes a standalone test script that processes the generated CSV files directly through the mapping and validation layer.
Inside the `backend/` folder, run:
```bash
npm run test:import
```
This script runs a test suite against 4 distinct CSV layouts:
- `clean_real_estate.csv` (correct fields, standard mapping)
- `messy_leads.csv` (multiple emails/phones, fuzzy status/dates)
- `skipped_leads.csv` (tests lead filtering conditions)
- `large_leads.csv` (60 rows, tests parallel chunk processing)

### 2. Browser Verification (Front-End Sandbox)
When you navigate to `http://localhost:3000`, scroll to the bottom of the page to find the **"Or try out-of-the-box templates"** section. Click any of the three buttons to inject sample data immediately. You can confirm import and verify the progress bar, schema mapping, and results dashboards without needing to find or create a CSV locally!
