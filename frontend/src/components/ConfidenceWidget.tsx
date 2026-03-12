interface ConfidenceWidgetProps {
  confidence: 'High' | 'Medium' | 'Low' | null;
  onChange: (confidence: 'High' | 'Medium' | 'Low') => void;
}

const CONFIDENCE_SHORT: Record<string, string> = { High: 'H', Medium: 'M', Low: 'L' };

export function ConfidenceWidget({ confidence, onChange }: ConfidenceWidgetProps) {
  return (
    <div className="flex items-center gap-1">
      {(['High', 'Medium', 'Low'] as const).map((level) => (
        <button key={level} onClick={() => onChange(level)}
          title={level}
          className={`w-8 h-8 text-[10px] font-semibold rounded-lg transition-all duration-150 border ${
            confidence === level ? 'bg-accent text-page-bg border-transparent shadow-lg' : 'border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary'
          }`}
          style={confidence === level ? { boxShadow: '0 0 12px rgba(27, 161, 226, 0.3)' } : undefined}
        >
          {CONFIDENCE_SHORT[level]}
        </button>
      ))}
    </div>
  );
}
