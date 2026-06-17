import React from "react";
import { Pathway } from "../types";
import { Compass, ArrowRight } from "lucide-react";

interface SimonSectionProps {
  pathways: Pathway[];
  selectedPathId: string | null;
  onSelectPath: (path: Pathway) => void;
}

export default function SimonSection({
  pathways,
  selectedPathId,
  onSelectPath
}: SimonSectionProps) {
  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6" id="simon-section-module">
      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-2">
        <Compass className="h-4.5 w-4.5" />
        <span>III. SIMON (Structured Interpretation & Navigation)</span>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-display font-medium text-gray-100 mb-1.5">
          Divergent Posture Trajectories
        </h3>
        <p className="text-xs text-gray-500 font-sans leading-relaxed">
          SIMON maps physical alternatives from conservative options to aggressive thrusts. Each path is bound to a specific governing protocol.
        </p>
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
                  : "bg-gray-950/40 border-gray-850 hover:bg-gray-900/30"
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

                <h4 className="text-xs font-display font-bold text-gray-200 uppercase tracking-wide mb-1.5 truncate">
                  {path.name}
                </h4>

                <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed font-sans mb-3">
                  {path.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-gray-800/40 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>Claims: {path.traceableFindings.length}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  Inspect <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
