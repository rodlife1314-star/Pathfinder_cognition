export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

export interface FactualFinding {
  statement: string;
  status: "evidenced" | "assumed";
  source?: string;
  quote?: string;
}

export interface Pathway {
  id: string;
  name: string;
  type: "conservative" | "standard" | "aggressive";
  description: string;
  pros: string[];
  cons: string[];
  governingRule: string;
  traceableFindings: FactualFinding[];
}

export interface TensionMap {
  tensionTitle: string;
  tensionSummary: string;
  coreConflictingForces: string[];
}

export interface EvidenceEvaluation {
  summary: string;
  gapsIdentified: string[];
}

export interface OctagonAudit {
  complianceLevel: string;
  guidelinesChecked: string[];
  operatorSovereigntyNotes: string;
}

export interface AnalysisResponse {
  aether: TensionMap;
  evidenceAnalysis: EvidenceEvaluation;
  pathways: Pathway[];
  octagonAudit: OctagonAudit;
}

export interface ContactInfo {
  name: string;
  email?: string;
  role: string;
  avatarUrl?: string;
}
