import React, { useState } from "react";
import { Pathway, TensionMap, OctagonAudit } from "../types";
import { KeyRound, ShieldAlert, CheckCircle, Download, FileJson } from "lucide-react";

interface CrystalBridgeSectionProps {
  selectedPath: Pathway | null;
  tension: TensionMap | null;
  audit: OctagonAudit | null;
  operatorName: string;
  onDispatchApproved: (directiveText: string, signature: string) => void;
  dispatchedDirectiveText: string | null;
  dispatchedSignature: string | null;
}

export default function CrystalBridgeSection({
  selectedPath,
  tension,
  audit,
  operatorName,
  onDispatchApproved,
  dispatchedDirectiveText,
  dispatchedSignature
}: CrystalBridgeSectionProps) {
  const [sigInput, setSigInput] = useState("");

  const handleAuthorize = () => {
    if (!sigInput.trim()) {
      alert("Verification signature is required to stamp approval onto decision-ledger.");
      return;
    }

    if (!selectedPath) {
      alert("A path must be actively highlighted in the SIMON Trajectories ledger.");
      return;
    }

    // Generate comprehensive textual structured decision proof sheet
    const proofText = `
======================================================================
               DELTA DECISION PROOF RECORD
======================================================================
Operator Name: ${operatorName.toUpperCase()}
Fiduciary System Domain: GOVERNED DECISION MATRIX
Authorization ID: DELTA-DISPATCH-${Math.random().toString(36).slice(2, 8).toUpperCase()}
Timestamp (UTC): ${new Date().toISOString()}

----------------------------------------------------------------------
1. COGNITIVE FORMULATION (AETHER)
----------------------------------------------------------------------
Tension Matrix: [ ${tension?.tensionTitle || "OPEN INQUIRY"} ]
Summary Narrative:
${tension?.tensionSummary || "No active tension mapped."}

Uncertainty Forces: 
${tension?.coreConflictingForces.map(tag => ` - [ ${tag} ]`).join("\n") || "Open Loop"}

----------------------------------------------------------------------
2. TRAJECTORY ADOPTED FOR COMMAND (SIMON)
----------------------------------------------------------------------
Chosen Route Posture: [ ${selectedPath.type.toUpperCase()} ]
Model Trajectory Name: ${selectedPath.name}
Scope & Rules:
${selectedPath.description}

Governing Protocol Law:
${selectedPath.governingRule}

----------------------------------------------------------------------
3. CLAIM TRACEABILITY (JEMMA VERATOR)
----------------------------------------------------------------------
Claims verified:
${selectedPath.traceableFindings.map((finding, idx) => `
Node [${idx + 1}] Level: [${finding.status.toUpperCase()}]
Statement: ${finding.statement}
${finding.quote ? `Verification Quote Verbatim: "${finding.quote}"\nSource: ${finding.source || "Provenance File Table"}` : "WARNING: This node is formulated by assumption. Traceable evidence not found."}
`).join("\n")}

----------------------------------------------------------------------
4. INTEGRITY LAW COMPLIANCE AUDIT (OCTAGON)
----------------------------------------------------------------------
Sovereignty Review: ${audit?.complianceLevel || "PENDING"}
Auditing Guidelines Checked:
${audit?.guidelinesChecked.map(rule => ` - [x] ${rule}`).join("\n") || "No checked rules logged."}

Governance Notes:
${audit?.operatorSovereigntyNotes || "Review missing."}

======================================================================
                         OPERATOR SIGNATURE
======================================================================
I hereby authorize the execution of this workload in compliance with 
Delta Governance laws and verify this analysis reflects reality.

Signed Verator Code:
${sigInput.toUpperCase()}

Status: WORKLOAD AUTHORIZED & CONTEXT RESOLVED
======================================================================
`;

    onDispatchApproved(proofText, sigInput.toUpperCase());
  };

  const downloadText = () => {
    if (!dispatchedDirectiveText) return;
    const blob = new Blob([dispatchedDirectiveText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `delta_dispatch_${selectedPath?.id || "audit"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 space-y-4" id="crystal-bridge-section-module">
      {/* Header Block */}
      <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-2">
        <KeyRound className="h-4.5 w-4.5" />
        <span>VI. CRYSTAL BRIDGE (Authorization & Dispatch)</span>
      </div>

      {!selectedPath ? (
        <div className="border border-dashed border-gray-850 rounded-lg p-8 text-center text-[11px] text-gray-500 font-mono">
          [SELECT AN ACTIVE DECISION TRAJECTORY IN III. SIMON REGISTRY TO ENGAGE AUTHORIZATION GATEWAY]
        </div>
      ) : dispatchedDirectiveText ? (
        <div className="space-y-4 animate-fade-in" id="authorized-dispatch-state-view">
          <div className="bg-[#0b1712] border border-emerald-900/50 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-display font-black tracking-wider text-emerald-400 uppercase">
                Workload Approved & Dispatched
              </h4>
              <p className="text-[11px] text-gray-300 leading-relaxed font-sans mt-0.5">
                Operator signature <strong className="font-mono text-emerald-300">"{dispatchedSignature}"</strong> is locked into permanent session ledger. This workspace is marked COMPLIANT and audit-secure.
              </p>
            </div>
          </div>

          <div>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">
              Structured Decisional proof Sheet Telemetry
            </span>
            <pre className="w-full bg-gray-950 text-[10px] p-4 rounded-lg text-emerald-300/90 font-mono border border-gray-850 overflow-x-auto max-h-[220px] leading-relaxed">
              {dispatchedDirectiveText}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadText}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-mono font-medium py-2 rounded flex items-center justify-center gap-2 cursor-pointer transition border border-gray-700"
              id="download-proof-action"
            >
              <Download className="h-3.5 w-3.5" />
              Download Local Proof Document
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-950/60 border border-gray-850 rounded-lg space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-display font-extrabold text-gray-200 uppercase tracking-wider">
              Gate Dispatch Workload
            </h4>
            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
              By authorizing this workspace, you declare that you have verified all underlying signals and evidence models, acknowledging authority pairs are correctly matched.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
              Operator Digital Verification Code Stamp
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., APPROVED_POSTURE_ALPHA_12"
                value={sigInput}
                onChange={(e) => setSigInput(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-800 focus:border-emerald-500/80 rounded text-xs px-3 py-2 text-gray-200 outline-none font-mono uppercase"
                id="operator-stamp-signature-input"
              />
              <button
                onClick={handleAuthorize}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-mono font-bold px-4 rounded transition-all cursor-pointer shadow-md shadow-emerald-950/25 shrink-0"
                id="dispatch-authorize-action"
              >
                Sign & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
