import React, { useState, useEffect } from "react";
import { initAuth, googleSignIn, logout, getAccessToken } from "./auth";
import { User } from "firebase/auth";
import DriveBrowser from "./components/DriveBrowser";
import ApertureDeck from "./components/ApertureDeck";
import OfficersHub from "./components/OfficersHub";
import { 
  Shield, 
  Terminal, 
  Power, 
  Compass, 
  UserCheck, 
  Activity, 
  Sparkles,
  Loader2,
  Lock
} from "lucide-react";

export default function App() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Real user profile data loaded from Google API using the access token
  const [googleProfile, setGoogleProfile] = useState<{
    name?: string;
    email?: string;
    photoUrl?: string;
  }>({});

  const [evidenceDocs, setEvidenceDocs] = useState<{ id: string; name: string; content: string }[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch real Google User Info
  const fetchGoogleProfile = async (accessToken: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGoogleProfile({
          name: data.name,
          email: data.email,
          photoUrl: data.picture
        });
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        fetchGoogleProfile(accessToken);
      },
      () => {
        setNeedsAuth(true);
        setToken(null);
        setUser(null);
        setGoogleProfile({});
      }
    );
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        await fetchGoogleProfile(result.accessToken);
      }
    } catch (err) {
      console.error("Login verification aborted:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUser(null);
    setNeedsAuth(true);
    setGoogleProfile({});
    setEvidenceDocs([]);
  };

  // Render High-Tech Authorized Security Screen
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none" id="unauthorized-landing-deck">
        {/* Creative Tech Grid Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        
        {/* Ambient color auroras */}
        <div className="absolute -top-[40%] left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-950/20 blur-[130px] opacity-40"></div>
        <div className="absolute -bottom-[40%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[130px] opacity-40"></div>

        <div className="w-full max-w-md bg-[#0e1422]/90 backdrop-blur-md rounded-2xl border border-gray-800/80 p-8 flex flex-col items-center text-center relative z-10 shadow-2xl shadow-black/80">
          
          {/* Deck Aperture Seal */}
          <div className="h-16 w-16 bg-emerald-950/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
            <Compass className="h-8 w-8" />
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-xl font-display font-extrabold tracking-wider text-gray-100 uppercase">
              Delta
            </h1>
            <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest max-w-[280px] mx-auto leading-normal">
              Cognitive Acquisition Instrument
            </p>
            <div className="h-[1px] w-20 bg-emerald-800/40 mx-auto mt-4"></div>
          </div>

          <p className="text-xs text-gray-400 font-sans leading-relaxed mb-8 max-w-[325px]">
            Delta focuses on the gap between information and understanding. It records observations, verifies evidence, surfaces contradictions, and tracks the transformation of external data into internalized operator knowledge.
          </p>

          <div className="w-full space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#1e293b] hover:bg-[#334155] border border-gray-700/80 active:scale-[0.98] text-white text-xs font-display font-bold py-3.5 px-5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 shadow-lg shadow-black/40"
              id="google-signin-action"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  Authenticating Signature...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.04 12.261c0-.83-.074-1.63-.213-2.396H12v4.532h6.188c-.267 1.411-1.063 2.607-2.257 3.405l-.023.15 3.637 2.817.252.025c2.316-2.132 3.645-5.269 3.645-8.991z" fill="#4285F4" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 23c2.97 0 5.462-.98 7.283-2.66l-3.866-2.992c-1.07.717-2.44 1.144-3.417 1.144-2.628 0-4.852-1.776-5.644-4.162l-.145.012-3.784 2.924-.05.138C4.18 20.218 7.828 23 12 23z" fill="#34A853" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.356 14.33a5.9 5.9 0 01-.309-1.897v-1.897c0-.66.115-1.3.309-1.897L2.46 5.672l-.126.06A11.967 11.967 0 000 12c0 2.227.609 4.312 1.668 6.102l4.688-3.772z" fill="#FBBC05" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 4.75c1.495 0 2.835.514 3.89 1.521l2.91-2.91C17.034 1.761 14.717 1 12 1 7.828 1 4.18 3.782 2.334 6.898l3.966 3.102c.792-2.386 3.016-4.162 5.644-4.162z" fill="#EA4335" />
                  </svg>
                  Authorize Sovereign Control Deck
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-800/60 w-full flex items-center justify-center gap-2 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
            <Lock className="h-3 w-3 text-gray-600" />
            <span>Secure TLS Encryption Active</span>
          </div>
        </div>
      </div>
    );
  }

  // Active Control Deck
  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-emerald-900/30" id="authorized-control-deck">
      {/* Deck Header Unit */}
      <header className="bg-[#0b0f19] border-b border-gray-800/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-50 shadow-md shadow-black/20">
        
        {/* Logo Unit */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-emerald-900/30 border border-emerald-800/50 rounded-lg flex items-center justify-center text-emerald-400 font-mono text-sm shadow-md">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-emerald-400 block tracking-widest font-bold">DELTA SYSTEM</span>
            <h1 className="text-base font-display font-black tracking-wide leading-none text-gray-100 mt-1">
              SOVEREIGN OBSERVER APERTURE
            </h1>
          </div>
        </div>

        {/* User Info & Lockouts */}
        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800/60">
          <div className="flex items-center gap-2.5">
            {googleProfile.photoUrl ? (
              <img
                src={googleProfile.photoUrl}
                alt="Operator"
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-emerald-500/30 shrink-0"
                id="header-operator-avatar"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-emerald-900/30 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 border border-emerald-800/50">
                OP
              </div>
            )}
            <div className="text-left">
              <span className="text-[10px] font-mono text-emerald-400 block tracking-widest leading-none font-bold uppercase">
                Operator Bound
              </span>
              <span className="text-xs font-semibold text-gray-300 block mt-0.5 leading-none">
                {googleProfile.name || "ACTIVE OPERATOR"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 hover:bg-red-950/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-900/30 text-xs font-display font-bold flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer"
            title="Terminate operator credentials"
            id="btn-terminate-deck"
          >
            <Power className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Grid Floor */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Side: Directory and Files Loaders (col-span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-6 h-full min-h-[500px] lg:max-h-[calc(100vh-140px)]">
          <div className="flex-1 min-h-0">
            <DriveBrowser
              accessToken={token!}
              selectedIds={evidenceDocs.map(item => item.id)}
              onEvidenceUpdated={(evidence) => setEvidenceDocs(evidence)}
            />
          </div>
          <div className="flex-1 min-h-0">
            <OfficersHub
              accessToken={token!}
              currentUser={{
                name: googleProfile.name,
                email: googleProfile.email,
                photoUrl: googleProfile.photoUrl
              }}
            />
          </div>
        </section>

        {/* Right Side: Primary Navigation Deck (col-span-8) */}
        <section className="lg:col-span-8 h-full min-h-[500px]">
          <ApertureDeck
            evidenceDocs={evidenceDocs}
            operatorName={googleProfile.name || "OPERATOR-1"}
            accessToken={token!}
            userId={user?.uid || ""}
            onEvidenceDocsChange={(ev) => setEvidenceDocs(ev)}
          />
        </section>
      </main>

      {/* Footer System Status Banner */}
      <footer className="bg-[#0b0f19] border-t border-gray-800/80 px-6 py-3 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-500 gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <span>Delta System Terminal: SECURE TLS</span>
          <span className="hidden md:inline text-gray-700">|</span>
          <span>Aether tension matrix: ALIGNED</span>
          <span className="hidden md:inline text-gray-700">|</span>
          <span>Hermes Evidence Pipeline: ACTIVE</span>
        </div>
        <div>
          <span>DELTA COGNITIVE GEOMETRY FRAMEWORK v1.3.0 • SECURE INTEGRITY LAYER</span>
        </div>
      </footer>
    </div>
  );
}
