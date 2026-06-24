import React from "react";
import { Pathway, AetherRequirementPacket } from "../types";
import { Compass, ArrowRight, Radio, Cpu, Layers, Disc, Database, Activity, ShieldAlert, RadioTower } from "lucide-react";

interface SimonSectionProps {
  pathways: Pathway[];
  selectedPathId: string | null;
  onSelectPath: (path: Pathway) => void;
  activePacket?: AetherRequirementPacket | null;
}

const SIMON_DOMAINS_MONITOR: Record<string, {
  aetherEar: string;
  rapidsEar: string;
  hermesEar: string;
  jemmaEar: string;
  octagonEar: string;
}> = {
  astrophysics: {
    aetherEar: "Simbad database contains generic noise catalogs. IAU MPC and JPL SBDB Keplerian parameters hold correct jurisdiction.",
    rapidsEar: "MPC astrometric queries match active asteroid reference coordinates. Filters applied to reject unspecialized NED datasets.",
    hermesEar: "High-fidelity Keplerian variance matrix loaded from MPC dossiers. Cometary coma PSF excess confirms non-stellar density.",
    jemmaEar: "Cross-correlating star-galaxy overlap parameters. Validating cometary tail orientation against background stellar fields.",
    octagonEar: "Clearance path compliant under asteroid-hazard protocol 4.02. Ready for physical dispatch."
  },
  finance: {
    aetherEar: "Social media sentiment represents ungrounded speculation. Target authority is Coinbase Websocket for spot price verification.",
    rapidsEar: "Filtered unverified financial handles. Initialized CME Option Open Interest models alongside live spot indices.",
    hermesEar: "Ingested live asset trades showing gold spot trading at $2342.10. Order book spread depth is verified as 4500 oz.",
    jemmaEar: "Analyzing spot liquidation cascades vs real order-book depth. Confirming no basis anomalies between CME and Coinbase.",
    octagonEar: "FCA guidelines complied. Margin threshold compliance checked. Forwarding execution parameters."
  },
  medicine: {
    aetherEar: "Public comment forums present heavy anecdote distortion. Primary standard requires NICE and SNOMED clinical registries.",
    rapidsEar: "Bypassed WebMD directories. Parallel scanning ClinicalTrials.gov and FDA indications database models.",
    hermesEar: "Ingested double-blind clinical trial protocol (PROTO-ATHR-42) showing 64.2% synovial swelling reduction with 1.2% adverse cases.",
    jemmaEar: "Challenging potential patient demographic bias. Isolating GFR renal clearance constraints for severe patient risk segments.",
    octagonEar: "Efficacy signals conform to CDER therapeutic benchmarks. Safe-dosage lock checked and verified."
  },
  law: {
    aetherEar: "Unofficial law forums and blogs are blocked. Rooting case jurisdiction in BAILII case law judgements and HMCTS dockets.",
    rapidsEar: "Isolating EWHC commercial court schedules. Running high-frequency search over UK solicitor and regulatory registers.",
    hermesEar: "Retrieved High Court statutory precedent [2024] EWHC 812 (Comm). Ingested burden of proof guidelines for database delays.",
    jemmaEar: "Detecting authority drift. Evaluating scope overrides under Section 14 statutory performance clauses.",
    octagonEar: "Admissibility clearance locked. Legal weight metrics compiled. Sparing counsel dispatch cleared."
  },
  technology: {
    aetherEar: "Community forums present unverified snippets. Rooting network standard in authoritative IETF RFC and NIST databases.",
    rapidsEar: "Scanned IETF RFC index and NIST National Vulnerability Database. Filtered out generic, personal developer logs.",
    hermesEar: "Processed Proposed Standard RFC 9142. Verified CVSS v3.1 high severity hazard score of 8.8 for remote heap leakage.",
    jemmaEar: "Testing frame tracking sequence bounds. Validating origin constraint rules on iframe postMessage protocols.",
    octagonEar: "Security envelope compliance verified. Network latency metrics under 150ms limit. Dispatch approved."
  },
  food: {
    aetherEar: "Online cooking blogs contain high preparation variance. Grounding authority in FDA Safety standards and classic Escoffier.",
    rapidsEar: "Scanning USDA FoodData Central databases. Confirming classical mother sauce emulsification workflow structures.",
    hermesEar: "Ingested USDA raw polysaccharide spectrometer metrics and standard Escoffier Roux-Velouté temperature danger thresholds.",
    jemmaEar: "Checking thermodynamics. Modeling starch retrogradation thresholds if heating exceeds the 92°C irreversible limit.",
    octagonEar: "Thermal critical control points verified. Preservation threshold limits met. Workflow cleared for dispatch."
  },
  earth: {
    aetherEar: "Non-peer-reviewed climate forums present narrative drift. Rooting greenhouse parameters in NOAA and Copernicus readings.",
    rapidsEar: "Analyzing NOAA CCGG Pacific basin telemetry datasets and Copernicus ERA5 marine reanalysis indices.",
    hermesEar: "Ingested Mauna Loa dry air CO2 level of 422.30 ppm and Copernicus ERA5 SST marine temperature anomalies (+0.86°C).",
    jemmaEar: "Cross-checking atmospheric feedback factors. Validating infrared spectrometer dry air calibration profiles.",
    octagonEar: "Greenhouse metric confidence score > 99.8%. Regional data thresholds verified. Ready for Dispatch update."
  }
};

