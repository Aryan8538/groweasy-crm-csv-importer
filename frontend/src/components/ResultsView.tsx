"use client";

import React, { useState } from "react";
import { CheckCircle, AlertTriangle, RotateCcw, FileJson, FileSpreadsheet } from "lucide-react";
import { ImportResult, CrmRecord, SkippedRecord } from "../types";

interface ResultsViewProps {
  result: ImportResult;
  onReset: () => void;
}

export default function ResultsView({ result, onReset }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<"imported" | "skipped">("imported");

  // Helper to convert objects to CSV format
  const downloadCsv = () => {
    if (result.imported.length === 0) return;
    
    const headers = [
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description"
    ];

    const csvRows = [
      headers.join(","), // header row
      ...result.imported.map(row => 
        headers.map(header => {
          const val = row[header as keyof CrmRecord] || "";
          // Escape quotes
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(",")
      )
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `groweasy_imported_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to download JSON data
  const downloadJson = () => {
    if (result.imported.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result.imported, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `groweasy_imported_leads_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Dashboard KPI summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        <div className="cortex-glass-card border border-white/5 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 text-white rounded-lg border border-white/10">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-mono text-[#A1A1AA] tracking-widest uppercase">MAPPED_MODULES</p>
              <h3 className="text-3xl font-display font-extrabold text-white mt-1">
                {result.totalImported} <span className="text-xs font-mono text-[#A1A1AA]/60">RECS</span>
              </h3>
            </div>
          </div>
          {result.imported.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={downloadCsv}
                title="Export CSV"
                className="p-2.5 bg-transparent text-white border border-white/10 hover:border-white rounded-full transition duration-200 cursor-pointer flex items-center justify-center"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>
              <button
                onClick={downloadJson}
                title="Export JSON"
                className="p-2.5 bg-transparent text-white border border-white/10 hover:border-white rounded-full transition duration-200 cursor-pointer flex items-center justify-center"
              >
                <FileJson className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="cortex-glass-card border border-white/5 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 text-white rounded-lg border border-white/10">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-mono text-[#A1A1AA] tracking-widest uppercase">SKIPPED_RECORDS</p>
              <h3 className="text-3xl font-display font-extrabold text-[#A1A1AA] mt-1">
                {result.totalSkipped} <span className="text-xs font-mono text-[#A1A1AA]/60">RECS</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-mono bg-transparent text-white border border-white/10 hover:border-white rounded-full transition duration-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RESET_MODULE
          </button>
        </div>
      </div>

      {/* Main Results Display Panels */}
      <div className="cortex-glass-card border border-white/5 overflow-hidden flex flex-col w-full min-h-[450px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#27272A] bg-[#18181B]/50 justify-between items-center px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("imported")}
              className={`py-4 px-6 text-xs font-mono border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === "imported"
                  ? "border-white text-white font-semibold"
                  : "border-transparent text-[#A1A1AA] hover:text-white"
              }`}
            >
              NORM_CRM_LEADS // {result.totalImported}
            </button>
            <button
              onClick={() => setActiveTab("skipped")}
              className={`py-4 px-6 text-xs font-mono border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === "skipped"
                  ? "border-[#ef4444] text-[#ef4444] font-semibold"
                  : "border-transparent text-[#A1A1AA] hover:text-white"
              }`}
            >
              SKIP_RECORDS // {result.totalSkipped}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto max-h-[400px] bg-[#050505]">
          {activeTab === "imported" ? (
            result.imported.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center font-mono text-xs">
                <p className="text-[#A1A1AA] mb-2">NO_RECORD_NORM // ZERO CRM DATA IMPORTED</p>
                <p className="text-[#A1A1AA]/40 text-[10px]">Ensure the CSV contains valid emails or phone numbers.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs text-[#A1A1AA]">
                <thead>
                  <tr className="bg-[#18181B] border-b border-[#27272A]">
                    <th className="p-3 pl-6 font-mono text-[10px] uppercase text-[#A1A1AA]">Created At</th>
                    <th className="p-3 font-mono text-[10px] uppercase text-[#A1A1AA]">Name</th>
                    <th className="p-3 font-mono text-[10px] uppercase text-[#A1A1AA]">Email</th>
                    <th className="p-3 font-mono text-[10px] uppercase text-[#A1A1AA]">Phone</th>
                    <th className="p-3 font-mono text-[10px] uppercase text-[#A1A1AA]">Status</th>
                    <th className="p-3 font-mono text-[10px] uppercase text-[#A1A1AA]">Source</th>
                    <th className="p-3 font-mono text-[10px] uppercase text-[#A1A1AA]">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/40 font-mono text-[11px]">
                  {result.imported.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-[#18181B]/10">
                      <td className="p-3 pl-6 whitespace-nowrap text-[#A1A1AA]/50">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-GB") : "-"}
                      </td>
                      <td className="p-3 font-bold text-white whitespace-nowrap">{lead.name || "-"}</td>
                      <td className="p-3 whitespace-nowrap text-white">{lead.email || "-"}</td>
                      <td className="p-3 whitespace-nowrap text-[#A1A1AA] font-mono">
                        {lead.country_code ? `${lead.country_code} ` : ""}
                        {lead.mobile_without_country_code || "-"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {lead.crm_status ? (
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold border ${
                            lead.crm_status === "GOOD_LEAD_FOLLOW_UP"
                              ? "bg-white/5 text-white border-white/20"
                              : lead.crm_status === "SALE_DONE"
                              ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                              : lead.crm_status === "DID_NOT_CONNECT"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20"
                          }`}>
                            {lead.crm_status}
                          </span>
                        ) : (
                          <span className="text-[#A1A1AA]/30">-</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {lead.data_source ? (
                          <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] rounded-[4px] text-[9px] text-white">
                            {lead.data_source}
                          </span>
                        ) : (
                          <span className="text-[#A1A1AA]/30">-</span>
                        )}
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-[#A1A1AA]/70" title={lead.crm_note}>
                        {lead.crm_note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : result.skipped.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center font-mono text-xs">
              <p className="text-[#A1A1AA]">SKIP_LIST_EMPTY // ALL RECORDS IMPORTED SUCCESSFULLY</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs text-[#A1A1AA]">
              <thead>
                <tr className="bg-[#18181B] border-b border-[#27272A]">
                  <th className="p-3 pl-6 font-mono text-[10px] text-[#A1A1AA] w-16">Row</th>
                  <th className="p-3 font-mono text-[10px] text-[#A1A1AA] w-1/4">Reason</th>
                  <th className="p-3 font-mono text-[10px] text-[#A1A1AA]">Raw Record Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/40 font-mono text-[11px]">
                {result.skipped.map((skip, idx) => (
                  <tr key={idx} className="hover:bg-[#18181B]/10">
                    <td className="p-3 pl-6 text-[#A1A1AA]/50 font-mono">{(skip.originalIndex + 1).toString().padStart(3, "0")}</td>
                    <td className="p-3 text-[#f43f5e] font-semibold align-top whitespace-nowrap">{skip.reason.toUpperCase()}</td>
                    <td className="p-3 align-top">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-[#18181B]/30 p-3 rounded-lg border border-[#27272A] text-[10px]">
                        {Object.entries(skip.rowObject).map(([key, val]) => (
                          <div key={key} className="flex flex-col overflow-hidden">
                            <span className="text-[#A1A1AA]/50 font-semibold truncate">{key}:</span>
                            <span className="text-white truncate" title={val}>{val || <span className="text-[#A1A1AA]/20 italic">null</span>}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
