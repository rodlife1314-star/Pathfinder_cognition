import React, { useState, useEffect } from "react";
import { ContactInfo } from "../types";
import { Users, Search, Mail, Shield, UserCheck, AlertTriangle, Key } from "lucide-react";

interface OfficersHubProps {
  accessToken: string;
  currentUser: { name?: string; email?: string; photoUrl?: string };
}

export default function OfficersHub({ accessToken, currentUser }: OfficersHubProps) {
  const [googleContacts, setGoogleContacts] = useState<ContactInfo[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"system" | "personal">("system");
  const [searchTerm, setSearchTerm] = useState("");

  // System Officers Directory
  const systemOfficers: ContactInfo[] = [
    {
      name: currentUser.name || "ACTIVE OPERATOR",
      email: currentUser.email || "operator@pathfinder.core",
      role: "CHIEF CONTEXT ARCHITECT & COMSAT OPERATOR",
      avatarUrl: currentUser.photoUrl
    },
    {
      name: "AETHER NAVIGATION NODE",
      email: "aether@pathfinder.core",
      role: "COGNITIVE UNCERTAINTY MAPPER",
    },
    {
      name: "HERMES EVIDENCE HORIZON",
      email: "hermes@pathfinder.core",
      role: "REPLICATED KNOWLEDGE PROVIDENCE PIPELINE",
    },
    {
      name: "SIMON TRAJECTORY NODAL PLOTTER",
      email: "simon@pathfinder.core",
      role: "TACTICAL ALTERNATING PATHS ENGINE",
    },
    {
      name: "JEMMA VERATOR MODULE",
      email: "jemma@pathfinder.core",
      role: "VERACITY AND TRACEABLE CONTRA-MUTATION ASSERTOR",
    },
    {
      name: "OCTAGON GOVERNANCE SYSTEM",
      email: "octagon@pathfinder.core",
      role: "OPERATIVE METRIC PROTOCOL COMPLIANCE GATEWAY",
    }
  ];

  // Try to load real Google Contacts (People API)
  const fetchGoogleContacts = async () => {
    setLoadingContacts(true);
    setContactsError(null);
    try {
      // Fetch user's Google contacts
      const url = "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos&pageSize=30";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("PROHIBITED_SCOPE");
        }
        throw new Error(`Federated contacts returned status ${res.status}`);
      }

      const data = await res.json();
      const loaded: ContactInfo[] = (data.connections || []).map((conn: any) => {
        const name = conn.names?.[0]?.displayName || "Unnamed Connection";
        const email = conn.emailAddresses?.[0]?.value || "";
        const avatarUrl = conn.photos?.[0]?.url || "";
        return {
          name,
          email,
          role: "External Grounded Node Overlay",
          avatarUrl
        };
      });
      setGoogleContacts(loaded);
    } catch (err: any) {
      console.error("Failed to load personal contacts:", err);
      if (err.message === "PROHIBITED_SCOPE") {
        setContactsError(
          "Personal Contacts access is restricted. Scopes list was configured without 'contacts.readonly'. System constellation overlays remain standard."
        );
      } else {
        setContactsError(err.message || "Failed to load external federated connections.");
      }
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (accessToken && activeTab === "personal") {
      fetchGoogleContacts();
    }
  }, [accessToken, activeTab]);

  const activeRoster = activeTab === "system" ? systemOfficers : googleContacts;

  const filteredRoster = activeRoster.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md rounded-xl border border-gray-800 p-6 flex flex-col h-full overflow-hidden" id="officers-directory-module">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/40 rounded-lg text-purple-400 border border-purple-800/50">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold text-gray-100 uppercase tracking-widest">
              Navigation Constellation
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              [COGNITIVE DIMENSIONS & COORDINATE VECTOR NODES]
            </p>
          </div>
        </div>
      </div>

      {/* Directory Tab Selector */}
      <div className="flex bg-gray-950/80 p-1 rounded-lg border border-gray-800/80 mb-4">
        <button
          onClick={() => setActiveTab("system")}
          className={`flex-1 py-1.5 text-xs font-display font-bold rounded-md transition-all ${
            activeTab === "system"
              ? "bg-purple-950/40 text-purple-300 border border-purple-800/40"
              : "text-gray-500 hover:text-gray-300"
          }`}
          id="btn-tab-officers"
        >
          Spectral Nodes
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 py-1.5 text-xs font-display font-bold rounded-md transition-all ${
            activeTab === "personal"
              ? "bg-purple-950/40 text-purple-300 border border-purple-800/40"
              : "text-gray-500 hover:text-gray-300 relative"
          }`}
          id="btn-tab-google-contacts"
        >
          Federated Overlays
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search nodes and overlays..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-950/80 border border-gray-800 focus:border-purple-500 text-xs rounded-lg pl-9 pr-4 py-2 text-gray-200 placeholder-gray-600 focus:outline-none transition-all duration-200 font-sans"
          id="officer-filter-input"
        />
      </div>

      {/* Roster Outputs */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[200px]">
        {activeTab === "personal" && contactsError && (
          <div className="border border-amber-900/40 bg-amber-950/10 rounded-lg p-4 text-center mt-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <h4 className="text-[10px] uppercase font-bold text-amber-400 font-mono mb-1">Roster Access Capped</h4>
            <p className="text-[10px] text-amber-300/90 leading-relaxed font-sans">
              {contactsError}
            </p>
          </div>
        )}

        {loadingContacts ? (
          <div className="flex flex-col items-center justify-center p-12">
            <span className="animate-spin h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full mb-2"></span>
            <p className="text-[10px] text-gray-500 font-mono">Querying people ledger...</p>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500 font-mono">
            Roster matches negative
          </div>
        ) : (
          filteredRoster.map((contact, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-lg border bg-gray-900/25 ${
                contact.role.includes("OPERATOR")
                  ? "border-emerald-500/20 bg-emerald-950/5"
                  : "border-gray-850"
              }`}
            >
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.name}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-gray-800 shrink-0"
                  id={`officer-avatar-${idx}`}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-950 border border-gray-850 flex items-center justify-center text-[10px] font-mono font-bold text-purple-400 shrink-0 uppercase">
                  {contact.name.slice(0, 2)}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <h4 className="text-xs font-semibold text-gray-200 truncate pr-0.5">
                    {contact.name}
                  </h4>
                  {contact.role.includes("OPERATOR") && (
                    <span className="text-[8px] uppercase px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded shrink-0 font-mono font-black">
                      operator
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-gray-500 font-mono tracking-wide mt-0.5 overflow-hidden truncate">
                  {contact.email}
                </p>
                <p className="text-[8px] text-purple-400 font-mono uppercase tracking-widest mt-1">
                  {contact.role}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center text-[9px] font-mono text-gray-500">
        <span>Vector Cardinality: {filteredRoster.length} tracked</span>
        <span>Secure spatial encryption: active</span>
      </div>
    </div>
  );
}