export default function SimonSection({
  pathways,
  selectedPathId,
  onSelectPath,
  activePacket
}: SimonSectionProps) {
  // Determine domain ID based on activePacket or fallback to first pathway prefix
  const domainId = activePacket?.domainId || pathways[0]?.id?.split("-")[0] || "finance";
  const monitoring = SIMON_DOMAINS_MONITOR[domainId] || SIMON_DOMAINS_MONITOR.finance;

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 space-y-6" id="simon-section-module">
      
      {/* Structural Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-850 pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
            <Compass className="h-4.5 w-4.5 text-emerald-400 animate-spin-slow" />
            <span className="font-bold">III. SIMON PERVASIVE COGNITIVE LISTENER</span>
          </div>
          <h3 className="text-base font-display font-medium text-gray-100">
            Decoupled Pattern Interpreter (Function over Geometry)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1 rounded">
          <RadioTower className="h-3 w-3 animate-pulse" />
          <span>SIMON CONTEXT WIRESTAT: RUNNING</span>
        </div>
      </div>

      {/* The Pervasive Listening Matrix Diagram */}
      <div className="bg-gray-950/70 border border-gray-850 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 pb-2 border-b border-gray-900">
          <span className="uppercase text-[10px] tracking-widest font-black text-gray-500">
            [SIMON INTERCEPT COGNITIONS]
          </span>
          <span className="text-gray-600">STRUCTURE BOUNDARIES MAPPED BY COMPASS</span>
        </div>

        {/* Timeline Sequence map */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3.5 pt-1 text-xs">
          {/* AETHER EAR */}
          <div className="bg-[#1e152a]/20 border border-indigo-950/40 p-3.5 rounded-lg space-y-2 relative overflow-hidden transition-all hover:bg-[#1e152a]/30">
            <div className="absolute top-0 right-0 p-1 font-mono text-indigo-500/20 font-black text-3xl select-none leading-none">
              AE
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5" />
              <span>AETHER (Define)</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans italic">
              "{monitoring.aetherEar}"
            </p>
          </div>

          {/* RAPIDS EAR */}
          <div className="bg-[#0e2a22]/10 border border-emerald-950/30 p-3.5 rounded-lg space-y-2 relative overflow-hidden transition-all hover:bg-[#0e2a22]/20">
            <div className="absolute top-0 right-0 p-1 font-mono text-emerald-500/10 font-black text-3xl select-none leading-none">
              RA
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5" />
              <span>RAPIDS (Locate)</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans italic">
              "{monitoring.rapidsEar}"
            </p>
          </div>

          {/* HERMES EAR */}
          <div className="bg-[#0f1d2c]/35 border border-indigo-900/15 p-3.5 rounded-lg space-y-2 relative overflow-hidden transition-all hover:bg-[#0f1d2c]/50">
            <div className="absolute top-0 right-0 p-1 font-mono text-blue-500/15 font-black text-3xl select-none leading-none">
              HE
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              <Database className="h-3.5 w-3.5" />
              <span>HERMES (Telescope)</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans italic">
              "{monitoring.hermesEar}"
            </p>
          </div>

          {/* JEMMA EAR */}
          <div className="bg-[#1c1c11]/25 border border-yellow-950/20 p-3.5 rounded-lg space-y-2 relative overflow-hidden transition-all hover:bg-[#1c1c11]/35">
            <div className="absolute top-0 right-0 p-1 font-mono text-yellow-500/15 font-black text-3xl select-none leading-none">
              JE
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-yellow-400/90 font-bold uppercase tracking-wider">
              <Activity className="h-3.5 w-3.5" />
              <span>JEMMA (Verify)</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans italic">
              "{monitoring.jemmaEar}"
            </p>
          </div>

          {/* OCTAGON EAR */}
          <div className="bg-[#241118]/20 border border-rose-950/30 p-3.5 rounded-lg space-y-2 relative overflow-hidden transition-all hover:bg-[#241118]/30">
            <div className="absolute top-0 right-0 p-1 font-mono text-rose-500/15 font-black text-3xl select-none leading-none">
              OC
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>OCTAGON (Authorize)</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans italic">
              "{monitoring.octagonEar}"
            </p>
          </div>
        </div>
      </div>

      {/* Divergent Postures */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono text-gray-400 uppercase tracking-wider">
            DIVERGENT POSTURE TRAJECTORIES FORMULATED BY SIMON
          </span>
          <span className="text-[10px] text-gray-500">SELECT TO SHIFT OBSERVER FOCUS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pathways.map((path) => {
            const isSelected = selectedPathId === path.id;
            
            let badgeStyle = "bg-blue-950/20 text-blue-400 border-blue-900/30";
            if (path.type === "conservative") {
              badgeStyle = "bg-emerald-900/20 text-emerald-400 border-emerald-900/40";
            } else if (path.type === "aggressive") {
              badgeStyle = "bg-amber-950/20 text-amber-400 border-amber-900/30";
            }

            return (
              <div
                key={path.id}
                onClick={() => onSelectPath(path)}
                className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition-all duration-300 relative ${
                  isSelected
                    ? "bg-[#0f1d2c]/90 border-emerald-500 shadow-md shadow-emerald-950/20"
                    : "bg-gray-950/40 border-gray-850 hover:bg-gray-900/30 hover:shadow"
                }`}
                id={`simon-pathcard-${path.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[9px] font-mono tracking-widest px-1.5 py-0.5 uppercase border rounded font-semibold ${badgeStyle}`}>
                      {path.type}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 font-semibold">{path.id.toUpperCase()}</span>
                  </div>

                  <h4 className="text-xs font-display font-medium text-gray-200 uppercase tracking-wide mb-1.5 truncate">
                    {path.name}
                  </h4>

                  <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed font-sans mb-3">
                    {path.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-gray-800/40 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>Claims Checkable: {path.traceableFindings.length}</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    Inspect <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
