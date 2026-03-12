import { SCORE_LABELS, SCORE_COLORS } from '@/types';

const SCORE_DESCRIPTIONS: Record<number, string> = {
  1: 'Ad hoc — no formal process, reactive',
  2: 'Foundational — basic processes, inconsistently applied',
  3: 'Managed — standardized, measured, consistently followed',
  4: 'Optimized — continuous improvement, predictive, automated',
};

interface ScoringWidgetProps {
  score: number | null;
  na: boolean;
  onChange: (score: number | null, na: boolean) => void;
}

export function ScoringWidget({ score, na, onChange }: ScoringWidgetProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((level) => (
        <button key={level} onClick={() => onChange(level, false)}
          title={`${SCORE_LABELS[level]}: ${SCORE_DESCRIPTIONS[level]}`}
          className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all duration-150 border ${
            score === level && !na ? 'text-white border-transparent shadow-lg' : 'border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary'
          }`}
          style={score === level && !na ? { backgroundColor: SCORE_COLORS[level], boxShadow: `0 0 12px ${SCORE_COLORS[level]}40` } : undefined}
        >
          {level}
        </button>
      ))}
      <button onClick={() => onChange(null, true)}
        title="Not Applicable — requires justification"
        className={`w-8 h-8 text-[10px] font-semibold rounded-lg transition-all duration-150 border ${
          na ? 'bg-text-tertiary text-page-bg border-transparent' : 'border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary'
        }`}
      >
        N/A
      </button>
    </div>
  );
}
