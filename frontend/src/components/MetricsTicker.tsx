"use client";

import React from "react";

export default function MetricsTicker() {
  const items = [
    { label: "PIPELINE_STATUS", val: "STABLE", color: "text-[#10B981]" },
    { label: "MAPPING_ACCURACY", val: "99.4%", color: "text-white" },
    { label: "AVG_LLM_LATENCY", val: "420MS", color: "text-[#06B6D4]" },
    { label: "BATCH_CONCURRENCY", val: "3_MAX", color: "text-white" },
    { label: "CRM_TARGETS", val: "15_FIELDS", color: "text-[#8B5CF6]" },
    { label: "API_RETRIES", val: "2_LIMIT", color: "text-white" },
    { label: "DATA_ORBS", val: "ONLINE", color: "text-[#10B981]" }
  ];

  // Duplicate items twice to enable seamless looping scroll
  const scrollItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full h-[60px] bg-black/40 border-y border-white/5 overflow-hidden flex items-center select-none ticker-container relative">
      {/* Scrollable Track */}
      <div className="flex gap-16 whitespace-nowrap ticker-animated flex-nowrap w-max">
        {scrollItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest text-[#52525B] uppercase font-bold">
              {item.label} //
            </span>
            <span className={`text-sm font-mono tracking-wider font-semibold ${item.color}`}>
              {item.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
