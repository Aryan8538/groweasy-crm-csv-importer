"use client";

import React from "react";
import { FileText, ArrowRight, X } from "lucide-react";

interface PreviewTableProps {
  fileName: string;
  fileSize: number;
  headers: string[];
  rows: Record<string, string>[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PreviewTable({
  fileName,
  fileSize,
  headers,
  rows,
  onConfirm,
  onCancel
}: PreviewTableProps) {
  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Preview only the first 50 rows in the UI to prevent browser lagging
  const previewRows = rows.slice(0, 50);

  return (
    <div className="w-full flex flex-col h-full max-h-[75vh] synapse-glass-card border border-white/5 overflow-hidden">
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-white/15 bg-black/30 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 text-white rounded-xl border border-white/10">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white truncate max-w-[250px] sm:max-w-xs">
              {fileName}
            </h4>
            <p className="text-xs font-mono text-[#A1A1AA]">
              {formatBytes(fileSize).toUpperCase()} // ROWS: {rows.length} // COLS: {headers.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-transparent text-white border border-white/10 hover:border-white text-xs font-mono tracking-widest uppercase rounded-full transition duration-200 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            Cancel Import
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-white text-black hover:bg-white/90 text-xs font-mono tracking-widest uppercase rounded-full font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Confirm & Map
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Raw Data Preview Grid */}
      <div className="flex-1 overflow-auto relative max-h-[450px] bg-[#050505]">
        <table className="w-full text-left border-collapse text-xs text-[#A1A1AA]">
          <thead>
            <tr className="bg-[#18181B] sticky top-0 z-10 border-b border-[#27272A]">
              <th className="p-3 pl-6 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-wider bg-[#18181B] w-16">
                LN
              </th>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="p-3 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-wider bg-[#18181B] min-w-[150px] truncate"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]/40 font-mono text-[11px]">
            {previewRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-[#18181B]/30 transition-colors duration-150"
              >
                <td className="p-3 pl-6 text-[#A1A1AA]/40 font-mono">
                  {(rowIdx + 1).toString().padStart(3, "0")}
                </td>
                {headers.map((header, colIdx) => (
                  <td key={colIdx} className="p-3 truncate max-w-xs font-normal text-white">
                    {row[header] !== undefined && row[header] !== null
                      ? String(row[header])
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > 50 && (
          <div className="p-4 text-center font-mono text-[10px] text-[#A1A1AA]/50 border-t border-[#27272A] bg-[#18181B]/20">
            PREVIEW_LIMIT // DISPLAYING 50 OF {rows.length} ROWS. ALL REMAINING ROWS WILL BE NORMALIZED IN CHUNKS.
          </div>
        )}
      </div>
    </div>
  );
}
