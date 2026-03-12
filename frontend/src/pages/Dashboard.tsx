import { useStore } from '@/store';
import {
  weightedCompositeScore,
  overallCompletion,
  disciplineScore,
  disciplineCompletion,
} from '@/scoring';
import { getMaturityBand, MATURITY_BANDS } from '@/types';
import { OnboardingTooltip } from '@/components/OnboardingTooltip';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-medium border border-border rounded-xl p-6 transition-colors hover:border-border-hover ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">{children}</h3>;
}

export default function Dashboard() {
  const { data } = useStore();
  if (!data) return null;

  const enabledDisciplines = data.disciplines.filter((d) => d.enabled);
  const composite = weightedCompositeScore(data);
  const band = composite !== null ? getMaturityBand(composite) : null;
  const { scored: scoredCount, total: totalCount } = overallCompletion(data);
  const completionPct = totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0;

  // Radar chart data: one axis per enabled discipline
  const radarData = enabledDisciplines.map((d) => ({
    discipline: d.name.length > 14 ? d.name.slice(0, 14) + '\u2026' : d.name,
    score: disciplineScore(d) ?? 0,
    target: data.target_scores[d.id] ?? 0,
    fullMark: 4,
  }));

  // Bar chart data with maturity band colors
  const barData = enabledDisciplines.map((d) => {
    const score = disciplineScore(d) ?? 0;
    const scoreBand = score > 0 ? getMaturityBand(score) : null;
    return {
      name: d.name.length > 16 ? d.name.slice(0, 16) + '\u2026' : d.name,
      score,
      color: scoreBand?.color ?? '#3A3A3E',
    };
  });

  // Top gaps: disciplines with largest gap between target and current
  const gapData = enabledDisciplines
    .map((d) => {
      const current = disciplineScore(d) ?? 0;
      const target = data.target_scores[d.id] ?? 0;
      return { name: d.name, current, target, gap: target - current };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  return (
    <div className="page-enter">
      <h2 className="text-2xl font-bold text-text-primary mb-8">Dashboard</h2>

      {/* Top row: Composite Score, Maturity Band, Progress */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Composite Score */}
        <Card className="relative">
          <SectionLabel>Overall Maturity Score</SectionLabel>
          {composite !== null ? (
            <>
              <div className="text-4xl font-bold mt-1" style={{ color: band!.color }}>
                {composite.toFixed(2)}
              </div>
              <div className="text-sm font-medium mt-2" style={{ color: band!.color }}>
                {band!.label}
              </div>
            </>
          ) : (
            <div className="text-3xl text-text-tertiary mt-1">--</div>
          )}
          <OnboardingTooltip id="dashboard-composite-hint" position="bottom">
            This composite score is a weighted average across all enabled disciplines. Adjust weights in Settings.
          </OnboardingTooltip>
        </Card>

        {/* Maturity Band legend */}
        <Card>
          <SectionLabel>Maturity Band</SectionLabel>
          <div className="space-y-2 mt-1">
            {MATURITY_BANDS.map((b) => {
              const isActive = band && b.label === band.label;
              return (
                <div key={b.label} className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: b.color,
                      opacity: isActive ? 1 : 0.25,
                      transform: isActive ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                  <span className={`text-xs ${isActive ? 'font-semibold text-text-primary' : 'text-text-tertiary'}`}>
                    {b.label}
                  </span>
                  <span className="text-[10px] text-text-tertiary ml-auto font-mono">
                    {b.min.toFixed(1)}&ndash;{b.max.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Assessment Progress */}
        <Card>
          <SectionLabel>Assessment Progress</SectionLabel>
          <div className="text-4xl font-bold text-accent mt-1">{completionPct}%</div>
          <div className="text-sm text-text-secondary mt-2">
            {scoredCount} / {totalCount} items scored
          </div>
          <div className="mt-4 space-y-2">
            {enabledDisciplines.map((d) => {
              const dPct = Math.round(disciplineCompletion(d) * 100);
              return (
                <div key={d.id} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-text-secondary w-32 truncate">{d.name}</span>
                  <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${dPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary w-8 text-right font-mono">{dPct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Charts row: Radar + Bar */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Radar Chart */}
        <Card>
          <SectionLabel>Discipline Maturity Profile</SectionLabel>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2A2A2E" />
                <PolarAngleAxis dataKey="discipline" tick={{ fontSize: 10, fill: '#D0D0D0' }} />
                <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 10, fill: '#8A8A8E' }} tickCount={5} />
                <Radar name="Current" dataKey="score" stroke="#1BA1E2" fill="#1BA1E2" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Target" dataKey="target" stroke="#8A8A8E" fill="#8A8A8E" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="5 5" />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#D0D0D0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart */}
        <Card>
          <SectionLabel>Discipline Scores</SectionLabel>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 11, fill: '#8A8A8E' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#D0D0D0' }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1E',
                    border: '1px solid #2A2A2E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#D0D0D0' }}
                />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} barSize={14}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Gaps */}
      {gapData.length > 0 && (
        <Card className="mb-6">
          <SectionLabel>Top Gaps (Current vs Target)</SectionLabel>
          <div className="space-y-3 mt-1">
            {gapData.map((g) => {
              const gapBand = getMaturityBand(g.current || 1);
              return (
                <div key={g.name} className="flex items-center gap-3">
                  <span className="text-sm text-text-primary font-medium w-40 truncate">{g.name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(g.current / 4) * 100}%`, backgroundColor: gapBand.color }}
                      />
                      <div
                        className="absolute top-0 h-full border-r-2 border-dashed border-text-tertiary"
                        style={{ left: `${(g.target / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-text-secondary w-10 text-right">{g.current.toFixed(1)}</span>
                  <span className="text-[10px] text-text-tertiary">/</span>
                  <span className="text-xs font-mono text-text-tertiary w-6">{g.target.toFixed(1)}</span>
                  <span className="text-xs font-semibold text-red-400 w-12 text-right">-{g.gap.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Per-discipline Summary */}
      <SectionLabel>Discipline Summary</SectionLabel>
      <div className="grid grid-cols-3 gap-5 mb-6">
        {enabledDisciplines.map((d) => {
          const dScore = disciplineScore(d);
          const dBand = dScore !== null ? getMaturityBand(dScore) : null;
          const dPct = Math.round(disciplineCompletion(d) * 100);
          const dItems = d.capability_areas.flatMap((ca) => ca.items);
          const dScored = dItems.filter((i) => i.score !== null || i.na).length;
          return (
            <Card key={d.id}>
              <SectionLabel>{d.name}</SectionLabel>
              {dScore !== null ? (
                <div className="text-2xl font-bold mt-1" style={{ color: dBand!.color }}>
                  {dScore.toFixed(2)}
                </div>
              ) : (
                <div className="text-2xl text-text-tertiary mt-1">--</div>
              )}
              <div className="text-xs text-text-tertiary mt-2">
                {dScored}/{dItems.length} items ({dPct}%)
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
