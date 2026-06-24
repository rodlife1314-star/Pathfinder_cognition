import React, { useState, useEffect } from "react";
import { AnalysisResponse, Pathway } from "../types";
import { 
  saveSession, 
  getSessions, 
  deleteSession, 
  saveSubstrateDelta, 
  getSubstrateDeltas, 
  deleteSubstrateDelta,
  saveAuthorityRegistration,
  getAuthorityRegistrations,
  PathfinderSession,
  SubstrateDelta,
  AuthorityRegistration
} from "../services/firebase";
import { executeCognitiveAnalysis } from "../services/api";
import { classifyInquiryDomain, computeCoverageMetric, generateAetherRequirement } from "../services/domains";
import { getTelemetryDocs, filterRapidsCandidates } from "../services/telemetryData";
import { AetherRequirementPacket } from "../types";

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
import JemmaChallenge from "./JemmaChallenge";

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
  History,
  Check,
  X,
  Filter,
  Eye,
  Search,
  ShieldAlert,
  Layers,
  Zap,
  PlusCircle,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Database
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

  // Unified Aperture-RAPIDS-Hermes Bridge States
  const [activePacket, setActivePacket] = useState<AetherRequirementPacket | null>(null);
  const [rapidsStatus, setRapidsStatus] = useState<"idle" | "scanning" | "ready">("idle");
  const [didDispatchToHermes, setDidDispatchToHermes] = useState(false);

  // Progressive 5-Step Operator Journey Stage
  const [currentJourneyStep, setCurrentJourneyStep] = useState<"observation" | "investigation" | "validation" | "decision" | "action">("observation");

  // Dynamic Persistent Authority Registry States
  const [registeredCustomAuthorities, setRegisteredCustomAuthorities] = useState<AuthorityRegistration[]>([]);
  const [loadingAuthorities, setLoadingAuthorities] = useState(false);

  const loadCustomAuthorities = async () => {
    if (!userId) return;
    setLoadingAuthorities(true);
    try {
      const regs = await getAuthorityRegistrations(userId);
      setRegisteredCustomAuthorities(regs);
    } catch (err) {
      console.error("Failed to load registered custom authorities:", err);
    } finally {
      setLoadingAuthorities(false);
    }
  };

  const handleRegisterAuthority = async (candidate: any) => {
    if (!userId || !activePacket) return;
    try {
      const record: AuthorityRegistration = {
        userId,
        domain: activePacket.domainId,
        name: candidate.sourceName,
        shortName: candidate.shortName || candidate.sourceName.split(" ")[0],
        url: candidate.url || "https://pathfinder.aperture.internal",
        tier: candidate.tier || "Tier-1 Sovereign",
        description: candidate.reason || candidate.aetherReason || "AETHER mapped dependency."
      };
      await saveAuthorityRegistration(record);
      await loadCustomAuthorities();
    } catch (err) {
      console.error("Could not register authority:", err);
      alert("Failed to write dynamic authority to persistent substrate ledger.");
    }
  };

  // Parse state into active packet requirements
  const handleMapUncertainty = () => {
    if (!inquiry.trim()) {
      alert("Inquiry cannot remain blank for mapping uncertainty.");
      return;
    }

    const packet = generateAetherRequirement(inquiry);
    setActivePacket(packet);
    setRapidsStatus("scanning");
    setDidDispatchToHermes(false);

    // Simulate high-speed RAPIDS search-space compression
    setTimeout(() => {
      setRapidsStatus("ready");
    }, 1200);

    // Auto navigate to investigation Stage
    setCurrentJourneyStep("investigation");
  };

  const handleIngestTelemetryToHermes = () => {
    if (!activePacket) return;

    const telemetryDocs = getTelemetryDocs(activePacket.domainId);
    
    // Merge without duplication by matching id
    const existingIds = new Set(evidenceDocs.map(d => d.id));
    const docsToAdd = telemetryDocs.filter(d => !existingIds.has(d.id));

    if (docsToAdd.length > 0) {
      onEvidenceDocsChange([...evidenceDocs, ...docsToAdd]);
    }

    setDidDispatchToHermes(true);
  };

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
      setViewingAnalysis(true);
      setCurrentJourneyStep("validation");
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
      alert("Failed to sync workspace states with cloud Substrate.");
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
    setActivePacket(null);
    setRapidsStatus("idle");
    setDidDispatchToHermes(false);
    setCurrentJourneyStep("observation");
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

    // Dynamic reconstruction of requirements packet on restore
    const packet = generateAetherRequirement(sess.inquiry);
    setActivePacket(packet);
    setRapidsStatus("ready");
    setDidDispatchToHermes(sess.evidenceDocs && sess.evidenceDocs.length > 0);

    if (sess.analysis) {
      setCoverageGateOpen(true);
      setGateApproved(true);
      setViewingAnalysis(true);
      if (sess.dispatchedDirective) {
        setCurrentJourneyStep("action");
      } else {
        setCurrentJourneyStep("decision");
      }
    } else {
      setCoverageGateOpen(false);
      setGateApproved(false);
      setViewingAnalysis(false);
      setCurrentJourneyStep("investigation");
    }

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
      loadCustomAuthorities();
    }
  }, [userId]);

  return (
    <div className="flex flex-col gap-5 h-full" id="delta-workspace-framework">
      {/* Session persistence header hub */}
      <div className="bg-[#0e1422]/90 border border-gray-800/80 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest">
            Sovereign Delta Coordinator
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
            {isFieldMode ? "Observation Aperture" : "Field Mode Sensors"}
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
              {/* Progressive Stage Stepper */}
              <div className="bg-[#0e1422]/90 border border-gray-850 p-4 rounded-xl">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      COGNITIVE DECISION JOURNEY
                    </span>
                    <span className="text-xs font-sans text-gray-400 hidden sm:inline">
                      Progressive Operator Alignment Pipeline
                    </span>
                  </div>
                  
                  {/* The Stepper Nodes */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    {[
                      { key: "observation", label: "I. Observation", icon: Eye },
                      { key: "investigation", label: "II. Investigation", icon: Search },
                      { key: "validation", label: "III. Validation", icon: ShieldAlert },
                      { key: "decision", label: "IV. Decision", icon: Layers },
                      { key: "action", label: "V. Action", icon: Zap },
                    ].map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = currentJourneyStep === step.key;
                      const isCompleted = ["observation", "investigation", "validation", "decision", "action"].indexOf(currentJourneyStep) > index;
                      
                      return (
                        <React.Fragment key={step.key}>
                          <button
                            onClick={() => {
                              if (step.key === "observation") {
                                setCurrentJourneyStep("observation");
                              } else if (step.key === "investigation" && activePacket) {
                                setCurrentJourneyStep("investigation");
                              } else if (["validation", "decision", "action"].includes(step.key) && analysis) {
                                setCurrentJourneyStep(step.key as any);
                              } else {
                                alert(`Step locked. Formulate inquiry in Stage I and compile analysis in Stage II first.`);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                              isActive
                                ? "bg-indigo-950/40 text-indigo-300 border-indigo-955/70 font-semibold shadow-inner"
                                : isCompleted
                                ? "bg-emerald-9950/20 text-emerald-400 border-emerald-900/40"
                                : "bg-gray-950/30 text-gray-500 border-gray-900/50 hover:text-gray-400"
                            }`}
                          >
                            <StepIcon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-300 animate-pulse" : isCompleted ? "text-emerald-400" : "text-gray-500"}`} />
                            <span>{step.label}</span>
                          </button>
                          {index < 4 && <ChevronRight className="h-3.5 w-3.5 text-gray-850 hidden lg:inline shrink-0" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main Split Inquiry Formulation and Ingested Evidence */}
              {currentJourneyStep === "observation" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-down">
                  <AetherSection
                    inquiry={inquiry}
                    onInquiryChange={setInquiry}
                    analysis={analysis ? analysis.aether : null}
                    loading={loadingAnalysis || rapidsStatus === "scanning"}
                    onRunAnalysis={handleMapUncertainty}
                    evidenceDocsCount={evidenceDocs.length}
                  />
                  <div className="bg-[#111827]/65 border border-gray-850 p-6 rounded-xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Observational Guidance</span>
                      </div>
                      <h3 className="text-sm font-display font-medium text-gray-200">
                        Formulate Inquiries Cleanly
                      </h3>
                      <p className="text-xs text-gray-400 font-sans leading-relaxed">
                        Enter your active inquiry parameters in the text field. When you click <strong className="text-gray-200">Map Uncertainty</strong>, the AETHER Fast-Path maps open uncertainty forces on the fly, immediately prompting RAPIDS to scope targeted registries.
                      </p>
                      <div className="bg-gray-950/65 p-4 rounded-lg border border-gray-900 text-xs font-mono space-y-1">
                        <p className="text-indigo-400 font-semibold">[Expected Inquiries]:</p>
                        <ul className="list-disc pl-4 text-gray-400 space-y-1">
                          <li>Finance spot rate spreads or ledger reconciliations.</li>
                          <li>Astrophysics celestial dynamics or star catalogue coordinate drift.</li>
                          <li>Medical study classification or drug efficacy evaluations.</li>
                        </ul>
                      </div>
                    </div>
                    
                    {activePacket && (
                      <div className="bg-emerald-950/10 border border-emerald-900/50 text-emerald-400 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Uncertainty mapped to <strong className="uppercase">{activePacket.domainName}</strong> pipeline.</span>
                        </div>
                        <button
                          onClick={() => setCurrentJourneyStep("investigation")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 rounded transition text-xs flex items-center gap-1 font-mono cursor-pointer"
                        >
                          Proceed to Stage II →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Investigation Panel */}
              {currentJourneyStep === "investigation" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-down">
                  <div className="bg-gray-900/10 border border-gray-850 p-6 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-wider">
                      <FolderOpen className="h-4 w-4" />
                      <span>Ingested Evidence Jurisdiction</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Hermes holds and evaluates ingest folders. Upload spreadsheets, fetch from Sovereign Drive, or append manual observation notes below.
                    </p>
                    <HermesSection
                      evidenceDocs={evidenceDocs}
                      onEvidenceDocsChange={onEvidenceDocsChange}
                      analysisSummary={analysis ? analysis.evidenceAnalysis.summary : undefined}
                    />
                  </div>
                  
                  {/* Space reserved for RAPIDS, which will handle candidate list and dynamic validation below */}
                  <div className="bg-gray-950/10 border border-dashed border-gray-850 p-6 rounded-xl text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
                    <Search className="h-6 w-6 text-indigo-400 mx-auto" />
                    <h4 className="text-xs font-mono text-gray-400">RAPIDS Candidate Ingress Channels</h4>
                    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                      Candidates loaded from active requirements packet filter list. Use the central routing portal right below to register unregistered nodes.
                    </p>
                  </div>
                </div>
              )}

              {/* RAPIDS Telescopic Parallel Search-Space Optimizer */}
              {activePacket && currentJourneyStep === "investigation" && (
                <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 space-y-4 animate-fade-in" id="rapids-aperture-panel">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${rapidsStatus === "scanning" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${rapidsStatus === "scanning" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                      </span>
                      <span>RAPIDS (Signal Routing & Search-Space Compression)</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">STATUS: <span className="uppercase font-bold text-gray-200">{rapidsStatus}</span></span>
                  </div>

                  {/* Packet Display Block - AETHER_REQUIREMENT_PACKET */}
                  <div className="bg-gray-950/60 border border-gray-850 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center pb-2.5 border-b border-gray-850">
                      <div className="flex items-center gap-1.5 magnet-effect">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">[Requirement Blueprint]</span>
                        <span className="bg-indigo-900/30 text-indigo-300 border border-indigo-900/40 text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider font-bold">
                          {activePacket.domainName}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded">AETHER_REQUIREMENT_PACKET : ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-widest font-black">
                          Mapped Uncertainty Sphere
                        </span>
                        <p className="text-gray-300 font-sans leading-relaxed italic bg-gray-900/40 border border-gray-900/60 p-3.5 rounded-lg border-l-2 border-l-indigo-500 text-xs">
                          "{activePacket.uncertainty}"
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5 font-bold">
                            Target Authority Chain Needed
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activePacket.authorityChainNeeded.map((auth, idx) => (
                              <span key={idx} className="bg-emerald-950/35 text-emerald-300 border border-emerald-900/40 text-[9px] px-2.5 py-1 rounded font-mono font-medium">
                                {auth}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-rose-400/80 uppercase tracking-wider block mb-1.5 font-bold">
                            Outside Jurisdiction (Blocked Sources)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activePacket.blockedAuthorities.map((auth, idx) => (
                              <span key={idx} className="bg-rose-950/25 text-rose-300/80 border border-rose-950/35 text-[9px] px-2.5 py-1 rounded font-mono line-through opacity-70">
                                {auth}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scanning Animation or Ingest Options */}
                  {rapidsStatus === "scanning" ? (
                    <div className="border border-dashed border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-gray-400 bg-gray-950/10">
                      <Loader2 className="h-6 w-6 text-emerald-400 animate-spin mb-1" />
                      <p className="animate-pulse tracking-wide font-bold text-emerald-300">[RAPIDS RESOLVING HIGH-SPEED RETRIEVAL CHANNELS...]</p>
                      <div className="text-[9px] text-gray-500 space-y-0.5 text-center leading-relaxed">
                        <p>Initializing GPU cluster partition scan...</p>
                        <p>Verifying target authority metadata signatures...</p>
                        <p>Filtering unapproved secondary channels...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Sub-panel 1: AETHER Blueprint Hand-off Filtering */}
                      <div className="bg-gray-950/40 border border-gray-850 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">
                            AETHER → RAPIDS Core Hand-off & Filtering Pipeline
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded animate-pulse">
                            [AETHER CONSTRAINTS ENGAGED]
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                          RAPIDS has successfully loaded the AETHER Blueprint constraints for the active domain. Candidates are evaluated against the required <span className="text-emerald-400 font-mono font-medium font-bold">authority chain</span> and cross-referenced with <span className="text-rose-400 font-mono font-medium font-bold">blocked jurisdictions</span>.
                        </p>
                        <div className="space-y-2 max-h-[185px] overflow-y-auto pr-1">
                          {filterRapidsCandidates(activePacket.domainId, activePacket.blockedAuthorities, activePacket.authorityChainNeeded).map((candidate) => {
                            let badgeStyle = "";
                            let icon = null;
                            let isUnregisteredState = false;

                            if (candidate.status === "APPROVED") {
                              badgeStyle = "bg-emerald-950/40 text-emerald-300 border-emerald-900/40 font-bold";
                              icon = <Check className="h-3 w-3 text-emerald-400 shrink-0" />;
                            } else if (candidate.status === "BLOCKED") {
                              badgeStyle = "bg-rose-950/30 text-rose-300/90 border-rose-950/40 font-bold line-through opacity-70";
                              icon = <X className="h-3 w-3 text-rose-400 shrink-0" />;
                            } else if (candidate.status === "NOT_REGISTERED") {
                              isUnregisteredState = true;
                              const isAdded = registeredCustomAuthorities.some(
                                reg => reg.name === candidate.sourceName && reg.domain === activePacket.domainId
                              );
                              if (isAdded) {
                                badgeStyle = "bg-emerald-950 text-emerald-400 border-emerald-800 font-bold";
                                icon = <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />;
                              } else {
                                badgeStyle = "bg-amber-950/60 text-amber-500 border-amber-900/40 font-mono font-bold";
                                icon = <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />;
                              }
                            } else {
                              badgeStyle = "bg-[#241118]/20 text-yellow-400 border-yellow-950/30 opacity-60";
                              icon = <Filter className="h-3 w-3 text-yellow-500 shrink-0" />;
                            }

                            const isAddedToDb = registeredCustomAuthorities.some(
                              reg => reg.name === candidate.sourceName && reg.domain === activePacket.domainId
                            );

                            return (
                              <div key={candidate.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-gray-950/60 border border-gray-900 rounded-lg gap-2 text-xs transition-all hover:bg-gray-950/80">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] text-gray-500 font-mono uppercase bg-gray-900 px-1.5 py-0.5 rounded">
                                      {candidate.type}
                                    </span>
                                    <span className={`text-[11px] font-sans font-medium ${candidate.status === 'BLOCKED' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                      {candidate.sourceName}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-mono font-sans italic opacity-85">
                                    → {candidate.reason}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                  <span className="text-[9px] text-gray-500 font-mono">Reliability: {candidate.reliability}</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded border font-mono flex items-center gap-1 ${badgeStyle}`}>
                                    {icon}
                                    {isUnregisteredState ? (isAddedToDb ? "REGISTERED Node" : "NOT REGISTERED") : candidate.status}
                                  </span>
                                  {isUnregisteredState && !isAddedToDb && (
                                    <button
                                      onClick={() => handleRegisterAuthority(candidate)}
                                      className="bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] text-white font-mono text-[9.5px] px-2.5 py-1 rounded transition flex items-center gap-1 font-bold border border-indigo-550 shadow-md shadow-indigo-950/30 cursor-pointer"
                                    >
                                      <PlusCircle className="h-3 w-3" />
                                      + REGISTER NODE
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sub-panel 2: Resolved Approved Signal Traces for Hermes */}
                      <div className="bg-gray-950/30 border border-gray-850 rounded-lg p-4 space-y-3">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
                          RAPIDS Solved Signal Target Payload (Safe to Ingest into HERMES)
                        </span>
                        <div className="space-y-2 font-mono text-xs">
                          {getTelemetryDocs(activePacket.domainId).map((doc) => {
                            const isAlreadyIngested = evidenceDocs.some(d => d.id === doc.id);
                            return (
                              <div key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-950/40 border border-gray-900 rounded-lg gap-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                                  <span className="text-gray-300 font-sans font-medium text-xs truncate max-w-md">{doc.name}</span>
                                </div>
                                <span className={`text-[9px] px-2 py-1 rounded font-mono shrink-0 ${isAlreadyIngested ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" : "bg-gray-900 text-gray-500 border border-gray-850"}`}>
                                  {isAlreadyIngested ? "√ HERMES_CONTAINED" : "[APPROVED_BY_RAPIDS] [SIGNAL_READIED]"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Unified Bridge Trigger Button Bar */}
                      <div className="flex flex-col md:flex-row gap-4 pt-2">
                        {!didDispatchToHermes ? (
                          <button
                            onClick={handleIngestTelemetryToHermes}
                            className="bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] text-white text-xs font-display font-bold px-5 py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 shadow-lg shadow-emerald-950/30 uppercase tracking-wider"
                          >
                            Deploy RAPIDS Tunnel → Ingest Approved Evidence to Hermes
                          </button>
                        ) : (
                          <div className="flex-1 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs px-5 py-3 text-center font-mono flex items-center justify-center gap-2 animate-fade-in">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            EVIDENTIARY TRACES SECURELY ANCHORED IN HERMES JURISDICTION
                          </div>
                        )}

                        <button
                          onClick={handleRunAnalysis}
                          disabled={loadingAnalysis || !didDispatchToHermes}
                          className="bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] disabled:scale-100 disabled:bg-gray-850 disabled:text-gray-500 text-white text-xs font-display font-bold px-5 py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer md:w-80 shadow-lg shadow-indigo-950/30 uppercase tracking-wider"
                          id="btn-trigger-slowpath-inquest"
                        >
                          {loadingAnalysis ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-indigo-200" />
                              Compiling Inquest...
                            </>
                          ) : (
                            <>
                              Compile System Analysis (Slow-Path)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
                      {/* Coverage Gate preflight blocking overlay */}
              {currentJourneyStep === "investigation" && coverageGateOpen && !viewingAnalysis && classifiedDomain && (
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
                            <span key={index} className="bg-[#1f2937]/50 text-gray-305 border border-gray-805 text-[9px] px-2 py-0.5 rounded font-mono">
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
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-505 animate-pulse"></span>
                          Slow-Path Reasoning Compiled. Authority Match Lock Cleared.
                        </span>
                      ) : (
                        <span>Pre-flight checks ready. Submit inquiry to initialize.</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setViewingAnalysis(true);
                        setCurrentJourneyStep("validation");
                      }}
                      disabled={!gateApproved}
                      className={`font-display font-extrabold text-xs px-6 py-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                        gateApproved
                          ? "bg-amber-500 text-gray-950 hover:bg-amber-400 font-extrabold tracking-wider shadow-lg shadow-amber-950/20"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                      }`}
                    >
                      <span>VIEW ANALYSIS & START AUDIT →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progressive Stage III: Validation Gating */}
              {!loadingAnalysis && currentJourneyStep === "validation" && (
                <div className="space-y-6 animate-fade-in-down">
                  {analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-emerald-950/15 border border-emerald-900/50 text-emerald-400 p-4 rounded-xl flex items-center justify-between text-xs gap-3 animate-fade-in">
                          <span>Cognitive signals verified. Conduct contradiction audits below or advance.</span>
                          <button
                            onClick={() => setCurrentJourneyStep("decision")}
                            className="bg-indigo-600 hover:bg-indigo-505 text-white font-mono text-[11px] px-3 py-1.5 rounded transition shrink-0 cursor-pointer font-bold"
                          >
                            Proceed to Stage IV →
                          </button>
                        </div>
                        <JemmaSection 
                          selectedPath={selectedPath} 
                          userId={userId}
                          onDeltaLogged={loadDeltas}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-900/40 border border-gray-850 rounded-xl p-4 text-xs font-sans text-gray-400">
                          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold mb-1">Validation Audit Console</span>
                          Cross-reference findings against dynamic friction reports below. Challenge authorities, check system boundaries, and log deltas.
                        </div>
                        <JemmaChallenge 
                          selectedPath={selectedPath}
                          userId={userId}
                          onDeltaLogged={loadDeltas}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111827]/80 rounded-xl border border-gray-850 p-8 text-center py-16 space-y-3">
                      <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto animate-pulse" />
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Validation Systems Offline</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Validation checks require active slow-path calculations. Complete observation and compile system analysis in Stage II first.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Progressive Stage IV: Decision Gating */}
              {!loadingAnalysis && currentJourneyStep === "decision" && (
                <div className="space-y-6 animate-fade-in-down">
                  {analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <SimonSection
                          pathways={analysis.pathways}
                          selectedPathId={selectedPath ? selectedPath.id : null}
                          onSelectPath={(path) => {
                            setSelectedPath(path);
                            setDispatchedDirectiveText(null);
                            setDispatchedSignature(null);
                          }}
                          activePacket={activePacket}
                        />
                        
                        {selectedPath ? (
                          <div className="bg-emerald-950/15 border border-emerald-950/40 text-emerald-400 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in gap-3">
                            <span>Trajectory <strong className="font-mono uppercase text-emerald-300">[{selectedPath.id.toUpperCase()}]</strong> selected. Ready for final dispatch signatures.</span>
                            <button
                              onClick={() => setCurrentJourneyStep("action")}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] px-3.5 py-1.5 rounded transition shrink-0 cursor-pointer font-bold"
                            >
                              Finalize Action →
                            </button>
                          </div>
                        ) : (
                          <div className="bg-amber-950/15 border border-amber-900/30 text-amber-505 p-4 rounded-xl text-xs">
                            Select an active tracking pathway trajectory above to unlock CRYSTAL BRIDGE signature channels.
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-850 text-xs">
                          <span className="text-[9px] font-mono text-indigo-400 block uppercase tracking-wider font-bold mb-1">OCTAGON Governance Gate</span>
                          Evaluates safety policies and operator indemnity structures against classified targets on the persistent ledger.
                        </div>
                        <OctagonSection audit={analysis.octagonAudit} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111827]/80 rounded-xl border border-gray-850 p-8 text-center py-16 space-y-3">
                      <Layers className="h-8 w-8 text-indigo-400 mx-auto" />
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Alignment Pathways Idle</h4>
                      <p className="text-xs text-gray-550 max-w-sm mx-auto leading-relaxed">
                        Pathways are mapped during Stage II calculations. Build an uncertainty sphere and run analysis to unlock.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Progressive Stage V: Action Dispatch Gating */}
              {!loadingAnalysis && currentJourneyStep === "action" && (
                <div className="space-y-6 animate-fade-in-down">
                  {analysis ? (
                    <div className="max-w-2xl mx-auto">
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
                  ) : (
                    <div className="bg-[#111827]/80 rounded-xl border border-gray-850 p-8 text-center py-16 space-y-3">
                      <Zap className="h-8 w-8 text-emerald-400 mx-auto animate-pulse" />
                      <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Dispatch Channels Offline</h4>
                      <p className="text-xs text-gray-550 max-w-sm mx-auto leading-relaxed">
                        Bridge directives remain locked until a clear pathway is selected in Stage IV: Decision.
                      </p>
                    </div>
                  )}
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
                      [NO SESSIONS COMMITTED TO CLOUD SUBSTRATE]
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
