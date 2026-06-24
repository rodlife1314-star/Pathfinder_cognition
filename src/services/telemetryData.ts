export interface TelemetryDocument {
  id: string;
  name: string;
  content: string;
}

export const DOMAIN_TELEMETRY_DOCS: Record<string, TelemetryDocument[]> = {
  finance: [
    {
      id: "coinbase-xau-spot-1",
      name: "Coinbase Exchange Live Telemetry: XAU/USD Spot",
      content: `[COINBASE GLOBAL LIQUIDITY SPOTLIGHT - REAL-TIME TELEMETRY FEED]
Timestamp: 2026-06-18T10:15:00Z
Instrument: Gold Spot Bullion (XAU) in USD per oz
Spot Price: $2342.10
Spread Depth: $0.15
Order Book Liquidity: 4,500 oz within 0.1% of spot.
Transit Signature: sha256:8f4c2c5e5fa771a36423456fb9ce8ef8648358ea8fbbedcfdc58c17da8c9735d
Status: ACTIVE. High-fidelity feed verified.`
    },
    {
      id: "cme-futures-ndx-1",
      name: "CME Group open interest daily telemetry: NDX / DJI",
      content: `[CME GROUP CHICAGO DERIVATIVES OPERATIONS - OPEN INTEREST MODEL]
Report-Ref: CME-OI-2026-06-18
Index Reference Spot:
 - Nasdaq-100 (NDX): 19820.40
 - Dow Jones Industrial (US30): 39120.80
Gold Futures Open Interest Contract: GC-AUG26 (124,500 active lots).
Calls/Puts Volume Ratio: 0.84
Implied Volatility Index (VIX) baseline calibration: 12.8%
Authority Node: CME DataMine Engine Core.`
    }
  ],
  astrophysics: [
    {
      id: "mpc-asteroid-obs-1",
      name: "IAU MPC physical astrometry coordinate database: 2010_LH14",
      content: `[IAU MINOR PLANET CENTER - SPECIALIZED MINOR PLANET OBSERVATION DOSSIER]
Object Designation: 2010 LH14 (Comet-like Active Asteroid)
Observations Registry:
 - epoch: 2460280.5 (WGS-84 coordinate profile)
 - position: RA 14h 23m 15.42s, DEC -12° 45' 32.1"
 - mag: 17.4 R
Optical Telemetry FWHM Profile:
 - PSF width: 1.84 arcsec (Faint diffuse cometary coma detected)
 - Co-aligned star reference PSF: 1.25 arcsec (Confirming non-stellar excess)
Dust Tail Projection: length 12 arcsec; position angle: 285°`
    },
    {
      id: "jpl-orbit-sol-1",
      name: "NASA JPL Small-Body Database Keplerian Orbit Solution",
      content: `[NASA JPL SOLAR SYSTEM DYNAMICS (SSD) - INTERPLANETARY ORBIT DECAY REFERENCE]
Target Identifier: Minor Planet 2010 LH14 (Active Asteroid Class)
Keplerian Elements:
 - Semimajor axis (a): 2.8512 AU
 - Eccentricity (e): 0.3412
 - Inclination (i): 14.56°
Tisserand Parameter relative to Jupiter: T_J = 3.125
Dynamic Domain Check: T_J > 3.0 confirms orbit boundaries sit within classical Main-Belt asteroid asteroid fields, ruling out Kuiper-belt debris contamination.
Telemetry Grounding: DSN Radar verification.`
    }
  ],
  medicine: [
    {
      id: "nice-syndetic-sweling-1",
      name: "NICE Clinical Guidelines: Synovial Inflammatory Pathology",
      content: `[NICE CLINICAL EVIDENCE BASE - MEDICAL PRACTICE GUIDELINE 339]
Topic: Differential diagnosis of clinical synovial swellings & primary joint swelling.
Primary Diagnostic Standard:
 - Assess for localized warmth, mechanical constraints, and patella ballotement.
 - Target Laboratory markers: Elevated C-Reactive Protein (CRP > 10 mg/L) or Erythrocyte Sedimentation Rate.
Indicated Interventions:
 - Initial: First-line NSAID therapeutics combined with localized low-impact physiotherapy.
 - Avoid: Invasive joint aspiration unless septic arthritis is clinically indicated.`
    },
    {
      id: "fda-clinical-trial-1",
      name: "FDA approval trial metadata: Arthritis swelling protocol",
      content: `[FDA CENTER FOR DRUG EVALUATION - METADATA ARCHIVE CLIN-883921]
Trial Code: PROTO-ATHR-42
Intervention: Double-blind, placebo-controlled efficacy trial of localized synovial swelling remediation.
Performance Metrics:
 - Targeted symptom reduction at Day 14: 64.2% (p < 0.001)
 - Adverse event rate reported: 1.2% (gastrointestinal mild discomfort)
 - Contraindications mapped: Severe renal impairment (GFR < 30 mL/min).`
    }
  ],
  law: [
    {
      id: "bailii-contract-precedent-1",
      name: "BAILII Case Law Precedent: Statutory Scope overrides",
      content: `[BAILII PUBLISHED DECISION - HIGH COURT OF JUSTICE VENUE]
Citation Track: [2024] EWHC 812 (Comm)
Judgement Category: Sovereign Contract Performance and Jurisdictional Overlaps.
Precedent Ruling:
 - Section 14 override clause: Statutory performance standards bound to local UK regulators (FCA/HMCTS) override generalist international dispute schedules where specific public policy bounds exist.
 - Legal weight: Binding precedent for high-altitude corporate service level agreements.`
    },
    {
      id: "hmcts-tribunal-docket-1",
      name: "HMCTS active tribunal docket database context",
      content: `[HMCTS ADMINISTRATIVE JUSTICE SYSTEM - SYSTEM LOG DATABASE]
Docket Stamp: TB-99214-2026
Court Jurisdiction: Commercial High Court Division (London).
Parties: Sovereign Industries Ltd vs Quantum Technologies Inc.
Subject: Serverless database synchronization delays under cryptographic lease agreements.
Legal Burden of Proof directive: Burden remains fully on the Claimant to verify structural latency metrics before claiming material damages.`
    }
  ],
  technology: [
    {
      id: "ietf-rfc-9142-1",
      name: "IETF RFC 9142 standards documentation: Stateless Sync Contexts",
      content: `[IETF STANDARDS OFFICE - STATUTORY INTERNET PROTOCOL SPECIFICATION]
RFC Number: 9142
Category: Proposed Standard - Stateless Synchronization Context Routing over TLS.
Architectural Limits:
 - Synchronization payload frame size maximum: 64 KB.
 - Acceptable network-transit latency boundary: 150ms.
 - Keep-alive heartbeat interval: 30 seconds.
Compliance: Frame tracking must utilize deterministic monotonically increasing packet sequence numbers.`
    },
    {
      id: "nist-cve-vuln-db-1",
      name: "NIST NVDB Security Index: Remote Memory Leak CVE-2026-1149",
      content: `[NIST NATIONAL VULNERABILITY DATABASE - CVE REFERENCE RECORD]
Identification: CVE-2026-1149
CVSS Base Score v3.1: 8.8 (HIGH SEVERITY)
Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L
Summary: Remote execution and stack heap leak within multi-tab client iframe postMessage listener scope.
Remediation directive: Verify origin strictly before event dispatch; discard all raw wildcards ('*').`
    }
  ],
  food: [
    {
      id: "usda-star-chemistry-1",
      name: "USDA FoodData Central Organic Molecular Compound Analysis",
      content: `[USDA AGRICULTURAL RESEARCH SERVICE - CENTRAL SPECTROMETRY LOG]
Food Class: Organic complex wheat-protein starches and polysaccharides.
Chemical profile per 100g:
 - Crude Protein: 12.4g
 - Moisture density: 14.1%
 - Dynamic dietary fiber fraction: 2.7g
 - Total lipids: 1.1g
Calibration Method: Atmospheric pressure chemical ionization mass spectrometry.`
    },
    {
      id: "escoffier-veloute-emuls-1",
      name: "Classic Escoffier Foundation Mother Sauce standard",
      content: `[ESCOFFIER FOUNDATION WORLDWIDE - CULINARY CODE MANUAL]
Technique Code: ESC-ROUX-VEL
Workflow Directive: Preparation of classic Velvet Velouté starch emulsification.
Core Parameters:
 - Precise thermostatic control at 75°C to 80°C during stock incorporation.
 - Direct butter-fat to refined flour ratio: Exactly 1.00 : 1.00 by weight.
 - Danger point: Heating above 92°C triggers irreversible retrogradation and starch syneresis.`
    }
  ],
  earth: [
    {
      id: "noaa-mauna-loa-co2-1",
      name: "NOAA Mauna Loa Observatory Carbon Dioxide telemetry",
      content: `[NOAA GLOBAL MONITORING LABORATORY - PACIFIC BASIN CO2 TELEMETRY RECORD]
Observatory Station: Mauna Loa, Hawaii (Altitude: 3397m)
Dry Air CO2 Concentration: 422.30 ppm
Reference Baseline comparison: +2.85 ppm annual growth.
Sensor Model: Non-Dispersive Infrared (NDIR) analyzer.
Quality index: 99.8% (Methane and absolute water vapour interference filtered).`
    },
    {
      id: "copernicus-ERA5-ocean-1",
      name: "Copernicus ERA5 Marine Component: Global anomaly tracker",
      content: `[COPERNICUS PLANETARY MONITORING SERVICE - REANALYSIS DATASET v5]
Anomalous Index Reference: Global sea surface temperature (SST) field.
Reported Metric: +0.86°C anomalous deviation relative to 1981-2010 decadal average.
Glacial and sea ice drift velocity: Increased by 14% along Arctic outlets.
Uncertainty parameter: Standard deviation model bounds at 0.08°C.`
    }
  ]
};

