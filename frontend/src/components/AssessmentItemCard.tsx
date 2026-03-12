import { useState } from 'react';
import type { AssessmentItem, FrameworkItem, EvidenceReference } from '@/types';
import { ScoringWidget } from './ScoringWidget';
import { ConfidenceWidget } from './ConfidenceWidget';
import { ChevronRight, Plus, Trash2, Paperclip } from 'lucide-react';

const RUBRIC_KEYS = ['ad_hoc', 'foundational', 'managed', 'optimized'] as const;
const RUBRIC_LABELS: Record<string, string> = {
  ad_hoc: 'Ad Hoc',
  foundational: 'Foundational',
  managed: 'Managed',
  optimized: 'Optimized',
};
const RUBRIC_COLORS: Record<string, string> = {
  ad_hoc: '#ef4444',
  foundational: '#f97316',
  managed: '#84cc16',
  optimized: '#22c55e',
};

interface AssessmentItemCardProps {
  item: AssessmentItem;
  frameworkItem?: FrameworkItem;
  onUpdate: (updates: Partial<AssessmentItem>) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function AssessmentItemCard({
  item,
  frameworkItem,
  onUpdate,
  expanded = false,
  onToggleExpand,
}: AssessmentItemCardProps) {
  const [showRubric, setShowRubric] = useState(false);

  const addEvidence = () => {
    onUpdate({
      evidence_references: [
        ...item.evidence_references,
        { document: '', section: '', date: '' },
      ],
    });
  };

  const updateEvidence = (index: number, field: keyof EvidenceReference, value: string) => {
    const updated = item.evidence_references.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    );
    onUpdate({ evidence_references: updated });
  };

  const removeEvidence = (index: number) => {
    onUpdate({
      evidence_references: item.evidence_references.filter((_, i) => i !== index),
    });
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        expanded
          ? 'border-accent/30 bg-surface shadow-lg shadow-accent/5'
          : 'border-border bg-surface hover:border-border-hover'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <ChevronRight
          size={14}
          className={`shrink-0 mt-1 text-text-tertiary transition-transform duration-150 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <p className="flex-1 text-sm text-text-primary leading-relaxed">{item.text}</p>
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <ScoringWidget
            score={item.score}
            na={item.na}
            onChange={(score, na) => {
              onUpdate({ score, na, na_justification: na ? item.na_justification : null });
            }}
          />
          <ConfidenceWidget
            confidence={item.confidence}
            onChange={(confidence) => onUpdate({ confidence })}
          />
        </div>
      </div>

      {/* N/A justification */}
      {item.na && (
        <div className="px-4 pb-3 ml-7">
          <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
            N/A Justification
          </label>
          <input
            type="text"
            value={item.na_justification ?? ''}
            onChange={(e) => onUpdate({ na_justification: e.target.value })}
            placeholder="Why is this not applicable?"
            className="mt-1 w-full text-sm bg-surface-muted border border-border rounded-lg px-3 py-1.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Expanded section */}
      {expanded && (
        <div className="px-4 pb-4 ml-7 space-y-4">
          {/* Rubric toggle */}
          {frameworkItem && (
            <div>
              <button
                onClick={() => setShowRubric((s) => !s)}
                className="text-[10px] font-semibold text-accent hover:text-accent/80 uppercase tracking-wider transition-colors"
              >
                {showRubric ? 'Hide Rubric' : 'Show Rubric'}
              </button>
              {showRubric && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {RUBRIC_KEYS.map((key) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border p-2.5 text-xs"
                    >
                      <div
                        className="font-semibold mb-1 text-[10px] uppercase tracking-wider"
                        style={{ color: RUBRIC_COLORS[key] }}
                      >
                        {RUBRIC_LABELS[key]}
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        {frameworkItem.rubric[key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={item.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Additional observations, context, or recommendations..."
              rows={3}
              className="mt-1 w-full text-sm bg-surface-muted border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Evidence references */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                Evidence References
              </label>
              <button
                onClick={addEvidence}
                className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            {item.evidence_references.map((ref, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={ref.document}
                  onChange={(e) => updateEvidence(i, 'document', e.target.value)}
                  placeholder="Document"
                  className="flex-1 text-xs bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={ref.section}
                  onChange={(e) => updateEvidence(i, 'section', e.target.value)}
                  placeholder="Section"
                  className="w-28 text-xs bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={ref.date}
                  onChange={(e) => updateEvidence(i, 'date', e.target.value)}
                  placeholder="Date"
                  className="w-24 text-xs bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
                <button
                  onClick={() => removeEvidence(i)}
                  className="text-text-tertiary hover:text-score-ad-hoc transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Attachments */}
          {item.attachments.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                Attachments
              </label>
              <div className="mt-1 space-y-1">
                {item.attachments.map((filename, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Paperclip size={12} className="shrink-0 text-text-tertiary" />
                    <span>{filename}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
