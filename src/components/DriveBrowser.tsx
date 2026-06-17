import React, { useState, useEffect } from "react";
import { DriveFile } from "../types";
import { Search, FileText, Check, Loader2, RefreshCw, AlertCircle, HardDrive } from "lucide-react";

interface DriveBrowserProps {
  accessToken: string;
  onEvidenceUpdated: (evidence: { id: string; name: string; content: string }[]) => void;
  selectedIds: string[];
}

export default function DriveBrowser({ accessToken, onEvidenceUpdated, selectedIds }: DriveBrowserProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<{ id: string; name: string; content: string }[]>([]);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // Fetch file list from Google Drive
  const fetchDriveFiles = async (queryName?: string) => {
    setLoading(true);
    setError(null);
    try {
      let q = "(mimeType='application/vnd.google-apps.document' or mimeType='text/plain') and trashed=false";
      if (queryName) {
        // Sanitize single quotes for Google Drive API Q search parameter
        const sanitized = queryName.replace(/'/g, "\\'");
        q = `name contains '${sanitized}' and ` + q;
      }
      
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=15&orderBy=modifiedTime desc`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error?.message || `Google Drive returned status ${res.status}`);
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError(err?.message || "Failed to retrieve documents from Google Drive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles();
    }
  }, [accessToken]);

  // Handle Search on Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDriveFiles(searchTerm);
  };

  // Select or De-select a file. Load text content in real-time.
  const handleFileToggle = async (file: DriveFile) => {
    const isSelected = selectedIds.includes(file.id);

    if (isSelected) {
      // Remove file from pool
      const nextEvidence = activeEvidence.filter(item => item.id !== file.id);
      setActiveEvidence(nextEvidence);
      onEvidenceUpdated(nextEvidence);
    } else {
      // Add and load content of file
      setLoadingFileId(file.id);
      try {
        let contentText = "";
        let url = "";

        if (file.mimeType === "application/vnd.google-apps.document") {
          // Google Docs need export
          url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
        } else {
          // Raw files need alt=media
          url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to load document text. St: ${res.status}`);
        }

        contentText = await res.text();
        
        // Safety truncation
        if (contentText.length > 40000) {
          contentText = contentText.slice(0, 40000) + "\n\n[Content truncated for length]";
        }

        const nextEvidence = [...activeEvidence, { id: file.id, name: file.name, content: contentText }];
        setActiveEvidence(nextEvidence);
        onEvidenceUpdated(nextEvidence);
      } catch (err: any) {
        console.error("Error loading document text:", err);
        alert(`Could not extract evidence text from "${file.name}": ` + (err?.message || "Verify document contains text."));
      } finally {
        setLoadingFileId(null);
      }
    }
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return "N/A";
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex flex-col h-full overflow-hidden" id="drive-browser-module">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/40 rounded-lg text-blue-400 border border-blue-800/50">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold text-gray-100 uppercase tracking-widest">
              Hermes Evidence Selector
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              [SYSTEM STATUS: ONLINE. DIRECT INTEGRATION CONNECTED]
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchDriveFiles(searchTerm)}
          disabled={loading}
          className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-all duration-200"
          title="Recall Drive Catalog"
          id="btn-refresh-drive"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Query Search Banner */}
      <form onSubmit={handleSearchSubmit} className="relative mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Query filenames (e.g., QA report, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-950/80 border border-gray-800 hover:border-gray-700 focus:border-blue-500 text-sm rounded-lg pl-9 pr-4 py-2 text-gray-200 placeholder-gray-600 focus:outline-none transition-all duration-200 font-sans"
            id="drive-search-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-display px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer shrink-0"
          id="btn-search-drive"
        >
          {loading ? "querying..." : "Scan"}
        </button>
      </form>

      {/* Main Files Output Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[220px]">
        {loading && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs text-gray-500 font-mono">Recalling Drive hierarchy...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-red-400 uppercase font-mono mb-1">Authorization Disruption</h4>
            <p className="text-xs text-red-300 font-sans">{error}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="border border-dashed border-gray-800 rounded-lg p-8 text-center text-gray-500 font-mono flex flex-col justify-center items-center h-full">
            <FileText className="h-8 w-8 text-gray-600 mb-2" />
            <p className="text-xs">No suitable documents found</p>
            <p className="text-[10px] text-gray-600 mt-1 max-w-[200px]">
              Only Google Docs (application/vnd.google-apps.document) or .txt files can be ingested.
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            const isTargetLoading = loadingFileId === file.id;

            return (
              <div
                key={file.id}
                onClick={() => !isTargetLoading && handleFileToggle(file)}
                className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                  isSelected
                    ? "bg-blue-950/20 border-blue-500/80 text-blue-100"
                    : "bg-gray-900/40 border-gray-800/80 hover:bg-gray-800/40 text-gray-400 group-hover:text-gray-200"
                }`}
                id={`file-item-${file.id}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-gray-950/80 text-gray-500 group-hover:text-gray-400"
                    }`}
                  >
                    {isTargetLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-semibold truncate ${isSelected ? "text-blue-200" : "text-gray-300"}`}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-mono">
                      <span>{file.mimeType.split(".").pop()?.toUpperCase() || "DOC"}</span>
                      <span>•</span>
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.modifiedTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isSelected ? (
                    <div className="bg-blue-500/10 text-blue-400 border border-blue-500/30 p-1 rounded">
                      <Check className="h-3 w-3" />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700 p-1 rounded text-[10px] font-mono font-medium">
                      ADD
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-[10px] font-mono text-gray-500">
        <span>Pool Evidence Count: {selectedIds.length} file(s)</span>
        <span>Mime restriction: active</span>
      </div>
    </div>
  );
}
