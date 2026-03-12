import type { AssessmentData, AssessmentItem, CapabilityArea, Discipline } from './types';

export function averageScore(items: AssessmentItem[]): number | null {
  const scored = items.filter((i) => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length;
}

export function capabilityAreaScore(ca: CapabilityArea): number | null {
  return averageScore(ca.items);
}

export function disciplineScore(discipline: Discipline): number | null {
  const allItems = discipline.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function disciplineCompletion(discipline: Discipline): number {
  const allItems = discipline.capability_areas.flatMap((ca) => ca.items);
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function weightedCompositeScore(data: AssessmentData): number | null {
  const weights = data.scoring_config.discipline_weights;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const disc of data.disciplines) {
    if (!disc.enabled) continue;
    const score = disciplineScore(disc);
    const weight = weights[disc.id] ?? 0;
    if (score !== null) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

export function overallCompletion(data: AssessmentData): { scored: number; total: number } {
  const enabledItems = data.disciplines
    .filter((d) => d.enabled)
    .flatMap((d) => d.capability_areas.flatMap((ca) => ca.items));
  const scored = enabledItems.filter((i) => i.score !== null || i.na).length;
  return { scored, total: enabledItems.length };
}
