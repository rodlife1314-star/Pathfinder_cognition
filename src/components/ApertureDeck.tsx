import React, { useState, useEffect } from "react";
import { AnalysisResponse, Pathway } from "../types";
import { 
  saveSession, 
  getSessions, 
  deleteSession, 
  saveSubstrateDelta, 
  getSubstrateDeltas, 
  deleteSubstrateDelta,
  PathfinderSession,
  SubstrateDelta 
} from "../services/firebase";
import { executeCognitiveAnalysis } from "../services/api";
import { classifyInquiryDomain, computeCoverageMetric } from "../services/domains";

// Subsystem imports
import AetherSection from "./AetherSection";
import HermesSection from "./HermesSection";
import SimonSection from "./SimonSection";
import JemmaSection from "./JemmaSection";
import OctagonSection from "./OctagonSection";
import CrystalBridgeSection from "./CrystalBridgeSection";
import SovereignDriveDocsBridge from "./SovereignDriveDocsBridge";
import SubstrateDeltaSection from "./SubstrateDeltaSection";
import FieldModeConsole from "./FieldModeConsole";

import { 
  ShieldCheck, 
  BookOpen, 
  Save, 
  FolderOpen, 
  Trash2, 
  Loader2, 
  Sparkles,
  Compass,
  FileText,
  AlertTriangle,
  History
} from "lucide-react";

interface ApertureDeckProps {
  evidenceDocs: { id: string; name: string; content: string }[];
  operatorName: string;
  accessToken: string;
  userId: string;
  onEvidenceDocsChange: (evidence: { id: string; name: string; content: string }[]) => void;
}

