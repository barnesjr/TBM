// === Assessment Data Interfaces ===

export interface EvidenceReference {
  document: string;
  section: string;
  date: string;
}

export interface AssessmentItem {
  id: string;
  text: string;
  score: number | null;
  na: boolean;
  na_justification: string | null;
  confidence: 'High' | 'Medium' | 'Low' | null;
  notes: string;
  evidence_references: EvidenceReference[];
  attachments: string[];
}

export interface CapabilityArea {
  id: string;
  name: string;
  items: AssessmentItem[];
}

export interface Discipline {
  id: string;
  name: string;
  weight: number;
  supplemental: boolean;
  enabled: boolean;
  capability_areas: CapabilityArea[];
}

export interface ScoringConfig {
  weighting_model: string;
  discipline_weights: Record<string, number>;
  custom_weights: Record<string, number> | null;
}

export interface ClientInfo {
  name: string;
  industry: string;
  assessment_date: string;
  assessor: string;
}

export interface AssessmentMetadata {
  framework_version: string;
  tool_version: string;
  last_modified: string;
}

export interface AssessmentData {
  client_info: ClientInfo;
  assessment_metadata: AssessmentMetadata;
  scoring_config: ScoringConfig;
  disciplines: Discipline[];
  target_scores: Record<string, number>;
}

// === Framework (Read-Only) Interfaces ===

export interface FrameworkItem {
  id: string;
  text: string;
  rubric: {
    ad_hoc: string;
    foundational: string;
    managed: string;
    optimized: string;
  };
}

export interface FrameworkCapabilityArea {
  id: string;
  name: string;
  items: FrameworkItem[];
}

export interface FrameworkDiscipline {
  id: string;
  name: string;
  weight: number;
  supplemental: boolean;
  capability_areas: FrameworkCapabilityArea[];
}

export interface Framework {
  version: string;
  framework_alignment: string;
  disciplines: FrameworkDiscipline[];
  weighting_models: Record<string, { label: string; description: string }>;
}

// === Constants ===

export const SCORE_LABELS: Record<number, string> = {
  1: 'Ad Hoc',
  2: 'Foundational',
  3: 'Managed',
  4: 'Optimized',
};

export const SCORE_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#84cc16',
  4: '#22c55e',
};

export const MATURITY_BANDS = [
  { min: 1.0, max: 1.75, label: 'Ad Hoc', color: '#ef4444' },
  { min: 1.75, max: 2.5, label: 'Foundational', color: '#f97316' },
  { min: 2.5, max: 3.25, label: 'Managed', color: '#84cc16' },
  { min: 3.25, max: 4.0, label: 'Optimized', color: '#22c55e' },
];

export function getMaturityBand(score: number) {
  for (const band of MATURITY_BANDS) {
    if (score >= band.min && score < band.max) return band;
  }
  if (score >= 4.0) return MATURITY_BANDS[MATURITY_BANDS.length - 1];
  return MATURITY_BANDS[0];
}

export const WEIGHTING_MODELS: Record<string, { label: string }> = {
  balanced: { label: 'Balanced' },
  custom: { label: 'Custom' },
};

export const DEFAULT_TARGET_SCORE = 3.0;
