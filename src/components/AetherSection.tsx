import React from "react";
import { TensionMap } from "../types";
import { Activity, HelpCircle, Loader2 } from "lucide-react";

interface AetherSectionProps {
  inquiry: string;
  onInquiryChange: (val: string) => void;
  analysis: TensionMap | null;
  loading: boolean;
  onRunAnalysis: () => void;
  evidenceDocsCount: number;
}

export default function AetherSection({
  inquiry,
  onInquiryChange,
  analysis,
  loading,
  onRunAnalysis,
  evidenceDocsCount
}: AetherSectionProps) {
  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex flex-col justify-between" id="aether-section-module">
      <div className="space-y-4">
        {/* Header Block */}
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
          <Activity className="h-4.5 w-4.5" />
          <span>I. AETHER (Hold & Map Uncertainty)</span>
        </div>

        <div>
          <h3 className="text-base font-display font-medium text-gray-100 mb-1.5">
            Formulate Uncertainty Core
          </h3>
          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            Record raw signals or open questions representing domain tension. Operators are guided by absolute context definition prior to mapping trajectories.
          </p>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest leading-none">
            Active Uncertainty Sphere (Operator Input Query)
          </label>
          <textarea
            placeholder="e.g., Evaluate structural exposures of launching client-side database modules onto serverless runtimes. What conflicting forces govern this setup?"
            value={inquiry}
            onChange={(e) => onInquiryChange(e.target.value)}
            className="w-full bg-gray-950/80 border border-gray-850 hover:border-gray-700/80 focus:border-indigo-500/80 text-xs rounded-lg p-3 text-gray-200 placeholder-gray-650 focus:outline-none transition-all font-sans min-h-[90px] leading-relaxed"
            id="aether-textarea-field"
          />
        </div>

        {/* Compile Analysis Action bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono uppercase">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${evidenceDocsCount > 0 ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            <span>{evidenceDocsCount} Hermes Proofs Bound</span>
          </div>

          <button
            onClick={onRunAnalysis}
            disabled={loading || !inquiry.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-display font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950/20"
            id="btn-trigger-aether-compilation"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Aligning...
              </>
            ) : (
              <>
                <HelpCircle className="h-3.5 w-3.5" />
                Map Uncertainty
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render AI Analysed Tension Summary */}
      {analysis && (
        <div className="mt-5 pt-4 border-t border-gray-800/60 animate-fade-in" id="aether-analysis-view">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
            Core Tension Mapped
          </span>
          <h4 className="text-xs font-display font-bold text-gray-200 uppercase tracking-wide mb-2">
            {analysis.tensionTitle}
          </h4>
          <p className="text-xs text-gray-400 leading-normal mb-3 font-sans">
            {analysis.tensionSummary}
          </p>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">
              Conflicting Force System
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analysis.coreConflictingForces.map((force, index) => (
                <span
                  key={index}
                  className="bg-indigo-950/30 text-indigo-300 border border-indigo-900/40 text-[9px] px-2 py-0.5 rounded font-mono"
                >
                  {force}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
