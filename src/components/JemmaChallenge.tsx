import React, { useState, useEffect } from "react";
import { Pathway, FactualFinding } from "../types";
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  FileText, 
  PlusCircle, 
  Flame, 
  ArrowRight, 
  Zap, 
  BookOpen,
  Database,
  Check
} from "lucide-react";
import { saveSubstrateDelta, SubstrateDelta } from "../services/firebase";

interface JemmaChallengeProps {
  selectedPath: Pathway | null;
  userId: string;
  onDeltaLogged?: () => void;
}

interface FrictionItem {
  id: string;
  type: "authority_gap" | "deductive_void" | "cognitive_contradiction";
  severity: "critical" | "warning" | "advisory";
  targetClaim: string;
  evidenceSource?: string;
  message: string;
  remedyHint: string;
  solved: boolean;
}

export default function JemmaChallenge({ selectedPath, userId, onDeltaLogged }: JemmaChallengeProps) {
  const [frictions, setFrictions] = useState<FrictionItem[]>([]);
  const [selectedFriction, setSelectedFriction] = useState<FrictionItem | null>(null);
  
  // Rule Patch State
  const [patchName, setPatchName] = useState("");
  const [patchExplanation, setPatchExplanation] = useState("");
  const [committing, setCommitting] = useState(false);

  // Analyze pathway findings dynamically whenever selection changes
  useEffect(() => {
    if (!selectedPath) {
      setFrictions([]);
      setSelectedFriction(null);
      return;
    }

    const compiled: FrictionItem[] = [];
    const findings = selectedPath.traceableFindings || [];

    findings.forEach((finding, index) => {
      const claimText = finding.statement;
      
      // 1. Check for Deductive Void (Assumed state)
      if (finding.status === "assumed" || !finding.quote) {
        compiled.push({
          id: `void-${index}`,
          type: "deductive_void",
          severity: "critical",
          targetClaim: claimText,
          message: "Unevidenced logical hypothesis inside the trajectory. No direct contextual quote exists in the ingested files directory.",
          remedyHint: "Enforce a formal alignment rule or register direct physical telemetry anchors before releasing downstream.",
          solved: false
        });
      }

      // 2. Check for Authority Link Gaps
      const hasAuthorityRef = ["cme", "sec", "fca", "coinbase", "nhs", "nice", "fda", "who", "snomed", "hmcts", "law society", "ietf", "w3c", "nist", "acm", "ieee", "nasa", "esa", "iau", "escoffier", "michelin", "ipcc", "noaa", "copernicus"].some(auth => 
        (finding.source || "").toLowerCase().includes(auth) || 
        claimText.toLowerCase().includes(auth)
      );

      if (finding.status === "evidenced" && !hasAuthorityRef) {
        compiled.push({
          id: `auth-${index}`,
          type: "authority_gap",
          severity: "warning",
          targetClaim: claimText,
          evidenceSource: finding.source || "Unknown Context",
          message: "Evidence is associated without linking to an accredited governing authority defined in the registry framework.",
          remedyHint: "Enrich document tags & trace findings to verified primary regulatory/clearinghouse nodes.",
          solved: false
        });
      }

      // 3. Scan for Potential Internal Contradictions (e.g., conflicting terminology)
      const hasContradictoryMarkers = ["anomaly", "variance", "premium risk", "divergence", "contradiction", "unsubstantiated", "gap", "contango yield variance"].some(marker =>
        claimText.toLowerCase().includes(marker)
      );

      if (hasContradictoryMarkers) {
        compiled.push({
          id: `contradict-${index}`,
          type: "cognitive_contradiction",
          severity: "advisory",
          targetClaim: claimText,
          message: "Sovereign cognitive variance marker detected. Underlying metric patterns display risk of local divergence from traditional models.",
          remedyHint: "Draft a high-altitude variance posture limit rule and deploy a strict tracking threshold.",
          solved: false
        });
      }

      // 4. Intercept simulated placeholder authorities (e.g., ThousandEyes DNS Monitor) and label them
      const hasPlaceholderRef = ["thousand", "eyes", "dns", "thousandeyes", "dns monitor"].some(place =>
        (finding.source || "").toLowerCase().includes(place) ||
        claimText.toLowerCase().includes(place)
      );

      if (hasPlaceholderRef) {
        compiled.push({
          id: `placeholder-${index}`,
          type: "authority_gap",
          severity: "warning",
          targetClaim: claimText,
          evidenceSource: finding.source || "ThousandEyes Monitor Pool",
          message: "JEMMA Challenge Flag: Rated as a Placeholder Authority & Simulated Feed. This tracking vector operates as a simulation benchmark, not a real integrated live enterprise stream.",
          remedyHint: "Acknowledge and label this benchmark explicitly as a Simulated Placeholder feed. Do not treat as an active direct authority.",
          solved: false
        });
      }
    });

    setFrictions(compiled);
    setSelectedFriction(compiled[0] || null);
    
    // Auto populate patch initial state
    if (compiled[0]) {
      setPatchName(`[Sovereignty Patch] Clear ${compiled[0].type === "deductive_void" ? "Deductive Gap" : "Authority Lock"}`);
      setPatchExplanation(`Operator manually assessed this cognitive dissonance. Patching telemetry path with strict boundary rules.`);
    } else {
      setPatchName("");
      setPatchExplanation("");
    }
  }, [selectedPath?.id]);

  const handleSelectFriction = (item: FrictionItem) => {
    setSelectedFriction(item);
    setPatchName(`[Sovereignty Patch] Clear ${item.type === "deductive_void" ? "Deductive Gap" : item.type === "authority_gap" ? "Authority Lock" : "Variance Marker"}`);
    setPatchExplanation(`Operator manually verified other trace indices. Force-mitigating friction loop on claim: "${item.targetClaim.slice(0, 45)}..."`);
  };

  // Commit dynamic friction override to Cloud Firestore Ledger
  const handleCommitPatch = async () => {
    if (!selectedPath || !selectedFriction) return;
    if (!patchName.trim() || !patchExplanation.trim()) {
      alert("Both rule title and explanation base must be provided to clear physical friction.");
      return;
    }

    setCommitting(true);
    try {
      const delta: SubstrateDelta = {
        userId,
        observation: `JEMMA Friction Resolution: ${selectedPath.name}`,
        explanation: patchExplanation,
        reasoning: `Friction Type: ${selectedFriction.type.toUpperCase()} | Severity: ${selectedFriction.severity.toUpperCase()}`,
        learning: `Mitigated claim: "${selectedFriction.targetClaim}"`,
        internalizedRule: patchName
      };

      await saveSubstrateDelta(delta);
      alert("Substrate learning patch written to permanent Cloud Firestore ledger!");
      
      // Update local state to mark solved
      setFrictions(prev => prev.map(f => f.id === selectedFriction.id ? { ...f, solved: true } : f));
      setSelectedFriction(prev => prev ? { ...prev, solved: true } : null);
      
      if (onDeltaLogged) onDeltaLogged();
    } catch (e) {
      console.error(e);
      alert("Failed to commit resolved friction state to cloud ledger. Proceed offline.");
    } finally {
      setCommitting(false);
    }
  };

  if (!selectedPath) {
    return (
      <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center text-center h-[280px] text-gray-400 font-mono text-xs">
        <ShieldAlert className="h-8 w-8 text-rose-500/55 mb-2 animate-pulse" />
        <span>[V. JEMMA FRICTION MODULE. SELECT A PATHWAY TRAJECTORY TO EVALUATE THE AUDIT COGNITION REPORT]</span>
      </div>
    );
  }

  // Calculate stats
  const totalFrictions = frictions.length;
  const criticalCount = frictions.filter(f => f.severity === "critical" && !f.solved).length;
  const warningsCount = frictions.filter(f => f.severity === "warning" && !f.solved).length;
  const correctedCount = frictions.filter(f => f.solved).length;

  let tensionGrade = "LOW TENSION";
  let tensionColor = "text-emerald-400";
  let tensionBg = "bg-emerald-950/20 border-emerald-900/40";
  
  if (criticalCount > 0) {
    tensionGrade = "CRITICAL COGNITIVE DISSONANCE";
    tensionColor = "text-rose-400";
    tensionBg = "bg-rose-950/25 border-rose-900/45 animate-pulse";
  } else if (warningsCount > 0) {
    tensionGrade = "ACTIVE SYSTEM FRICTION";
    tensionColor = "text-amber-400";
    tensionBg = "bg-amber-950/20 border-amber-900/40";
  }

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 space-y-5" id="jemma-friction-report">
      
      {/* Header telemetry band */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800/60 pb-3 gap-2">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider">
          <Flame className="h-4.5 w-4.5 text-rose-500" />
          <span>V. JEMMA (Friction & Dispute Ledger)</span>
        </div>
        <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${tensionBg} ${tensionColor}`}>
          {tensionGrade}
        </span>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="bg-gray-950 p-2.5 rounded border border-gray-900">
          <span className="text-gray-500 block uppercase">TOTAL DETECTED</span>
          <strong className="text-gray-200 text-sm block mt-0.5">{totalFrictions}</strong>
        </div>
        <div className="bg-[#1c0f12] p-2.5 rounded border border-rose-950">
          <span className="text-rose-400 block uppercase">CRITICAL GAPS</span>
          <strong className="text-rose-500 text-sm block mt-0.5">{criticalCount}</strong>
        </div>
        <div className="bg-[#0b1712] p-2.5 rounded border border-emerald-950">
          <span className="text-emerald-400 block uppercase">MITIGATED</span>
          <strong className="text-emerald-400 text-sm block mt-0.5">{correctedCount}</strong>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left column: List of friction items */}
        <div className="md:col-span-5 space-y-2 max-h-[280px] overflow-y-auto pr-1">
          <span className="text-[8px] font-mono uppercase text-gray-500 tracking-widest block mb-2">
            Disputed System Gaps
          </span>
          {frictions.length === 0 ? (
            <div className="bg-emerald-950/10 border border-emerald-900/20 p-4 rounded text-center text-emerald-400 font-mono text-[10px] space-y-1.5">
              <CheckCircle2 className="h-5 w-5 mx-auto" />
              <span>[CLEARANCE APPROVED]</span>
              <p className="text-gray-400 font-sans text-[10px]">Zero authoritative gaps or logical contradictions identified.</p>
            </div>
          ) : (
            frictions.map((f) => {
              const isActive = selectedFriction?.id === f.id;
              
              let sevColor = "bg-rose-950/30 text-rose-400 border-rose-900/30";
              if (f.severity === "warning") sevColor = "bg-amber-950/30 text-amber-500 border-amber-900/30";
              if (f.severity === "advisory") sevColor = "bg-indigo-950/30 text-indigo-400 border-indigo-900/30";
              if (f.solved) sevColor = "bg-emerald-950/30 text-emerald-400 border-emerald-900/30";

              return (
                <div
                  key={f.id}
                  onClick={() => handleSelectFriction(f)}
                  className={`p-3 rounded-lg border text-[11px] cursor-pointer transition flex flex-col gap-1.5 ${
                    isActive 
                      ? "bg-[#181d2a] border-indigo-500/40 text-gray-200" 
                      : "bg-[#0b0e17] border-gray-850 hover:bg-[#0e121e] text-gray-400"
                  }`}
                  id={`friction-stub-${f.id}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[8px] uppercase tracking-wider text-gray-500">
                      {f.type.replace("_", " ")}
                    </span>
                    <span className={`text-[7px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded border ${sevColor}`}>
                      {f.solved ? "mitigated" : f.severity}
                    </span>
                  </div>
                  <p className="line-clamp-2 font-sans text-gray-300 leading-tight">
                    {f.targetClaim}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Selected friction interactive solver */}
        <div className="md:col-span-7 bg-[#0b0f19] border border-gray-850 p-4 rounded-lg flex flex-col justify-between min-h-[280px]">
          {selectedFriction ? (
            <div className="space-y-4 font-sans text-xs flex-1 flex flex-col justify-between">
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-start text-[10px] font-mono border-b border-gray-800 pb-2">
                  <span className="text-gray-400 uppercase">Friction Audit Detail</span>
                  {selectedFriction.solved && (
                    <span className="text-emerald-400 flex items-center gap-0.5 font-bold uppercase">
                      <Check className="h-3.5 w-3.5" /> Mitigated
                    </span>
                  )}
                </div>

                {/* Target claim quote block */}
                <div className="bg-gray-950 p-2.5 rounded border border-gray-900">
                  <span className="text-[8px] font-mono text-gray-500 block uppercase">DISPUTED FINDING:</span>
                  <p className="italic text-gray-300 font-sans leading-relaxed mt-1 text-[11px]">
                    "{selectedFriction.targetClaim}"
                  </p>
                  {selectedFriction.evidenceSource && (
                    <span className="text-[9px] font-mono text-gray-500 block mt-1">
                      Context Tag: [ {selectedFriction.evidenceSource} ]
                    </span>
                  )}
                </div>

                {/* Message & Remedy */}
                <div className="space-y-1">
                  <span className="text-[8.5px] font-mono text-gray-400 block uppercase font-bold text-rose-400">
                    Analytical Contradiction Report:
                  </span>
                  <p className="text-gray-300 leading-relaxed text-[11px] font-sans">
                    {selectedFriction.message}
                  </p>
                </div>

                <div className="bg-[#121620] p-2.5 rounded border border-gray-850/50 text-[10.5px] font-sans leading-relaxed text-indigo-300">
                  <strong className="text-[9px] font-mono block uppercase text-indigo-400 mb-0.5">REMEDY STRATEGY:</strong>
                  {selectedFriction.remedyHint}
                </div>
              </div>

              {/* Solver Trigger / Commit interface */}
              <div className="border-t border-gray-850/60 pt-3 space-y-3.5">
                {!selectedFriction.solved ? (
                  <div className="space-y-3">
                    <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest block font-bold">
                      Deploy Sovereign Alignment Rule
                    </span>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="block text-[8px] font-mono text-gray-400 uppercase">
                          Alignment Posture Title
                        </label>
                        <input
                          type="text"
                          value={patchName}
                          onChange={(e) => setPatchName(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-850 text-[11px] rounded p-2 text-indigo-200 font-mono focus:outline-none focus:border-indigo-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[8px] font-mono text-gray-400 uppercase">
                          Sovereignty Context / Mitigation Evidence
                        </label>
                        <textarea
                          value={patchExplanation}
                          onChange={(e) => setPatchExplanation(e.target.value)}
                          rows={2}
                          className="w-full bg-gray-950 border border-gray-850 text-[11px] rounded p-2 text-indigo-200 font-sans focus:outline-none focus:border-indigo-800"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleCommitPatch}
                        disabled={committing}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-black uppercase tracking-widest px-3.5 py-1.8 rounded cursor-pointer transition flex items-center gap-1"
                      >
                        <Database className="h-3.5 w-3.5 text-indigo-200" />
                        {committing ? "Writing..." : "Commit Rule to Substrate"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/25 border border-emerald-900/40 p-3 rounded text-center text-emerald-400 font-mono text-[10.5px] flex items-center gap-2 justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>COGNTIVE POSTURE PATCH LOCKED TO CLOUD FIRESTORE</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="m-auto text-center text-[10.5px] font-mono text-gray-500">
              Select an authoritative mismatch to coordinate alignment posture.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
