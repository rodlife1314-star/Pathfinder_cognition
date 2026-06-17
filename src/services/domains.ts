export interface DomainDefinition {
  id: string;
  name: string;
  lenses: string[];
  authorities: { name: string; desc: string }[];
  sources: string[];
  status: "live" | "standby";
}

export const DOMAIN_REGISTRY: Record<string, DomainDefinition> = {
  finance: {
    id: "finance",
    name: "Finance",
    status: "live",
    lenses: ["Dollar/DXY", "Real Yields", "Inst. Flows", "Futures", "On-Chain", "Risk/VIX", "Commodity", "Geopolitics", "Technical", "Liquidity"],
    authorities: [
      { name: "CME Group", desc: "Primary derivatives, futures, and exascale market open interest clearinghouse." },
      { name: "SEC", desc: "US Securities and Exchange Commission; primary securities regulator." },
      { name: "FCA", desc: "UK Financial Conduct Authority; conduct regulator for financial services." },
      { name: "Coinbase API", desc: "Industry-standard spot cryptocurrency trading clearinghouse and live feed." }
    ],
    sources: ["Coinbase WebSocket / REST", "Yahoo Finance GC=F, SI=F, ^NDX, ^DJI", "CME DataMine Open Interest models"]
  },
  medicine: {
    id: "medicine",
    name: "Medicine",
    status: "standby",
    lenses: ["Pathophysiology", "Pharmacology", "Lab Markers", "Imaging", "Risk Factors", "Evidence Base", "Guidelines", "Contraindications", "Prognosis", "Intervention"],
    authorities: [
      { name: "NHS", desc: "UK primary - patient-facing conditions, clinical terminology, and patient flows." },
      { name: "NICE", desc: "National Institute for Health and Care Excellence; UK primary evidence-based guidelines." },
      { name: "FDA", desc: "US Food and Drug Administration; primary authority for drugs, biologics, and devices." },
      { name: "WHO", desc: "World Health Organization; international standard ICD codes & health classifications." },
      { name: "SNOMED CT", desc: "International standard for codeable medical terms and clinical records ontology." }
    ],
    sources: ["ClinicalTrials.gov API v2 (daily)", "Cochrane Library Systematic Reviews database"]
  },
  law: {
    id: "law",
    name: "Law",
    status: "standby",
    lenses: ["Precedent", "Statute", "Jurisdiction", "Burden of Proof", "Evidence Weight", "Timeline", "Damages", "Appeal Paths", "Regulatory", "Compliance"],
    authorities: [
      { name: "HMCTS", desc: "Her Majesty's Courts and Tribunals Service; UK base registry for judiciary, courts, tribunals." },
      { name: "Law Society", desc: "UK regulatory body representing solicitors in England & Wales." },
      { name: "Cornell LII / Black's Law", desc: "Industry-standard references for US federal/state statutory law and authoritative legal definitions." }
    ],
    sources: ["BAILII (British and Irish Case Law Database; daily HTML scrapers)"]
  },
  technology: {
    id: "technology",
    name: "IT & Applied Sciences",
    status: "standby",
    lenses: ["Complexity", "Security", "Performance", "Scalability", "Tech Debt", "Dependencies", "Coverage", "Observability", "Architecture", "Data Flow"],
    authorities: [
      { name: "IETF", desc: "Internet Engineering Task Force; defines core internet protocols and RFC specifications." },
      { name: "W3C", desc: "World Wide Web Consortium; standardizes HTML, CSS, accessibility, and semantic web layers." },
      { name: "NIST", desc: "US National Institute of Standards and Technology; physical measurement and encryption root." },
      { name: "ACM / IEEE", desc: "International computing standards societies and electrical, electronics engineering standards." }
    ],
    sources: ["IETF RFC Index REST archive", "NIST National Vulnerability Database (NVD)", "W3C Standards Catalog"]
  },
  astrophysics: {
    id: "astrophysics",
    name: "Astrophysics",
    status: "standby",
    lenses: ["Photometric", "Spectral", "Orbital", "Temporal", "Energetic", "Spatial", "Cosmological", "Instrument Cal.", "Catalog", "Prediction"],
    authorities: [
      { name: "NASA / ESA", desc: "Primary joint space observation authorities; Hubble, JWST, stellar telemetry data streams." },
      { name: "IAU", desc: "International Astronomical Union; official naming, classification, and coordinate authorities." },
      { name: "NASA ADS", desc: "Harvard-hosted Astrophysics Data System; primary metadata registry of published astrophysics papers." }
    ],
    sources: ["Space-Track TLEs (real-time)", "MAST Hubble-JWST catalog", "Simbad astronomical database TAP", "VizieR tables TAP"]
  },
  food: {
    id: "food",
    name: "Food & Culinary",
    status: "standby",
    lenses: ["Sensory Palette", "Gastronomic Chemistry", "Nutritional Composition", "Sourcing Integrity", "Prep Thermodynamics", "Culinary Heritage", "Safety Protocol", "Flavor Synthesis", "Presentation Aesthetics", "Preservation Science"],
    authorities: [
      { name: "Escoffier Foundation", desc: "Underpinning classic culinary techniques, codifying global classical mother sauces and prep workflows." },
      { name: "FDA Food Safety", desc: "Regulatory oversight of safe critical thermal points and preservation thresholds." },
      { name: " Michelin Guide", desc: "In-field criteria for technical mastery, ingredient purity, and baseline quality evaluation." }
    ],
    sources: ["USDA FoodData Central API", "Culina Historical Archive"]
  },
  earth: {
    id: "earth",
    name: "Earth & Climate Plan",
    status: "standby",
    lenses: ["Cryosphere Drift", "Atmospheric Carbon", "Thermohaline Circulation", "Biodiversity/Soil Index", "Solar Irradiance", "Anthropogenic Forcing", "Paleoclimate Proxy", "Precipitation Anomaly", "Lithospheric Stress", "Feedback Loops"],
    authorities: [
      { name: "IPCC (UN Panel)", desc: "Intergovernmental Panel on Climate Change; synthesizes global consensus model feedback." },
      { name: "NOAA", desc: "US National Oceanic and Atmospheric Administration; collects greenhouse gas and weather metrics." },
      { name: "Copernicus Service", desc: "EU earth observation platform tracking ocean heat levels, sea levels and land cover." }
    ],
    sources: ["NOAA Carbon Cycle Greenhouse Gas (CCGG) real-time feed", "Copernicus ERA5 reanalysis pipeline", "Met Office Hadley Centre database"]
  }
};

