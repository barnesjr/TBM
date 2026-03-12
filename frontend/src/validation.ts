import type { AssessmentData } from './types';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  disciplineId?: string;
  areaId?: string;
  itemId?: string;
}

export function validateAssessment(data: AssessmentData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const disc of data.disciplines) {
    if (!disc.enabled) continue;
    for (const ca of disc.capability_areas) {
      for (const item of ca.items) {
        if (item.score === null && !item.na) {
          issues.push({
            severity: 'info',
            rule: 'unscored',
            message: `"${item.text.slice(0, 60)}..." is not scored`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
        if (item.na && !item.na_justification) {
          issues.push({
            severity: 'error',
            rule: 'na-no-justification',
            message: `"${item.text.slice(0, 60)}..." marked N/A without justification`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
        if (item.score !== null && !item.notes) {
          issues.push({
            severity: 'warning',
            rule: 'scored-no-notes',
            message: `"${item.text.slice(0, 60)}..." scored but has no notes`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
        if (item.confidence === 'Low' && !item.notes) {
          issues.push({
            severity: 'warning',
            rule: 'low-confidence-no-notes',
            message: `"${item.text.slice(0, 60)}..." has low confidence with no notes`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
      }
    }
  }

  return issues;
}
