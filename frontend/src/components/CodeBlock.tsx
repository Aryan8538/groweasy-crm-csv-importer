"use client";

import React from "react";
import { Terminal, Copy, Check } from "lucide-react";

export default function CodeBlock() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`import { CrmRecord, CrmStatus } from "./types";

// GrowEasy strict 15-field lead schema contract
export const crmSchema = {
  created_at: "ISO_8601_STRING",
  name: "PROSPECT_FULL_NAME",
  email: "PRIMARY_EMAIL_CELL",
  country_code: "DIALING_PREFIX_CODE",
  mobile_without_country_code: "MOBILE_DIGITS",
  crm_status: CrmStatus.GOOD_LEAD_FOLLOW_UP,
  data_source: "meridian_tower" | "eden_park",
  crm_note: "CONCATENATED_ADDITIONAL_CONTACTS"
};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#080808]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* IDE Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f43f5e]/30 border border-[#f43f5e]/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-[#10b981]/30 border border-[#10b981]/50" />
        </div>
        <div className="text-[10px] font-mono text-[#A1A1AA]/50 tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          groweasy-crm-schema.ts
        </div>
        <button
          onClick={handleCopy}
          className="text-[#A1A1AA] hover:text-white transition duration-200 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Code Area */}
      <pre className="p-8 text-left overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-[#A1A1AA] bg-black/20">
        <code>
          <span className="text-[#8B5CF6]">import</span> {"{"} <span className="text-[#06B6D4]">CrmRecord</span>, <span className="text-[#06B6D4]">CrmStatus</span> {"}"} <span className="text-[#8B5CF6]">from</span> <span className="text-[#10B981]">"./types"</span>;<br /><br />
          <span className="text-[#52525B]">{"//"} GrowEasy strict 15-field lead schema contract</span><br />
          <span className="text-[#8B5CF6]">export const</span> <span className="text-[#06B6D4]">crmSchema</span> = {"{"}<br />
          {"  "}created_at: <span className="text-[#10B981]">"ISO_8601_STRING"</span>,<br />
          {"  "}name: <span className="text-[#10B981]">"PROSPECT_FULL_NAME"</span>,<br />
          {"  "}email: <span className="text-[#10B981]">"PRIMARY_EMAIL_CELL"</span>,<br />
          {"  "}country_code: <span className="text-[#10B981]">"DIALING_PREFIX_CODE"</span>,<br />
          {"  "}mobile_without_country_code: <span className="text-[#10B981]">"MOBILE_DIGITS"</span>,<br />
          {"  "}crm_status: <span className="text-[#06B6D4]">CrmStatus</span>.<span className="text-[#8B5CF6]">GOOD_LEAD_FOLLOW_UP</span>,<br />
          {"  "}data_source: <span className="text-[#10B981]">"meridian_tower"</span> | <span className="text-[#10B981]">"eden_park"</span>,<br />
          {"  "}crm_note: <span className="text-[#10B981]">"CONCATENATED_ADDITIONAL_CONTACTS"</span><br />
          {"}"};
        </code>
      </pre>
    </div>
  );
}
