"use client";

import React, { useState } from "react";
import FileUpload from "./FileUpload";
import PreviewTable from "./PreviewTable";
import ResultsView from "./ResultsView";
import { ImportResult } from "../types";
import { Loader2, AlertCircle } from "lucide-react";

type WizardStep = "upload" | "preview" | "loading" | "results";

export default function ImportWizard() {
  const [step, setStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Loading states
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileParsed = (
    name: string,
    size: number,
    hdrs: string[],
    dataRows: Record<string, string>[],
    file: File
  ) => {
    setFileName(name);
    setFileSize(size);
    setHeaders(hdrs);
    setRows(dataRows);
    setRawFile(file);
    setError(null);
    setStep("preview");
  };

  const handleConfirmImport = async () => {
    if (!rawFile) return;
    setStep("loading");
    setError(null);
    setProgress({ processed: 0, total: rows.length });

    const formData = new FormData();
    formData.append("file", rawFile);

    try {
      const response = await fetch("http://localhost:5000/api/import", {
        method: "POST",
        headers: {
          Accept: "text/event-stream"
        },
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      const isStream = contentType && contentType.includes("text/event-stream");

      if (isStream) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (!reader) {
          throw new Error("Failed to initialize stream reader on browser response");
        }

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Save the last incomplete line back to the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.substring(6).trim();
              const parsed = JSON.parse(jsonStr);

              if (parsed.type === "progress") {
                setProgress({ processed: parsed.processed, total: parsed.total });
              } else if (parsed.type === "complete") {
                setResult(parsed.data);
                setStep("results");
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              }
            }
          }
        }
      } else {
        // Fallback for non-streamed JSON response
        const data: ImportResult = await response.json();
        setResult(data);
        setStep("results");
      }
    } catch (err: any) {
      console.error("Import processing failed:", err);
      setError(err.message || "An unexpected network or backend error occurred.");
      setStep("preview");
    }
  };

  const handleReset = () => {
    setFileName("");
    setFileSize(0);
    setHeaders([]);
    setRows([]);
    setRawFile(null);
    setResult(null);
    setError(null);
    setStep("upload");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Wizard Steps Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-10 px-4">
        {[
          { label: "Upload CSV", stepName: "upload" },
          { label: "Preview Data", stepName: "preview" },
          { label: "AI Mapping", stepName: "loading" },
          { label: "Results", stepName: "results" }
        ].map((item, index) => {
          const isActive = step === item.stepName;
          const stepsOrder = ["upload", "preview", "loading", "results"];
          const isCompleted = stepsOrder.indexOf(step) > index;

          return (
            <React.Fragment key={item.stepName}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs border-2 transition-all duration-300
                    ${
                      isActive
                        ? "bg-[#FFFFFF] border-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-110"
                        : isCompleted
                        ? "bg-transparent border-white text-white"
                        : "bg-transparent border-[#27272A] text-[#A1A1AA]/45"
                    }`}
                >
                  {(index + 1).toString().padStart(2, "0")}
                </div>
                <span
                  className={`text-[10px] mt-2 font-mono tracking-wider transition-colors duration-300
                    ${
                      isActive
                        ? "text-white font-bold"
                        : isCompleted
                        ? "text-[#A1A1AA]"
                        : "text-[#A1A1AA]/45"
                    }`}
                >
                  {item.label.toUpperCase()}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-[1px] mx-2 -mt-6 transition-all duration-500
                    ${
                      isCompleted
                        ? "bg-white"
                        : "bg-[#27272A]"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Wizard Step Body */}
      <div className="w-full max-w-6xl transition-all duration-300">
        {step === "upload" && (
          <FileUpload onFileParsed={handleFileParsed} />
        )}

        {step === "preview" && (
          <div className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-[#18181B] border border-[#ef4444]/40 rounded-lg text-[#ef4444] text-xs font-mono max-w-2xl mx-auto w-full">
                <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
                <span>ERROR // {error.toUpperCase()}</span>
              </div>
            )}
            <PreviewTable
              fileName={fileName}
              fileSize={fileSize}
              headers={headers}
              rows={rows}
              onConfirm={handleConfirmImport}
              onCancel={handleReset}
            />
          </div>
        )}

        {step === "loading" && (
          <div className="cortex-glass-card border border-white/5 p-12 text-center max-w-md mx-auto flex flex-col items-center pulse-glow">
            <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
            <h3 className="text-xl font-display font-bold text-white mb-2">NORMALIZING_MODULE</h3>
            <p className="text-xs font-sans text-[#A1A1AA] mb-6">
              AI model mapping schema interfaces and aligning indices.
            </p>
            
            {/* Progress metrics */}
            <div className="w-full bg-[#050505] border border-white/10 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-white h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                style={{
                  width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%`
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#A1A1AA] w-full font-mono">
              <span>MAPPING_CRM_LAYERS</span>
              <span>
                {progress.processed} / {progress.total} MAPPED
              </span>
            </div>
          </div>
        )}

        {step === "results" && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