export default function ApertureDeck({
  evidenceDocs,
  operatorName,
  accessToken,
  userId,
  onEvidenceDocsChange
}: ApertureDeckProps) {
  // Navigation active tab: unified decision console vs specific detail modules
  const [activeTab, setActiveTab] = useState<"workspace" | "delta" | "docs">("workspace");
  const [isFieldMode, setIsFieldMode] = useState(false);

  // Coverage Gate States
  const [coverageGateOpen, setCoverageGateOpen] = useState(false);
  const [classifiedDomain, setClassifiedDomain] = useState<any>(null);
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [gateApproved, setGateApproved] = useState(false);
  const [viewingAnalysis, setViewingAnalysis] = useState(false);

  // Core analysis states
  const [inquiry, setInquiry] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Pathway & Signature dispatch states
  const [selectedPath, setSelectedPath] = useState<Pathway | null>(null);
  const [dispatchedDirectiveText, setDispatchedDirectiveText] = useState<string | null>(null);
  const [dispatchedSignature, setDispatchedSignature] = useState<string | null>(null);

  // Firestore Saved Sessions states
  const [historySessions, setHistorySessions] = useState<PathfinderSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Firestore Substrate Delta states
  const [substrateDeltas, setSubstrateDeltas] = useState<SubstrateDelta[]>([]);
  const [loadingDeltas, setLoadingDeltas] = useState(false);

  // Trigger Gemini dynamic alignment analysis with integrated Coverage Gate preflight check
  const handleRunAnalysis = async () => {
    if (!inquiry.trim()) {
      alert("Inquiry cannot remain blank for alignment analysis.");
      return;
    }

    // Preflight check: Classify domain and calculate baseline coverage metrics
    const domain = classifyInquiryDomain(inquiry);
    const score = computeCoverageMetric(domain.id, inquiry);
    setClassifiedDomain(domain);
    setCoveragePercent(score);
    
    // Open Coverage Gate visual overlay prior to presenting slow-path findings
    setCoverageGateOpen(true);
    setGateApproved(false);
    setViewingAnalysis(false);

    setLoadingAnalysis(true);
    setErrorText(null);
    setAnalysis(null);
    setSelectedPath(null);
    setDispatchedDirectiveText(null);
    setDispatchedSignature(null);

    try {
      const resp = await executeCognitiveAnalysis(inquiry, evidenceDocs);
      setAnalysis(resp);
      // SIMON finishes, allowing operator to unlock findings
      setGateApproved(true);
    } catch (err: any) {
      console.error("Cognitive path resolve failed:", err);
      setErrorText(err?.message || "Internal algorithm pipeline connection errored.");
      setCoverageGateOpen(false); // reset gate on crash
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Safe Load Historical Sessions
  const loadWorkspaceSessions = async () => {
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const records = await getSessions(userId);
      setHistorySessions(records);
    } catch (error) {
      console.error("Failed to load historical workspace records:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Safe Save Current Session
  const handleSaveActiveWorkspace = async () => {
    if (!userId) return;
    if (!inquiry.trim()) {
      alert("Void workspace context. State requires active inquiry to persist session.");
      return;
    }

    setLoadingHistory(true);
    try {
      const sessionData: PathfinderSession = {
        id: currentSessionId || undefined,
        userId,
        inquiry,
        evidenceDocs,
        analysis,
        selectedPathwayId: selectedPath?.id || null,
        dispatchedDirective: dispatchedDirectiveText,
        operatorSignature: dispatchedSignature || ""
      };

      const docId = await saveSession(sessionData);
      setCurrentSessionId(docId);
      await loadWorkspaceSessions();
    } catch (error) {
      console.error("Save system discard:", error);
      alert("Failed to sync workspace states with cloud Firestore.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Reset local workspace to zero
  const handleResetWorkspace = () => {
    setInquiry("");
    setAnalysis(null);
    setSelectedPath(null);
    setDispatchedSignature(null);
    setDispatchedDirectiveText(null);
    setCurrentSessionId(null);
    onEvidenceDocsChange([]);
    setErrorText(null);
  };

  // Restore previous Workspace data structures
  const handleRestoreSession = (sess: PathfinderSession) => {
    if (sess.id) setCurrentSessionId(sess.id);
    setInquiry(sess.inquiry);
    onEvidenceDocsChange(sess.evidenceDocs || []);
    setAnalysis(sess.analysis || null);
    
    if (sess.analysis && sess.selectedPathwayId) {
      const path = (sess.analysis.pathways || []).find((p: any) => p.id === sess.selectedPathwayId);
      if (path) setSelectedPath(path);
    } else {
      setSelectedPath(null);
    }

    setDispatchedDirectiveText(sess.dispatchedDirective || null);
    setDispatchedSignature(sess.operatorSignature || null);
    setErrorText(null);
    setActiveTab("workspace");
  };

  // Delete specific history session
  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteSession(id);
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
      await loadWorkspaceSessions();
    } catch (err) {
      console.error("Purging records failed:", err);
    }
  };

  // Substrate Delta Actions
  const loadDeltas = async () => {
    if (!userId) return;
    setLoadingDeltas(true);
    try {
      const records = await getSubstrateDeltas(userId);
      setSubstrateDeltas(records);
    } catch (err) {
      console.error("Could not fetch environmental learnings:", err);
    } finally {
      setLoadingDeltas(false);
    }
  };

  const handleCreateDelta = async (rawDelta: Omit<SubstrateDelta, "id" | "userId">) => {
    if (!userId) return;
    try {
      await saveSubstrateDelta({
        userId,
        ...rawDelta
      });
      await loadDeltas();
    } catch (error) {
      console.error("Could not log substrate learning delta:", error);
    }
  };

  const handleDeleteDelta = async (id: string) => {
    try {
      await deleteSubstrateDelta(id);
      await loadDeltas();
    } catch (error) {
      console.error("Could not delete substrate learning delta:", error);
    }
  };

  // Run initial state loading once authentication bounds are established
  useEffect(() => {
    if (userId) {
      loadWorkspaceSessions();
      loadDeltas();
    }
  }, [userId]);

  return (
    <div className="flex flex-col gap-5 h-full" id="delta-workspace-framework">
      {/* Session persistence header hub */}
      <div className="bg-[#0e1422]/90 border border-gray-800/80 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest">
            Sovereign Delta Controller
          </h2>
          {currentSessionId && (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.1 py-0.5 rounded uppercase">
              session: {currentSessionId.toUpperCase().slice(0, 8)}
            </span>
          )}
        </div>

        {/* Persistence controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSaveActiveWorkspace}
            disabled={loadingHistory || !inquiry.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800/80 disabled:text-gray-500 text-white text-[11px] font-mono px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition"
            id="btn-save-workspace"
          >
            <Save className="h-3.5 w-3.5" />
            Save Profile
          </button>
          <button
            onClick={() => setIsFieldMode(!isFieldMode)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition border ${
              isFieldMode
                ? "bg-amber-600/10 text-amber-400 border-amber-900/40 hover:bg-amber-600/20"
                : "bg-[#1f293d]/50 text-indigo-300 border border-indigo-900/40 hover:bg-[#1f293d]/80"
            }`}
            id="btn-toggle-field-mode"
          >
            <Compass className={`h-3.5 w-3.5 ${isFieldMode ? "animate-spin text-amber-500" : "text-indigo-400"}`} />
            {isFieldMode ? "Observation Aperture" : "Field Mode Telemetry"}
          </button>
          <button
            onClick={handleResetWorkspace}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-mono px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition border border-gray-700"
            id="btn-clear-workspace"
          >
            Zero Workspace
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex bg-[#0b0f19] p-1 rounded-lg border border-gray-800/80">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex-1 py-2 text-xs font-display font-medium rounded-md transition-all ${
            activeTab === "workspace"
              ? "bg-[#1f293d]/50 text-indigo-300 border border-indigo-900/40"
              : "text-gray-500 hover:text-gray-300"
          }`}
          id="btn-main-deck-workspace"
        >
          Primary Decisional Deck
        </button>
        <button
          onClick={() => setActiveTab("delta")}
          className={`flex-1 py-2 text-xs font-display font-medium rounded-md transition-all ${
            activeTab === "delta"
              ? "bg-[#1f293d]/50 text-indigo-300 border border-indigo-900/40"
              : "text-gray-500 hover:text-gray-300"
          }`}
          id="btn-main-deck-delta"
        >
          Substrate Deltas
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex-1 py-2 text-xs font-display font-medium rounded-md transition-all ${
            activeTab === "docs"
              ? "bg-[#1f293d]/50 text-indigo-300 border border-indigo-900/40"
              : "text-gray-500 hover:text-gray-300"
          }`}
          id="btn-main-deck-docs"
        >
          Sovereign Doc Manager
        </button>
      </div>

      {/* Content panes based on selection */}
      <div className="flex-1 min-h-0">
        {activeTab === "workspace" && (
          isFieldMode ? (
            <FieldModeConsole
              userId={userId}
              operatorName={operatorName}
              onDeltaLogged={loadDeltas}
            />
          ) : (
            <div className="space-y-6">
              {/* Split Inquiry Formulation and Ingested Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AetherSection
                  inquiry={inquiry}
                  onInquiryChange={setInquiry}
                  analysis={analysis ? analysis.aether : null}
                  loading={loadingAnalysis}
                  onRunAnalysis={handleRunAnalysis}
                  evidenceDocsCount={evidenceDocs.length}
                />
                <HermesSection
                  evidenceDocs={evidenceDocs}
                  onEvidenceDocsChange={onEvidenceDocsChange}
                  analysisSummary={analysis ? analysis.evidenceAnalysis.summary : undefined}
                />
              </div>

              {/* Coverage Gate preflight blocking overlay */}
              {coverageGateOpen && !viewingAnalysis && classifiedDomain && (
                <div className="bg-[#0e1422]/90 border border-gray-800/80 rounded-xl p-6 space-y-5 animate-fade-in" id="coverage-gate-container">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800/60 pb-3 gap-2">
                    <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-black">
                      <ShieldCheck className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                      <span>II. COVERAGE GATEWAY (Pre-Flight Authority Lock)</span>
                    </div>
                    <span className={`text-[8.5px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                      classifiedDomain.status === "live"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40"
                        : "bg-indigo-950/40 text-indigo-400 border-indigo-900/40"
                    }`}>
                      DOMAIN STATUS: {classifiedDomain.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[8.5px] font-mono text-gray-400 block uppercase tracking-wider">
                          INGESTED OBSERVATION DOMAIN METADATA
                        </span>
                        <h3 className="text-sm font-display font-medium text-gray-100 uppercase tracking-widest mt-1">
                          Domain: <strong className="text-amber-400">{classifiedDomain.name}</strong>
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-widest">
                          Registered Governing Authorities
                        </span>
                        <div className="space-y-2">
                          {classifiedDomain.authorities.map((auth: any, index: number) => (
                            <div key={index} className="bg-gray-950/60 p-2.5 rounded border border-gray-900 text-[11px]">
                              <strong className="text-gray-300 font-mono block">{auth.name}</strong>
                              <p className="text-gray-400 font-sans mt-0.5 leading-relaxed text-[10.5px]">{auth.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-[#0b101c] p-4 rounded-lg border border-gray-850 space-y-3">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-widest">
                          Domain-Specific Lenses Applied
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {classifiedDomain.lenses.map((lens: string, index: number) => (
                            <span key={index} className="bg-[#1f2937]/50 text-gray-300 border border-gray-800 text-[9px] px-2 py-0.5 rounded font-mono">
                              {lens}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-950 p-4 rounded-lg border border-gray-900 space-y-3 text-[11px] font-mono">
                        <div>
                          <span className="text-[8px] text-gray-500 block uppercase">
                            Target Physical Pipelines Ingested
                          </span>
                          <div className="space-y-0.8 mt-1.5 text-gray-300">
                            {classifiedDomain.sources.map((src: string, index: number) => (
                              <div key={index} className="flex items-center gap-1.5">
                                <span className="inline-block h-1 w-1 bg-amber-400 rounded-full"></span>
                                <span>{src}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-900 pt-3 flex justify-between items-baseline">
                          <span className="text-[8.5px] text-gray-500 uppercase">
                            Authority Registry Coverage
                          </span>
                          <span className="text-base font-bold text-amber-400">{coveragePercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VIEW ANALYSIS activation bar */}
                  <div className="border-t border-gray-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                      {loadingAnalysis ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                          <span>Resolving slow-path reasoning model pathways...</span>
                        </div>
                      ) : gateApproved ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Slow-Path Reasoning Compiled. Authority Match Lock Cleared.
                        </span>
                      ) : (
                        <span>Pre-flight checks ready. Submit inquiry to initialize.</span>
                      )}
                    </div>

                    <button
                      onClick={() => setViewingAnalysis(true)}
                      disabled={!gateApproved}
                      className={`font-display font-extrabold text-xs px-6 py-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                        gateApproved
                          ? "bg-amber-500 text-gray-950 hover:bg-amber-400 font-extrabold tracking-wider shadow-lg shadow-amber-950/20"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                      }`}
                    >
                      <span>VIEW ANALYSIS →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* If analysis loading overlay (outside of gate) */}
              {loadingAnalysis && !coverageGateOpen && (
                <div className="bg-[#111827]/30 border border-gray-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    Compiling High-Altitude Navigation Map...
                  </h4>
                </div>
              )}

              {/* Error view */}
              {errorText && (
                <div className="border border-red-900/50 bg-red-950/10 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs uppercase font-bold text-red-400 font-mono">Cognitive Matrix Link Error</h4>
                    <p className="text-xs text-red-300 font-sans mt-0.5">{errorText}</p>
                  </div>
                </div>
              )}

              {/* Mapped results (only visible when view approved) */}
              {analysis && !loadingAnalysis && viewingAnalysis && (
                <div className="space-y-6">
                  <SimonSection
                    pathways={analysis.pathways}
                    selectedPathId={selectedPath ? selectedPath.id : null}
                    onSelectPath={(path) => {
                      setSelectedPath(path);
                      setDispatchedDirectiveText(null);
                      setDispatchedSignature(null);
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <JemmaSection 
                      selectedPath={selectedPath} 
                      userId={userId}
                      onDeltaLogged={loadDeltas}
                    />
                    <div className="space-y-6">
                      <OctagonSection audit={analysis.octagonAudit} />
                      <CrystalBridgeSection
                        selectedPath={selectedPath}
                        tension={analysis.aether}
                        audit={analysis.octagonAudit}
                        operatorName={operatorName}
                        onDispatchApproved={(txt, sig) => {
                          setDispatchedDirectiveText(txt);
                          setDispatchedSignature(sig);
                        }}
                        dispatchedDirectiveText={dispatchedDirectiveText}
                        dispatchedSignature={dispatchedSignature}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Historical workspace session ledger list */}
              <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-5 mt-6">
                <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-wider mb-3">
                  <History className="h-4.5 w-4.5 text-emerald-400" />
                  <span>Historical Sessions Ledger</span>
                </div>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {loadingHistory ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    </div>
                  ) : historySessions.length === 0 ? (
                    <div className="text-[10px] text-gray-500 font-mono text-center py-4">
                      [NO SESSIONS COMMITTED TO CLOUD FIRESTORE]
                    </div>
                  ) : (
                    historySessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => handleRestoreSession(sess)}
                        className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition ${
                          currentSessionId === sess.id
                            ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-100"
                            : "bg-gray-950/40 border-gray-850 hover:bg-gray-900/30"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                          <span className="font-sans font-medium text-gray-300 truncate pr-2">
                            {sess.inquiry}
                          </span>
                          {sess.selectedPathwayId && (
                            <span className="text-[8px] font-mono bg-[#1f2937] text-gray-400 px-1.5 py-0.5 rounded font-black shrink-0">
                              {sess.selectedPathwayId.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] text-gray-500 font-mono">
                            {sess.updatedAt ? new Date(sess.updatedAt).toLocaleDateString() : ""}
                          </span>
                          <button
                            onClick={(e) => sess.id && handleDeleteSession(e, sess.id)}
                            className="text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === "delta" && (
          <SubstrateDeltaSection
            deltas={substrateDeltas}
            onAddDelta={handleCreateDelta}
            onDeleteDelta={handleDeleteDelta}
            loading={loadingDeltas}
          />
        )}

        {activeTab === "docs" && (
          <SovereignDriveDocsBridge
            accessToken={accessToken}
            selectedIds={evidenceDocs.map(d => d.id)}
            evidenceDocs={evidenceDocs}
            onEvidenceUpdated={onEvidenceDocsChange}
            dispatchedDirective={dispatchedDirectiveText}
          />
        )}
      </div>
    </div>
  );
}
