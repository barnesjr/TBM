import { useMemo } from 'react';
import type { AssessmentData } from '@/types';

interface UnscoredResult {
  path: string;
  itemId: string;
  disciplineName: string;
  areaName: string;
  remaining: number;
}

export function findNextUnscored(data: AssessmentData | null): UnscoredResult | null {
  if (!data) return null;

  let remaining = 0;
  let first: Omit<UnscoredResult, 'remaining'> | null = null;

  for (const disc of data.disciplines) {
    if (!disc.enabled) continue;
    for (const ca of disc.capability_areas) {
      for (const item of ca.items) {
        if (item.score === null && !item.na) {
          remaining++;
          if (!first) {
            first = {
              path: `/discipline/${disc.id}/${ca.id}`,
              itemId: item.id,
              disciplineName: disc.name,
              areaName: ca.name,
            };
          }
        }
      }
    }
  }

  if (!first) return null;
  return { ...first, remaining };
}

export function useNextUnscored(data: AssessmentData | null) {
  return useMemo(() => findNextUnscored(data), [data]);
}
