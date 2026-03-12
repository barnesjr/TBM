import { useStore } from '@/store';
import { getMaturityBand } from '@/types';

export default function Dashboard() {
  const { data } = useStore();
  if (!data) return null;

  const enabledDisciplines = data.disciplines.filter((d) => d.enabled);

  const allItems = enabledDisciplines.flatMap((d) =>
    d.capability_areas.flatMap((ca) => ca.items)
  );
  const totalItems = allItems.length;
  const scoredItems = allItems.filter((i) => i.score !== null || i.na).length;
  const completionPct = totalItems > 0 ? Math.round((scoredItems / totalItems) * 100) : 0;

  const disciplineScores = enabledDisciplines.map((d) => {
    const items = d.capability_areas.flatMap((ca) => ca.items);
    const scored = items.filter((i) => i.score !== null && !i.na);
    const total = items.length;
    const done = items.filter((i) => i.score !== null || i.na).length;
    const avg = scored.length > 0
      ? scored.reduce((sum, i) => sum + (i.score ?? 0), 0) / scored.length
      : null;
    return { id: d.id, name: d.name, score: avg, done, total };
  });

  return (
    <div className="max-w-4xl page-enter">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h2>
      <p className="text-sm text-text-tertiary mb-8">
        Assessment overview and progress summary.
      </p>

      {/* Client Info Summary */}
      <div className="bg-surface-medium border border-border rounded-lg p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          Client Information
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-tertiary">Client:</span>{' '}
            <span className="text-text-primary">{data.client_info.name || '—'}</span>
          </div>
          <div>
            <span className="text-text-tertiary">Date:</span>{' '}
            <span className="text-text-primary">{data.client_info.assessment_date || '—'}</span>
          </div>
          <div>
            <span className="text-text-tertiary">Assessor:</span>{' '}
            <span className="text-text-primary">{data.client_info.assessor || '—'}</span>
          </div>
        </div>
      </div>

      {/* Overall Completion */}
      <div className="bg-surface-medium border border-border rounded-lg p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          Overall Completion
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-accent">{completionPct}%</div>
          <div className="flex-1">
            <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {scoredItems} of {totalItems} items assessed
            </p>
          </div>
        </div>
      </div>

      {/* Disciplines */}
      <div className="bg-surface-medium border border-border rounded-lg p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          Disciplines
        </h3>
        <div className="space-y-3">
          {disciplineScores.map((d) => {
            const band = d.score !== null ? getMaturityBand(d.score) : null;
            const pct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
            return (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary font-medium flex-1">{d.name}</span>
                <span className="text-text-tertiary mr-4">{d.done}/{d.total}</span>
                <div className="w-24 h-1.5 bg-surface-dark rounded-full overflow-hidden mr-4">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: band?.color ?? 'var(--color-text-tertiary)',
                    }}
                  />
                </div>
                {d.score !== null ? (
                  <span
                    className="text-xs font-semibold w-10 text-right"
                    style={{ color: band?.color }}
                  >
                    {d.score.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-xs text-text-tertiary w-10 text-right">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-text-tertiary italic">
        Charts will be added in a future update.
      </p>
    </div>
  );
}