export function getTelemetryDocs(domainId: string): TelemetryDocument[] {
  return DOMAIN_TELEMETRY_DOCS[domainId] || DOMAIN_TELEMETRY_DOCS.finance;
}

export interface RapidsCandidateFeed {
  id: string;
  sourceName: string;
  type: string;
  reliability: string;
  status?: "APPROVED" | "BLOCKED" | "FILTERED" | "NOT_REGISTERED";
  reason?: string;
  isUnregistered?: boolean;
  shortName?: string;
  url?: string;
  tier?: string;
  aetherReason?: string;
}

export const RAW_CANDIDATE_FEEDS: Record<string, RapidsCandidateFeed[]> = {
  finance: [
    { id: "fin-1", sourceName: "Coinbase WebSocket / REST", type: "Exchange API", reliability: "99.9%" },
    { id: "fin-2", sourceName: "CME DataMine Open Interest models", type: "Derivatives Feed", reliability: "99.6%" },
    { id: "fin-3", sourceName: "Reddit WallStreetBets posts", type: "Social Sentiment", reliability: "12.4%" },
    { id: "fin-4", sourceName: "Unverified social media finance handles", type: "Influencer Channel", reliability: "5.0%" },
    { id: "fin-5", sourceName: "NASA JPL Solar System orbital elements", type: "External Ephemeris", reliability: "99.9%" },
    { id: "fin-unreg", sourceName: "Federal Reserve Economic Data (FRED) API", type: "Macroeconomic Feed", reliability: "99.8%", isUnregistered: true, shortName: "FRED", url: "https://fred.stlouisfed.org", tier: "Tier-1 Sovereign", aetherReason: "Requires direct correlation of macroeconomic rate shifts to explain spot contango trends." }
  ],
  astrophysics: [
    { id: "astro-1", sourceName: "Minor Planet Center (MPC) observation database", type: "Astrometric Catalogue", reliability: "99.8%" },
    { id: "astro-2", sourceName: "NASA JPL Small-Body Database (SBDB)", type: "Orbital Dynamics Model", reliability: "99.9%" },
    { id: "astro-3", sourceName: "Simbad astronomical database generic catalog TAP tables (non-specialized)", type: "General Catalog", reliability: "85.0%" },
    { id: "astro-4", sourceName: "Amateur astronomy visual reports", type: "Observer Reports", reliability: "45.0%" },
    { id: "astro-5", sourceName: "Coinbase cryptocurrency spot markets", type: "External Feed", reliability: "99.9%" },
    { id: "astro-unreg", sourceName: "ESA Gaia Space Telescope Star Registry", type: "Star Catalog", reliability: "99.9%", isUnregistered: true, shortName: "Gaia DR3", url: "https://sci.esa.int/web/gaia", tier: "Tier-1 Scientific", aetherReason: "Requires absolute coordinate calibrations from astrometric star references." }
  ],
  medicine: [
    { id: "med-1", sourceName: "ClinicalTrials.gov API v2 (daily)", type: "Clinical Registry", reliability: "99.5%" },
    { id: "med-2", sourceName: "WHO International ICD and health classifications", type: "Regulatory Codebook", reliability: "99.9%" },
    { id: "med-3", sourceName: "SNOMED CT International terminology ontologies", type: "Technical Vocabulary", reliability: "99.8%" },
    { id: "med-4", sourceName: "WebMD public comment forums", type: "Consumer Anecdotes", reliability: "15.0%" },
    { id: "med-5", sourceName: "Wikipedia consumer-grade health wiki pages", type: "Open Collaboration Wiki", reliability: "60.0%" },
    { id: "med-unreg", sourceName: "PubMed Central (PMC) Repository", type: "Academic Feed", reliability: "99.7%", isUnregistered: true, shortName: "PMC", url: "https://www.ncbi.nlm.nih.gov/pmc", tier: "Tier-1 Academic", aetherReason: "Requires peering of un-synthesized efficacy signals against raw patient study trials." }
  ],
  law: [
    { id: "law-1", sourceName: "BAILII (British and Irish Case Law Database)", type: "Statutory Registry", reliability: "99.7%" },
    { id: "law-2", sourceName: "Cornell LII / Black's Law", type: "Legal Reference Dictionary", reliability: "99.5%" },
    { id: "law-3", sourceName: "Reddit comments & social media opinions", type: "Public Forums", reliability: "8.0%" },
    { id: "law-4", sourceName: "Personal legal blogs or opinion articles", type: "Opinion Blogs", reliability: "35.5%" },
    { id: "law-5", sourceName: "NASA JPL Solar System orbital elements", type: "External Observatory", reliability: "99.9%" },
    { id: "law-unreg", sourceName: "EUR-Lex European Union Law Archive", type: "Treaty Database", reliability: "99.6%", isUnregistered: true, shortName: "EUR-Lex", url: "https://eur-lex.europa.eu", tier: "Tier-2 Sovereign", aetherReason: "Requires jurisdictional crossover validations under treaty precedent overrides." }
  ],
  technology: [
    { id: "tech-1", sourceName: "IETF RFC Index REST archive", type: "Standards Document", reliability: "99.9%" },
    { id: "tech-2", sourceName: "NIST National Vulnerability Database (NVD)", type: "Security Database", reliability: "99.8%" },
    { id: "tech-3", sourceName: "W3C Standards Catalog", type: "Accessibility Registry", reliability: "99.7%" },
    { id: "tech-4", sourceName: "StackOverflow unsourced community snippets", type: "Community Q&A", reliability: "50.0%" },
    { id: "tech-5", sourceName: "Personal medium/dev.to development blogs", type: "Sovereign Blogs", reliability: "40.0%" },
    { id: "tech-unreg", sourceName: "Warp Speed JS CDN Metrics", type: "CDN Telemetry", reliability: "94.5%", isUnregistered: true, shortName: "WarpCDN", url: "https://warpcdn.dev", tier: "Tier-3 Technical", aetherReason: "Requires low-level verification of network-transit telemetry and browser buffer streams." }
  ],
  food: [
    { id: "food-1", sourceName: "USDA FoodData Central API", type: "Nutritional Analytics", reliability: "99.8%" },
    { id: "food-2", sourceName: "FDA Food Safety thermal guidelines", type: "Regulatory Safety Code", reliability: "99.9%" },
    { id: "food-3", sourceName: "Unvetted online cooking blogs", type: "Recipe Sharing Domain", reliability: "30.0%" },
    { id: "food-4", sourceName: "Social media culinary influencers", type: "Dynamic Sentiment", reliability: "15.0%" },
    { id: "food-5", sourceName: "CME open interest derivative sheets", type: "Finance Indices", reliability: "99.5%" },
    { id: "food-unreg", sourceName: "Spoonacular Recipe API database", type: "Culinary database", reliability: "82.0%", isUnregistered: true, shortName: "Spoonacular", url: "https://spoonacular.com/food-api", tier: "Tier-3 Secondary", aetherReason: "Requires broad integration of ingredient flavor variables under historic recipes." }
  ],
  earth: [
    { id: "earth-1", sourceName: "NOAA Carbon Cycle Greenhouse Gas (CCGG) real-time feed", type: "Emissions Telemetry", reliability: "99.9%" },
    { id: "earth-2", sourceName: "Copernicus ERA5 reanalysis pipeline", type: "Climatic Model Grid", reliability: "99.7%" },
    { id: "earth-3", sourceName: "Non-peer-reviewed climate forums", type: "Public Opinion Boards", reliability: "20.0%" },
    { id: "earth-4", sourceName: "Corporate environmental policy blogs", type: "Corporate Documents", reliability: "45.0%" },
    { id: "earth-5", sourceName: "Coinbase websocket exchanges", type: "External Ledger", reliability: "99.9%" },
    { id: "earth-unreg", sourceName: "World Glacier Monitoring Service (WGMS) database", type: "Cryosphere Telemetry", reliability: "99.8%", isUnregistered: true, shortName: "WGMS", url: "https://wgms.ch", tier: "Tier-1 Sovereign", aetherReason: "Requires direct correlation of cryospheric ice-volume indicators to balance climate feedback signals." }
  ]
};

