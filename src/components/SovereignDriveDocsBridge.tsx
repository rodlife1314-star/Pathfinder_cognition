import React, { useState, useEffect } from "react";
import { DriveFile } from "../types";
import { 
  Search, 
  FileText, 
  Check, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  FolderSync, 
  TrendingUp,
  FileUp,
  ExternalLink
} from "lucide-react";

interface SovereignDriveDocsBridgeProps {
  accessToken: string;
  selectedIds: string[];
  evidenceDocs: { id: string; name: string; content: string }[];
  onEvidenceUpdated: (evidence: { id: string; name: string; content: string }[]) => void;
  dispatchedDirective?: string | null;
}

export default function SovereignDriveDocsBridge({
  accessToken,
  selectedIds,
  evidenceDocs,
  onEvidenceUpdated,
  dispatchedDirective
}: SovereignDriveDocsBridgeProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  
  // Google Docs Export States
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ url: string; name: string } | null>(null);

  const fetchDriveFiles = async (queryName?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Find both txt and Google Doc files which pathfinder can ingest
      let q = "(mimeType='application/vnd.google-apps.document' or mimeType='text/plain') and trashed=false";
      if (queryName) {
        const sanitized = queryName.replace(/'/g, "\\'");
        q = `name contains '${sanitized}' and ` + q;
      }
      
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=10&orderBy=modifiedTime desc`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error?.message || `Google Drive status code: ${res.status}`);
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error("Error retrieving Drive roster:", err);
      setError(err?.message || "Failed to sync drive directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles();
    }
  }, [accessToken]);

  const handleToggle = async (file: DriveFile) => {
    const isSelected = selectedIds.includes(file.id);

    if (isSelected) {
      const nextEvidence = evidenceDocs.filter(item => item.id !== file.id);
      onEvidenceUpdated(nextEvidence);
    } else {
      setLoadingFileId(file.id);
      try {
        let textContent = "";
        let fetchUrl = "";

        if (file.mimeType === "application/vnd.google-apps.document") {
          fetchUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
        } else {
          fetchUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        }

        const res = await fetch(fetchUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          throw new Error(`Text pipeline extraction err: ${res.status}`);
        }

        textContent = await res.text();
        
        // Soft limits for prompt sizes
        if (textContent.length > 50000) {
          textContent = textContent.slice(0, 50000) + "\n\n[Content truncated by Hermes pipeline protection limit]";
        }

        const nextEvidence = [...evidenceDocs, { id: file.id, name: file.name, content: textContent }];
        onEvidenceUpdated(nextEvidence);
      } catch (err: any) {
        console.error("Text content ingest failed:", err);
        alert(`Failed to parse active evidence string from "${file.name}": ` + (err?.message || "Verify file encoding."));
      } finally {
        setLoadingFileId(null);
      }
    }
  };

  // Export finished Directive document back to google docs as an audit proof sheet!
  const exportToGoogleDocs = async () => {
    if (!dispatchedDirective) {
      alert("No active authorized directive found to export.");
      return;
    }

    setExporting(true);
    setExportResult(null);
    try {
      const name = `PATHFINDER_AUDIT_REPORT_${new Date().toISOString().slice(0,10)}`;
      const boundary = "313337_PATH_BOUNDARY";
      
      // Use multipart upload to define metadata (create as Google Doc) and file contents (plain text gets converted)
      const metadata = {
        name: name,
        mimeType: "application/vnd.google-apps.document"
      };

      const multipartBody = 
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
        dispatchedDirective +
        `\r\n--${boundary}--`;

      const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!res.ok) {
        throw new Error(`Google Drive write request discarded: ${res.status}`);
      }

      const fileData = await res.json();
      const docUrl = `https://docs.google.com/document/d/${fileData.id}/edit`;
      setExportResult({
        name: name,
        url: docUrl
      });
    } catch (err: any) {
      console.error("Google Docs write failure:", err);
      alert(
        "Authorize Error: Workspace Vault readonly scope prevents creation. Please ensure write access is enabled or download the audit report as plain text."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-5 flex flex-col h-full overflow-hidden" id="sovereign-drive-bridge">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/60 pb-3">
        <div className="flex items-center gap-2">
          <FolderSync className="h-4.5 w-4.5 text-blue-400" />
          <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest">
            Sovereign Workspace Navigator
          </h3>
        </div>
        <button
          onClick={() => fetchDriveFiles(searchTerm)}
          disabled={loading}
          className="text-gray-500 hover:text-white transition p-1 rounded hover:bg-gray-800"
          id="btn-sync-drive-explorer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Exporter Block (Audit Export back to Docs) */}
      {dispatchedDirective && (
        <div className="mb-4 bg-blue-950/20 border border-blue-900/40 rounded-lg p-3.5 text-xs">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block mb-1">
            Active Directive Exporter
          </span>
          <p className="text-gray-400 mb-3 text-[11px] leading-relaxed">
            Sovereign Audit Loop is active. Package this decision report and upload to your workspace files as a structured document.
          </p>
          
          {exportResult ? (
            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded p-2.5 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">Upload Successful</span>
                <p className="text-[11px] text-gray-300 truncate">{exportResult.name}</p>
              </div>
              <a
                href={exportResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono hover:text-emerald-300 font-bold shrink-0"
              >
                OPEN <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <button
              onClick={exportToGoogleDocs}
              disabled={exporting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-display font-medium py-2 rounded flex items-center justify-center gap-2 transition cursor-pointer"
              id="google-docs-export-action"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating Doc...
                </>
              ) : (
                <>
                  <FileUp className="h-3.5 w-3.5" />
                  Export Audit to Sovereign Document
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Directory Search Block */}
      <div className="flex gap-1.5 mb-3">
        <input
          type="text"
          placeholder="Filter workspace files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-950/70 border border-gray-800 focus:border-blue-500 rounded text-xs px-2.5 py-1.5 text-gray-200 outline-none font-sans"
          id="drive-bridge-input-search"
        />
        <button
          onClick={() => fetchDriveFiles(searchTerm)}
          className="bg-gray-800 hover:bg-gray-700 text-[10px] font-mono px-2.5 rounded text-gray-300 cursor-pointer"
          id="btn-bridge-search"
        >
          Go
        </button>
      </div>

      {loading && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2 flex-1">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <span className="text-[10px] text-gray-500 font-mono">Syncing directory ledger...</span>
        </div>
      ) : error ? (
        <div className="p-3 bg-red-950/10 border border-red-900/30 rounded text-xs text-red-400/90 text-center flex-1 flex flex-col justify-center">
          <AlertCircle className="h-4 w-4 mx-auto mb-1.5 text-red-500" />
          <span>Access Restricted! Check auth connections.</span>
        </div>
      ) : files.length === 0 ? (
        <div className="border border-dashed border-gray-800 rounded p-6 text-center text-[10px] text-gray-500 font-mono flex-1 flex flex-col justify-center">
          <span>No documents found in workspace namespace.</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {files.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            const isTargetLoading = loadingFileId === file.id;

            return (
              <div
                key={file.id}
                onClick={() => !isTargetLoading && handleToggle(file)}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer transition select-none ${
                  isSelected
                    ? "bg-blue-950/20 border-blue-500/50 text-blue-100"
                    : "bg-gray-905 border-gray-850 hover:bg-gray-800/30"
                }`}
                id={`drive-bridge-file-${file.id}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {isTargetLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                  ) : (
                    <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-blue-400" : "text-gray-500"}`} />
                  )}
                  <span className="text-[11px] font-medium truncate whitespace-nowrap pr-1 text-gray-300">
                    {file.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="shrink-0 text-emerald-400 font-mono text-[9px] bg-emerald-950/20 border border-emerald-900/40 px-1 py-0.5 rounded font-black">
                    BOUND
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
