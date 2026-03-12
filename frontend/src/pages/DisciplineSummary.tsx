import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Breadcrumb } from '@/components/Breadcrumb';
import { disciplineScore, disciplineCompletion, capabilityAreaScore, averageScore } from '@/scoring';
import { getMaturityBand } from '@/types';
import { ChevronRight } from 'lucide-react';

export default function DisciplineSummary() {
  const { entityId } = useParams();
  const { data } = useStore();

  if (!data || !entityId) {
    return (
      <div className="p-8 page-enter">
        <p className="text-text-tertiary">Loading...</p>
      </div>
    );
  }

  const discipline = data.disciplines.find((d) => d.id === entityId);
  if (!discipline) {
    return (
      <div className="p-8 page-enter">
        <p className="text-text-tertiary">Discipline not found.</p>
      </div>
    );
  }

  const score = disciplineScore(discipline);
  const completion = disciplineCompletion(discipline);
  const band = score !== null ? getMaturityBand(score) : null;

  return (
    <div className="max-w-4xl mx-auto page-enter">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{discipline.name}</h1>
          <p className="text-sm text-text-tertiary mt-1">
            {discipline.capability_areas.length} capability area
            {discipline.capability_areas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {score !== null && band && (
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: band.color }}>
                {score.toFixed(2)}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: band.color }}>
                {band.label}
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="text-sm font-semibold text-text-primary">
              {Math.round(completion * 100)}%
            </div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
              Complete
            </div>
          </div>
        </div>
      </div>

      {/* Capability Area Cards */}
      <div className="space-y-3">
        {discipline.capability_areas.map((ca) => {
          const caScore = capabilityAreaScore(ca);
          const caBand = caScore !== null ? getMaturityBand(caScore) : null;
          const totalItems = ca.items.length;
          const answeredItems = ca.items.filter((i) => i.score !== null || i.na).length;
          const caPct = totalItems > 0 ? answeredItems / totalItems : 0;

          return (
            <Link
              key={ca.id}
              to={`/discipline/${entityId}/${ca.id}`}
              className="flex items-center gap-4 px-5 py-4 rounded-xl border border-border bg-surface hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                  {ca.name}
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {answeredItems}/{totalItems} items scored
                </p>
              </div>

              {/* Score */}
              {caScore !== null && caBand && (
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{
                    color: caBand.color,
                    backgroundColor: `${caBand.color}20`,
                  }}
                >
                  {caScore.toFixed(1)}
                </span>
              )}

              {/* Completion bar */}
              <div className="w-16 shrink-0">
                <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(caPct * 100)}%`,
                      backgroundColor: caBand?.color ?? 'var(--color-text-tertiary)',
                    }}
                  />
                </div>
              </div>

              <ChevronRight
                size={16}
                className="text-text-tertiary group-hover:text-accent transition-colors shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
