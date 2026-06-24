import React, { useState } from "react";
import { SubstrateDelta } from "../services/firebase";
import { Cpu, Plus, Sparkles, Server, Terminal, Trash2, ShieldCheck } from "lucide-react";

interface SubstrateDeltaSectionProps {
  deltas: SubstrateDelta[];
  onAddDelta: (delta: Omit<SubstrateDelta, "id" | "userId">) => void;
  onDeleteDelta: (id: string) => void;
  loading: boolean;
}

export default function SubstrateDeltaSection({
  deltas,
  onAddDelta,
  onDeleteDelta,
  loading
}: SubstrateDeltaSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [obs, setObs] = useState("");
  const [exp, setExp] = useState("");
  const [reas, setReas] = useState("");
  const [lrn, setLrn] = useState("");
  const [rule, setRule] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obs.trim() || !exp.trim() || !reas.trim() || !lrn.trim() || !rule.trim()) {
      alert("All learning dimensions must be resolved to log platform acquisitions.");
      return;
    }

    onAddDelta({
      observation: obs.trim(),
      explanation: exp.trim(),
      reasoning: reas.trim(),
      learning: lrn.trim(),
      internalizedRule: rule.trim()
    });

    setObs("");
    setExp("");
    setReas("");
    setLrn("");
    setRule("");
    setShowForm(false);
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex flex-col justify-between" id="substrate-delta-section-module">
      <div className="space-y-4">
        {/* Header Block */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Cpu className="h-4.5 w-4.5" />
            <span>Substrate Delta Ledger</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/40 px-2.5 py-1 rounded cursor-pointer"
            id="btn-toggle-delta-form"
          >
            {showForm ? "View Ledger" : "Log New Delta"}
          </button>
        </div>

        <div>
          <h3 className="text-base font-display font-medium text-gray-100 mb-1.5">
            Environmental Learning Acquisition
          </h3>
          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            Record newly discovered constraints, behaviors, or limitations observed on this runtime environment (Replit, Cloud Run, browser iframe) as permanent architectural rules.
          </p>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 bg-gray-950/60 p-4 rounded-xl border border-gray-850 max-h-[400px] overflow-y-auto">
            <div className="space-y-1">
              <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                1. Observation (The Raw Behavioral Signal)
              </label>
              <input
                type="text"
                placeholder="e.g., Iframe security policies restrict standard modal download triggers."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                className="w-full bg-gray-905 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none"
                id="delta-obs-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                2. Technical Explanation (Root Cause Assessment)
              </label>
              <textarea
                placeholder="e.g., The control container enforces strict sandbox properties preventing parent window alerts."
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                className="w-full bg-gray-905 border border-gray-800 rounded p-2 text-xs text-gray-300 h-14 focus:outline-none"
                id="delta-exp-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                3. Analytical Reasoning (Risk Impact)
              </label>
              <input
                type="text"
                placeholder="e.g., Calling alert causes silent lockups on user click sequences."
                value={reas}
                onChange={(e) => setReas(e.target.value)}
                className="w-full bg-gray-905 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none"
                id="delta-reason-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                  4. Discovered Learning
                </label>
                <input
                  type="text"
                  placeholder="e.g., Build non-blocking custom status lines instead of alerts."
                  value={lrn}
                  onChange={(e) => setLrn(e.target.value)}
                  className="w-full bg-gray-905 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none"
                  id="delta-learn-input"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                  5. Internalized Golden Rule
                </label>
                <input
                  type="text"
                  placeholder="e.g., ALWAYS_FAVOR_MODERN_DOM_NOTIFICATIONS"
                  value={rule}
                  onChange={(e) => setRule(e.target.value)}
                  className="w-full bg-gray-905 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-emerald-400 focus:outline-none font-mono placeholder:text-emerald-900/60"
                  id="delta-rule-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs py-2 rounded font-bold cursor-pointer transition"
              id="delta-submit-action"
            >
              Sign off Learning into Substrate Ledger
            </button>
          </form>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-10 space-y-2">
                <span className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></span>
                <p className="text-[10px] text-gray-500 font-mono">Loading learned rules from cloud database...</p>
              </div>
            ) : deltas.length === 0 ? (
              <div className="border border-dashed border-gray-800 rounded-lg p-8 text-center text-[10px] text-gray-500 font-mono">
                [LEDGER CURRENTLY VOID OF DELTAS. DISCOVER ENVIRONMENT TRAITS TO LOG GOLDEN RULES]
              </div>
            ) : (
              deltas.map((delta, index) => (
                <div
                  key={delta.id || index}
                  className="p-3.5 bg-gray-950/40 border border-indigo-950/50 rounded-lg text-xs hover:border-indigo-900/50 transition relative"
                  id={`delta-card-${delta.id || index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest border border-emerald-950 bg-emerald-950/15 px-1.5 py-0.5 rounded font-black">
                      {delta.internalizedRule}
                    </span>
                    <button
                      onClick={() => delta.id && onDeleteDelta(delta.id)}
                      className="text-gray-600 hover:text-red-400 transition"
                      title="Purge learn index"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 font-sans leading-relaxed text-gray-300">
                    <p className="text-[11px] font-bold text-gray-200">
                      Observation: <span className="font-normal text-gray-300">{delta.observation}</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Explanation: {delta.explanation}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Learning Pathway: {delta.learning}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