export function filterRapidsCandidates(
  domainId: string,
  blockedAuthorities: string[],
  allowedAuthorities: string[]
): RapidsCandidateFeed[] {
  const feeds = RAW_CANDIDATE_FEEDS[domainId] || RAW_CANDIDATE_FEEDS.finance;
  
  return feeds.map(feed => {
    if (feed.isUnregistered) {
      return {
        ...feed,
        status: "NOT_REGISTERED",
        reason: feed.aetherReason || "AETHER mapped need for source in search pipeline"
      };
    }

    // Check if feed name matches any blocked authority string
    const isBlocked = blockedAuthorities.some(blocked => {
      const bNorm = blocked.toLowerCase();
      const fNorm = feed.sourceName.toLowerCase();
      return fNorm.includes(bNorm) || bNorm.includes(fNorm);
    });

    if (isBlocked) {
      return {
        ...feed,
        status: "BLOCKED",
        reason: "Explicitly forbidden in AETHER blueprint requirements"
      };
    }

    // Check if feed name matches allowed authorities or is outside our approved path
    const isAllowed = allowedAuthorities.some(allowed => {
      const aNorm = allowed.toLowerCase();
      const fNorm = feed.sourceName.toLowerCase();
      return fNorm.includes(aNorm) || aNorm.includes(fNorm);
    }) || feed.sourceName.toLowerCase().includes("usda") || feed.sourceName.toLowerCase().includes("noaa") || feed.sourceName.toLowerCase().includes("copernicus") || feed.sourceName.toLowerCase().includes("bailii") || feed.sourceName.toLowerCase().includes("ietf") || feed.sourceName.toLowerCase().includes("nist") || feed.sourceName.toLowerCase().includes("clinicaltrials");

    if (!isAllowed) {
      return {
        ...feed,
        status: "FILTERED",
        reason: "Outside current domain authority chain boundaries"
      };
    }

    return {
      ...feed,
      status: "APPROVED",
      reason: "Verified within approved authority chain limits"
    };
  });
}

