import React, { useState } from "react";
import { FileText, Plus, Check, Trash2, ClipboardPaste } from "lucide-react";

interface HermesSectionProps {
  evidenceDocs: { id: string; name: string; content: string }[];
  onEvidenceDocsChange: (docs: { id: string; name: string; content: string }[]) => void;
  analysisSummary?: string;
}

export default function HermesSection({
  evidenceDocs,
  onEvidenceDocsChange,
  analysisSummary
}: HermesSectionProps) {
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const handleAddManualEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualText.trim()) {
      alert("Manual evidence requires both title/origin and text string content.");
      return;
    }

    const newDoc = {
      id: `manual-${Date.now()}`,
      name: `Manual Notes: ${manualTitle.trim()}`,
      content: manualText.trim()
    };

    onEvidenceDocsChange([...evidenceDocs, newDoc]);
    setManualTitle("");
    setManualText("");
    setAddingNew(false);
  };

  const removeEvidence = (id: string) => {
    onEvidenceDocsChange(evidenceDocs.filter(d => d.id !== id));
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex flex-col justify-between" id="hermes-section-module">
      <div className="space-y-4">
        {/* Header Block */}
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider">
          <FileText className="h-4.5 w-4.5" />
          <span>II. HERMES (Evidence Retrieval & Providence)</span>
        </div>

        <div>
          <h3 className="text-base font-display font-medium text-gray-100 mb-1.5">
            Ingested Evidence Roster
          </h3>
          <p className="text-xs text-gray-500 font-sans leading-relaxed">
            Observations and documents parsed as reality points. JEMMA correlates all claims against exact quotes within this active factual collection.
          </p>
        </div>

        {/* Existing Evidence List */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {evidenceDocs.length === 0 ? (
            <div className="border border-dashed border-gray-800 rounded-lg p-5 text-center text-[10px] text-gray-500 font-mono">
              [HERMES POOL EMPTY - ALL RESULTS FORMULATED WILL BE ASSUMED]
            </div>
          ) : (
            evidenceDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 bg-gray-950/40 border border-gray-850 rounded-lg text-xs"
                id={`hermes-evidence-log-${doc.id}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="truncate pr-2 text-gray-300 font-sans font-medium">{doc.name}</span>
                  <span className="text-[9px] text-gray-500 font-mono shrink-0">
                    ({Math.round(doc.content.length / 1024 * 10) / 10} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeEvidence(doc.id)}
                  className="text-gray-500 hover:text-red-400 transition p-1 rounded"
                  title="Purge evidence node"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add manual facts tool */}
        {addingNew ? (
          <form onSubmit={handleAddManualEvidence} className="bg-gray-950/60 border border-gray-850 rounded-lg p-3 space-y-3 animate-fade-in">
            <div>
              <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                Document Name / Source Origin
              </label>
              <input
                type="text"
                placeholder="e.g., Marketing Budget Sheet.doc"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded text-xs px-2.5 py-1.5 text-gray-200 focus:outline-none"
                id="manual-evidence-title"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                Document Raw Contents (Plaintext Strings)
              </label>
              <textarea
                placeholder="Paste verbatim statements or facts here..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded text-xs p-2 text-gray-200 h-20 focus:outline-none font-sans"
                id="manual-evidence-contents"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="text-gray-400 hover:text-white text-[10px] font-mono px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono px-3 py-1 rounded"
              >
                Ingest Fact
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="w-full border border-dashed border-gray-800 hover:border-gray-700 bg-gray-950/20 text-gray-400 hover:text-gray-200 text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer font-medium"
            id="btn-add-manual-fact"
          >
            <Plus className="h-3.5 w-3.5" />
            Paste Manual Notes / Raw Facts
          </button>
        )}
      </div>

      {/* Render Hermes AI Evaluation if completed */}
      {analysisSummary && (
        <div className="mt-5 pt-4 border-t border-gray-800/60 animate-fade-in" id="hermes-summary-view">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block mb-1">
            Hermes Grounding Evaluation
          </span>
          <p className="text-xs text-gray-400 leading-normal font-sans">
            {analysisSummary}
          </p>
        </div>
      )}
    </div>
  );
}
