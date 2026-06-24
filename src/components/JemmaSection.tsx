import React, { useState, useEffect, useRef } from "react";
import { Pathway, FactualFinding } from "../types";
import { 
  saveSubstrateDelta, 
  SubstrateDelta 
} from "../services/firebase";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Timer, 
  Flame, 
  CheckCircle, 
  HeartCrack,
  HelpCircle,
  TrendingUp,
  Database,
  Eye,
  Check
} from "lucide-react";

interface JemmaSectionProps {
  selectedPath: Pathway | null;
  userId: string;
  onDeltaLogged?: () => void;
}

export default function JemmaSection({ selectedPath, userId, onDeltaLogged }: JemmaSectionProps) {
  // Reflection & Internalization State
  const [reflectionTime, setReflectionTime] = useState(0);
  const [exposureCount, setExposureCount] = useState<Record<string, number>>({});
  const [activeChallengeNode, setActiveChallengeNode] = useState<number | null>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, string>>({});
  const [challengeScores, setChallengeScores] = useState<Record<number, number>>({});
  const [showInternalizeModal, setShowInternalizeModal] = useState<number | null>(null);

  // Substrate delta commit states
  const [committing, setCommitting] = useState(false);
  const [suggestedRule, setSuggestedRule] = useState("");
  const [customExplanation, setCustomExplanation] = useState("");

  const intervalRef = useRef<any>(null);

  // Increment exposure counter and reset reflection timer when pathway changes
  useEffect(() => {
    if (selectedPath) {
      setReflectionTime(0);
      setExposureCount(prev => ({
        ...prev,
        [selectedPath.id]: (prev[selectedPath.id] || 0) + 1
      }));
      setActiveChallengeNode(null);

      // Start live reflection ticking
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setReflectionTime(t => t + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedPath?.id]);

  if (!selectedPath) {
    return (
      <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex items-center justify-center text-center h-[260px] text-gray-400 font-mono text-xs">
        [IV. JEMMA VERACITY MODULE. SELECT A TRAJECTORY IN SIMON PROTOCOL TO COMPILE VERIFICATION LOG]
      </div>
    );
  }

  const currentPathExposure = exposureCount[selectedPath.id] || 1;

  // Determine Cognitive Internalization category
  let internalizationCategory = "SURFACE PATTERN RECOGNITION";
  let barColor = "bg-amber-500";
  let textColor = "text-amber-400";
  let activeScore = reflectionTime * 1.5 + Object.keys(challengeAnswers).length * 15;

  if (activeScore > 45) {
    internalizationCategory = "INTERNALIZED COGNITIVE SOVEREIGNTY";
    barColor = "bg-emerald-500";
    textColor = "text-emerald-400";
  } else if (activeScore > 15) {
    internalizationCategory = "ACTIVE REFLECTIVE ASSESSMENT";
    barColor = "bg-indigo-500";
    textColor = "text-indigo-400";
  }

  // Handle choice submission
  const handleSelectChallengeAnswer = (nodeIndex: number, choiceType: "critical" | "standard" | "surface", statement: string, rule: string) => {
    let score = 5;
    if (choiceType === "critical") score = 25;
    if (choiceType === "standard") score = 15;

    setChallengeAnswers(prev => ({ ...prev, [nodeIndex]: statement }));
    setChallengeScores(prev => ({ ...prev, [nodeIndex]: score }));
    
    // Auto populate recommended rule for the Delta internalizer
    setSuggestedRule(`[Sovereignty Gate] ${rule}`);
    setCustomExplanation(`Verified claim against trace nodes. Cognitive drift corrected across ${reflectionTime}s reflection.`);
  };

  // Commit Rule to Cloud Substrate (Sovereign Substrate Delta)
  const handleCommitToLedger = async (nodeIndex: number, finding: FactualFinding) => {
    if (!suggestedRule.trim() || !customExplanation.trim()) {
      alert("Both rule name and explanatory evidence are architectural mandates.");
      return;
    }

    setCommitting(true);
    try {
      const delta: SubstrateDelta = {
        userId,
        observation: `JEMMA Challenge on pathway: [${selectedPath.name}]`,
        explanation: customExplanation,
        reasoning: `Factual Claim under challenge: "${finding.statement}"`,
        learning: `Challenge Response selected: "${challengeAnswers[nodeIndex]}"`,
        internalizedRule: suggestedRule
      };

      await saveSubstrateDelta(delta);
      alert("Delta rule successfully written to Cloud Substrate Ledger!");
      setShowInternalizeModal(null);
      if (onDeltaLogged) onDeltaLogged();
    } catch (e) {
      console.error("Failed to commit delta:", e);
      alert("Substrate ledger transaction failed to execute. Proceed with local cache.");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 space-y-5" id="jemma-section-module">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/60 pb-3 gap-2">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>IV. JEMMA (Challenge & Validation)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
            Active Verator: ONLINE
          </span>
        </div>
      </div>

      {/* Internalization Live Sensors HUD */}
      <div className="bg-[#0b101c] border border-gray-800 p-3.5 rounded-lg space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 text-rose-400" />
            Reflection Time: <strong className="text-gray-200">{reflectionTime}s</strong>
          </span>
          <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-indigo-400" />
            Exposure Count: <strong className="text-gray-200">#{currentPathExposure}</strong>
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="text-gray-500 uppercase">INTERNALIZATION ACQUISITION</span>
            <span className={`font-black tracking-widest ${textColor}`}>{internalizationCategory}</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${barColor}`} 
              style={{ width: `${Math.min(100, (activeScore / 60) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-display font-medium text-gray-100 mb-1">
          Factual Claim Verification Ledger
        </h3>
        <p className="text-xs text-gray-500 font-sans leading-relaxed">
          Verify claims for <span className="text-rose-400 italic">"{selectedPath.name}"</span>. Operator must actively engage Jemma challenges to earn internalized status.
        </p>
      </div>

      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        {selectedPath.traceableFindings.map((finding, index) => {
          const isVerified = finding.status === "evidenced";
          const answered = challengeAnswers[index];

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border text-xs leading-relaxed transition ${
                isVerified
                  ? "bg-[#0b1712]/70 border-emerald-950/80 text-emerald-100"
                  : "bg-[#18120b]/70 border-amber-950/80 text-amber-100"
              }`}
              id={`jemma-claim-${index}`}
            >
              {/* Claim status row */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono text-[9px] text-gray-500">Claims node {index + 1}</span>
                <span className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                    isVerified 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40"
                      : "bg-amber-950/40 text-amber-400 border-amber-900/40"
                  }`}>
                  {finding.status}
                </span>
              </div>

              {/* Factual claim statement */}
              <p className="font-sans text-[12px] font-medium leading-normal mb-1 text-gray-200">
                {finding.statement}
              </p>

              {/* Quote or Warning block */}
              {isVerified && finding.quote ? (
                <div className="mt-3 pl-3 border-l-2 border-emerald-800/60 font-mono text-[11px] text-gray-400 space-y-1">
                  <span className="text-[9px] text-emerald-500 block">
                    Source Document: [ {finding.source || "Ingested File Code"} ]
                  </span>
                  <p className="italic font-sans text-gray-300">
                    "{finding.quote}"
                  </p>
                </div>
              ) : (
                <div className="mt-3 p-2.5 bg-amber-950/10 border border-amber-900/20 rounded flex items-start gap-2 text-[10px] text-amber-500/95 font-mono">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-400 text-[9px] tracking-wider uppercase mb-0.5">UNSUBSTANTIATED HYPOTHESIS</span>
                    <span>No documentation match. JEMMA designates this finding as a logical assumption. Proceed with extreme vigilance.</span>
                  </div>
                </div>
              )}

              {/* Challenge Trigger Action */}
              <div className="mt-3.5 pt-3.5 border-t border-gray-800/40 flex flex-col gap-2">
                {!answered ? (
                  <button
                    onClick={() => setActiveChallengeNode(activeChallengeNode === index ? null : index)}
                    className="text-[10px] font-mono self-start text-indigo-400 hover:text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/20 border border-indigo-900/40 px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="h-3 w-3" />
                    {activeChallengeNode === index ? "Collapse Challenge" : "Challenge Cognitive Custody"}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded text-[11px]">
                      <span className="font-mono text-[9px] text-emerald-400 block uppercase tracking-wider font-bold mb-1">
                        Sovereign Proof Resolved:
                      </span>
                      <p className="text-gray-300 font-sans">{answered}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowInternalizeModal(index)}
                        className="text-[10px] font-mono text-emerald-300 hover:bg-emerald-950/50 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1"
                      >
                        <Database className="h-3 w-3 text-emerald-400" />
                        Seal & Internalize Rule
                      </button>
                      <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5">
                        <Check className="h-3.5 w-3.5" /> JEMMA Tested (+{challengeScores[index]}pts)
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Veracity Question selector node */}
                {activeChallengeNode === index && (
                  <div className="bg-gray-950/90 border border-rose-950/50 p-3 rounded-lg space-y-3 mt-1 animate-fade-in text-gray-300">
                    <div className="flex items-start gap-1.5">
                      <Flame className="h-4 w-4 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest block font-bold">
                          JEMMA VERACITY TEST
                        </span>
                        <p className="font-sans text-[11px] leading-relaxed text-gray-300 mt-1">
                          "Which structural challenge represents the highest level of cognitive dissonance for this claim?"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1 font-sans">
                      <button
                        onClick={() => handleSelectChallengeAnswer(
                          index, 
                          "critical", 
                          "Sovereign Challenge: We dispute authority coverage scope and cross-reference with live futures anomalies.",
                          `Rule 4.1: Cross-verify all ${selectedPath.type} claims with direct micro-indices.`
                        )}
                        className="w-full text-left bg-[#1c0f12] text-rose-300 hover:bg-[#2e1319] border border-rose-950 p-2 rounded text-[11px] transition cursor-pointer"
                      >
                        <strong>CRITICAL:</strong> Dispute standard metadata; demand validation from live CME / feed nodes directly.
                      </button>

                      <button
                        onClick={() => handleSelectChallengeAnswer(
                          index, 
                          "standard", 
                          "Reflective Alignment: Validate alignment with known parameters and log the covariance gap.",
                          `Rule 4.2: Audit variance boundaries in ${selectedPath.type} posture scenarios.`
                        )}
                        className="w-full text-left bg-[#0f1124] text-indigo-300 hover:bg-[#1a1c38] border border-indigo-950 p-2 rounded text-[11px] transition cursor-pointer"
                      >
                        <strong>REFLECTIVE:</strong> Cross-reference the provided quote with external custody parameters explicitly.
                      </button>

                      <button
                        onClick={() => handleSelectChallengeAnswer(
                          index, 
                          "surface", 
                          "Surface Assent: Standard acceptance of pattern-match heuristics without secondary constraints check.",
                          `Rule 4.3: Immediate assent on pathway findings under strict compliance constraint.`
                        )}
                        className="w-full text-left bg-gray-900/60 text-gray-300 hover:bg-gray-900 border border-gray-800 p-2 rounded text-[11px] transition cursor-pointer"
                      >
                        <strong>SURFACE:</strong> Rely on deterministic LLM summaries as-is without requiring manual lookup.
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Commit Form modal-style panel */}
              {showInternalizeModal === index && (
                <div className="bg-gray-950 border border-emerald-900 p-3.5 rounded-lg space-y-4.5 mt-2.5 animate-fade-in font-sans">
                  <div>
                    <h4 className="text-xs uppercase font-mono text-emerald-400 font-bold tracking-wider">
                      Write to Sovereign Substrate Delta Ledger
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      This formalizes your understanding of this claim. It commits a permanent, un-editable learning rule into the Cloud Substrate audit repository.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                        Acquired Sovereign Rule Name
                      </label>
                      <input 
                        type="text" 
                        value={suggestedRule}
                        onChange={(e) => setSuggestedRule(e.target.value)}
                        className="w-full bg-[#0a0d14] border border-emerald-950 text-[11px] rounded p-2 text-emerald-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                        Evidence & Logical Internalization Base
                      </label>
                      <textarea 
                        value={customExplanation}
                        onChange={(e) => setCustomExplanation(e.target.value)}
                        rows={2}
                        className="w-full bg-[#0a0d14] border border-emerald-950 text-[11px] rounded p-2 text-emerald-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowInternalizeModal(null)}
                      className="text-[10px] font-mono text-gray-400 hover:text-gray-200 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCommitToLedger(index, finding)}
                      disabled={committing}
                      className="text-[10px] font-mono text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded px-3 py-1 text-center font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      {committing ? "Saving to Cloud..." : "Confirm Ledger Commit"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