export function classifyInquiryDomain(inquiry: string): DomainDefinition {
  const normalized = inquiry.toLowerCase();

  // Keyword sets
  const financeKeywords = ["btc", "bitcoin", "coinbase", "gold", "silver", "dow", "nasdaq", "contango", "backwardation", "open interest", "cme", "sec", "fca", "market", "derivatives", "futures", "basis", "ticker", "instrument", "asset", "dxy", "yield", "vix", "liquidity", "finance"];
  const medicineKeywords = ["knee", "swelling", "pain", "medical", "drug", "fda", "nhs", "clinical", "disease", "treatment", "pathology", "patient", "blood", "doctor", "health", "anatomy", "nice", "gmc", "mhra", "pharmacology", "physiotherapy", "injury"];
  const lawKeywords = ["court", "law", "statute", "precedent", "legal", "solicitor", "hmcts", "regulation", "liability", "damages", "jurisdiction", "contract", "appeals", "evidence code", "counsel", "barristers", "tribunal"];
  const techKeywords = ["complexity", "performance", "scalability", "tech debt", "dependency", "security", "data flow", "ietf", "w3c", "rfc", "cpu", "server", "database", "api", "node", "runtime", "cloud run", "replit", "iframe", "development", "it ", "programming", "software"];
  const astroKeywords = ["orbit", "astrophysics", "stellar", "galaxy", "telescope", "photometric", "nasa", "esa", "jwst", "hubble", "space", "astronomy", "star", "telescopic", "comet", "nebula", "constellation"];
  const foodKeywords = ["food", "cook", "recipe", "culinary", "chef", "gastronomic", "nutrition", "flavor", "escoffier", "taste", "michelin", "restaurant", "sauce", "baking"];
  const earthKeywords = ["climate", "earth", "warming", "carbon", "ipcc", "meteorological", "weather", "atmosphere", "sea level", "biodiversity", "glacier", "greenhouse", "copernicus", "temperature", "temp", "drought", "oceans"];

  // Helper score counter
  const getScore = (keywords: string[]) => {
    return keywords.reduce((score, kw) => {
      if (normalized.includes(kw)) {
        return score + (normalized.match(new RegExp(kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g")) || []).length;
      }
      return score;
    }, 0);
  };

  const scores = {
    finance: getScore(financeKeywords),
    medicine: getScore(medicineKeywords),
    law: getScore(lawKeywords),
    technology: getScore(techKeywords),
    astrophysics: getScore(astroKeywords),
    food: getScore(foodKeywords),
    earth: getScore(earthKeywords)
  };

  // Find max score
  let maxScore = 0;
  let classified: keyof typeof scores = "finance"; // default to finance

  Object.entries(scores).forEach(([key, val]) => {
    if (val > maxScore) {
      maxScore = val;
      classified = key as keyof typeof scores;
    }
  });

  // If match score is 0, try default heuristics (like matches any of the fallback domains)
  if (maxScore === 0) {
    // If user query lists standard astro terms or finance terms fallback
    if (normalized.includes("doctor") || normalized.includes("clinical")) return DOMAIN_REGISTRY.medicine;
    if (normalized.includes("legal") || normalized.includes("contract")) return DOMAIN_REGISTRY.law;
    if (normalized.includes("space") || normalized.includes("planet")) return DOMAIN_REGISTRY.astrophysics;
    if (normalized.includes("code") || normalized.includes("network")) return DOMAIN_REGISTRY.technology;
    if (normalized.includes("climate") || normalized.includes("ocean")) return DOMAIN_REGISTRY.earth;
    if (normalized.includes("culinary") || normalized.includes("kitchen")) return DOMAIN_REGISTRY.food;
  }

  return DOMAIN_REGISTRY[classified];
}

export function computeCoverageMetric(domainId: string, inquiry: string): number {
  const norm = inquiry.toLowerCase();
  const def = DOMAIN_REGISTRY[domainId];
  if (!def) return 0;

  // Real, deterministic coverage rating based on how many keywords/references are mentioned
  let matchCount = 0;
  def.lenses.forEach(len => {
    const mainWord = len.split("/")[0].toLowerCase();
    if (norm.includes(mainWord)) matchCount += 1.5;
  });
  
  def.authorities.forEach(auth => {
    if (norm.includes(auth.name.toLowerCase())) matchCount += 2;
  });

  // Calculate percentage: base percentage depends on the domain status, then added match counts
  const basePercent = def.status === "live" ? 82 : 65;
  const coveragePercent = Math.min(100, basePercent + (matchCount * 4));
  return Math.round(coveragePercent);
}
