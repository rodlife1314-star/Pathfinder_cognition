import React from "react";
import { OctagonAudit } from "../types";
import { Scale, CheckSquare, ShieldCheck } from "lucide-react";

interface OctagonSectionProps {
  audit: OctagonAudit | null;
}

export default function OctagonSection({ audit }: OctagonSectionProps) {
  if (!audit) {
    return (
      <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex items-center justify-center text-center h-[180px] text-gray-500 font-mono text-xs">
        [V. OCTAGON SOVEREIGNTY SYSTEM. COMPILE INQUIRY UNCERTAINTY TO VIEW INTEGRITY AUDITING SCHEMA]
      </div>
    );
  }

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 space-y-4" id="octagon-section-module">
      {/* Header Block */}
      <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-2">
        <Scale className="h-4.5 w-4.5" />
        <span>V. OCTAGON (Governance & Compliance)</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950/40 border border-gray-850 rounded-lg p-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none">
            Sovereign Protocol Check
          </span>
          <h4 className="text-xs font-display font-black text-emerald-400 tracking-wider">
            {audit.complianceLevel.toUpperCase()}
          </h4>
          <p className="text-[11px] text-gray-400 leading-normal max-w-[500px]">
            {audit.operatorSovereigntyNotes}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-emerald-500 border border-emerald-950 bg-emerald-950/20 px-2 py-1 rounded">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-mono font-bold tracking-wider">APPROVED</span>
        </div>
      </div>

      {audit.guidelinesChecked && audit.guidelinesChecked.length > 0 && (
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
            Governance Standard Audits Pass
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {audit.guidelinesChecked.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-gray-950/30 border border-gray-850 p-2 rounded"
              >
                <CheckSquare className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
