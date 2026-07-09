"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { UploadCloud, FileSpreadsheet, AlertCircle } from "lucide-react";
import { SAMPLES } from "../utils/sampleData";

interface FileUploadProps {
  onFileParsed: (
    fileName: string,
    fileSize: number,
    headers: string[],
    rows: Record<string, string>[],
    rawFile: File
  ) => void;
}

export default function FileUpload({ onFileParsed }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    setError(null);

    // Validate type
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Please upload a valid CSV file (.csv)");
      return;
    }

    // Size validation (limit to 5MB for safety)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller CSV file.");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError("Failed to parse CSV file. Ensure it is formatted correctly.");
          return;
        }

        const rows = results.data;
        if (rows.length === 0) {
          setError("The uploaded CSV file contains no data rows.");
          return;
        }

        const headers = results.meta.fields || Object.keys(rows[0] || {});
        if (headers.length === 0) {
          setError("No headers found in the CSV file.");
          return;
        }

        onFileParsed(file.name, file.size, headers, rows, file);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  }, [onFileParsed]);

  const handleLoadSample = (type: "clean" | "messy" | "skipped") => {
    const sample = SAMPLES[type];
    const file = new File([sample.content], sample.name, { type: "text/csv" });
    processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Upload Box */}
      <div
        className={`synapse-glass-card border border-dashed p-12 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragActive 
            ? "border-white bg-white/[0.05] scale-[1.01]" 
            : "border-white/10 hover:border-white/30 hover:bg-white/[0.03]"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".csv,text/csv"
          onChange={handleChange}
        />

        <div className="p-4 bg-white/5 rounded-full text-white mb-6 hover:scale-105 transition-transform duration-300 border border-white/10">
          <UploadCloud className="w-12 h-12" />
        </div>

        <h3 className="text-xl font-display font-semibold mb-2 text-white">
          Upload Lead CSV Document
        </h3>
        <p className="text-xs sm:text-sm text-[#A1A1AA] font-sans mb-6">
          Drag & drop your CSV file here, or click to browse (Max 5MB)
        </p>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#030303] rounded-full border border-white/5 text-xs text-[#A1A1AA] font-mono">
          <FileSpreadsheet className="w-4 h-4 text-white" />
          SYSTEM INPUT // SUPPORTING REAL ESTATE & AD EXPORTS
        </div>
      </div>

      {/* Quick Test Templates */}
      <div className="flex flex-col items-center gap-4 py-2">
        <span className="text-[9px] font-mono text-[#A1A1AA]/50 tracking-widest uppercase">
          Inject Sandbox Data Modules
        </span>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => handleLoadSample("clean")}
            className="px-4 py-2.5 bg-transparent border border-white/10 hover:border-white text-xs font-mono text-[#A1A1AA] hover:text-white rounded-full transition duration-200 cursor-pointer"
          >
            SYS_MOCK // CLEAN_REAL_ESTATE
          </button>
          <button
            onClick={() => handleLoadSample("messy")}
            className="px-4 py-2.5 bg-transparent border border-white/10 hover:border-white text-xs font-mono text-[#A1A1AA] hover:text-white rounded-full transition duration-200 cursor-pointer"
          >
            SYS_MOCK // MESSY_LEADS
          </button>
          <button
            onClick={() => handleLoadSample("skipped")}
            className="px-4 py-2.5 bg-transparent border border-white/10 hover:border-white text-xs font-mono text-[#A1A1AA] hover:text-white rounded-full transition duration-200 cursor-pointer"
          >
            SYS_MOCK // SKIPPED_LEADS
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-black border border-[#f43f5e]/30 rounded-lg text-[#f43f5e] text-xs font-mono">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#f43f5e]" />
          <span>ERROR // {error.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
