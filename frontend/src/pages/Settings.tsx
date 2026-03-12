import { useStore } from '@/store';
import { WEIGHTING_MODELS, DEFAULT_TARGET_SCORE } from '@/types';

/* ── ToggleSwitch (matches Sidebar) ──────────────────────────────── */

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
        checked ? 'bg-accent' : 'bg-surface-muted'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ── Settings Page ───────────────────────────────────────────────── */

export default function Settings() {
  const { data, updateData } = useStore();
  if (!data) return null;

  const { disciplines, scoring_config, target_scores } = data;
  const isBalanced = scoring_config.weighting_model === 'balanced';
  const enabledDisciplines = disciplines.filter((d) => d.enabled);

  /* ── Handlers ────────────────────────────────────────────────── */

  const handleWeightingModelChange = (model: string) => {
    updateData((draft) => {
      draft.scoring_config.weighting_model = model;
      if (model === 'balanced') {
        const count = draft.disciplines.filter((d) => d.enabled).length;
        const equalWeight = count > 0 ? 1 / count : 0;
        draft.disciplines.forEach((d) => {
          d.weight = d.enabled ? equalWeight : 0;
          draft.scoring_config.discipline_weights[d.id] = d.weight;
        });
      }
    });
  };

  const handleCustomWeightChange = (discId: string, pct: number) => {
    updateData((draft) => {
      const clamped = Math.min(100, Math.max(0, pct));
      const disc = draft.disciplines.find((d) => d.id === discId);
      if (disc) {
        disc.weight = clamped / 100;
        draft.scoring_config.discipline_weights[discId] = disc.weight;
      }
    });
  };

  const handleTargetChange = (discId: string, val: number) => {
    updateData((draft) => {
      draft.target_scores[discId] = isNaN(val) ? DEFAULT_TARGET_SCORE : Math.min(4, Math.max(1, val));
    });
  };

  const handleToggle = (discId: string) => {
    updateData((draft) => {
      const disc = draft.disciplines.find((d) => d.id === discId);
      if (!disc) return;
      disc.enabled = !disc.enabled;

      if (draft.scoring_config.weighting_model === 'balanced') {
        const enabledCount = draft.disciplines.filter((d) => d.enabled).length;
        const equalWeight = enabledCount > 0 ? 1 / enabledCount : 0;
        draft.disciplines.forEach((d) => {
          d.weight = d.enabled ? equalWeight : 0;
          draft.scoring_config.discipline_weights[d.id] = d.weight;
        });
      }
    });
  };

  /* ── Computed ─────────────────────────────────────────────────── */

  const totalCustomWeight = enabledDisciplines.reduce((sum, d) => sum + d.weight, 0);
  const totalPct = Math.round(totalCustomWeight * 100);

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl page-enter">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Settings</h2>
      <p className="text-sm text-text-tertiary mb-8">
        Configure scoring weights, targets, and supplemental disciplines.
      </p>

      {/* ── 1. Weighting Model ──────────────────────────────────── */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Scoring Weight Model</h3>
        <select
          value={scoring_config.weighting_model}
          onChange={(e) => handleWeightingModelChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
        >
          {Object.entries(WEIGHTING_MODELS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.label}
            </option>
          ))}
        </select>

        <p className="text-xs text-text-tertiary mt-2">
          {isBalanced
            ? 'All enabled disciplines share equal weight, automatically calculated.'
            : 'Set individual weights per discipline. Weights should sum to 100%.'}
        </p>
      </div>

      {/* ── 2. Discipline Weights ───────────────────────────────── */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Discipline Weights</h3>
          {!isBalanced && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                totalPct === 100
                  ? 'text-score-optimized bg-score-optimized/10'
                  : 'text-score-ad-hoc bg-score-ad-hoc/10'
              }`}
            >
              Total: {totalPct}%
            </span>
          )}
        </div>

        {isBalanced ? (
          /* Balanced: read-only grid */
          <div className="grid grid-cols-3 gap-2.5">
            {disciplines
              .filter((d) => d.enabled)
              .map((d) => (
                <div key={d.id} className="text-center p-3 bg-surface-elevated rounded-lg">
                  <div className="text-[10px] text-text-tertiary mb-1 truncate">{d.name}</div>
                  <div className="text-sm font-semibold text-text-primary">
                    {(d.weight * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Custom: editable weights */
          <div className="space-y-3">
            {disciplines
              .filter((d) => d.enabled)
              .map((d) => (
                <div key={d.id} className="flex items-center gap-4">
                  <label className="text-sm text-text-secondary w-48 truncate">{d.name}</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(d.weight * 100)}
                    onChange={(e) => handleCustomWeightChange(d.id, parseInt(e.target.value, 10))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-sm text-text-primary w-12 text-right font-medium">
                    {Math.round(d.weight * 100)}%
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── 3. Target Scores ────────────────────────────────────── */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Target Scores</h3>
        <p className="text-xs text-text-tertiary mb-4">
          Set target maturity scores per discipline for gap analysis on the dashboard.
        </p>
        <div className="space-y-3">
          {disciplines.map((d) => (
            <div key={d.id} className={`flex items-center gap-4 ${!d.enabled ? 'opacity-40' : ''}`}>
              <label className="text-sm text-text-secondary w-48 truncate">{d.name}</label>
              <input
                type="number"
                min={1}
                max={4}
                step={0.5}
                disabled={!d.enabled}
                value={target_scores[d.id] ?? DEFAULT_TARGET_SCORE}
                onChange={(e) => handleTargetChange(d.id, parseFloat(e.target.value))}
                className="w-24 px-4 py-2 text-sm bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Supplemental Disciplines ─────────────────────────── */}
      <div className="bg-surface-medium border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Supplemental Disciplines</h3>
        <p className="text-xs text-text-tertiary mb-4">
          Enable or disable supplemental assessment disciplines. Toggling will auto-rebalance weights
          in balanced mode.
        </p>
        <div className="space-y-3">
          {disciplines
            .filter((d) => d.supplemental)
            .map((d) => (
              <div
                key={d.id}
                className={`flex items-center justify-between p-3 bg-surface-elevated rounded-lg ${
                  !d.enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-primary truncate">{d.name}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">
                    {d.capability_areas.length} capability area{d.capability_areas.length !== 1 ? 's' : ''}{' '}
                    &middot;{' '}
                    {d.capability_areas.reduce((sum, ca) => sum + ca.items.length, 0)} items
                  </div>
                </div>
                <ToggleSwitch checked={d.enabled} onChange={() => handleToggle(d.id)} />
              </div>
            ))}
          {disciplines.filter((d) => d.supplemental).length === 0 && (
            <p className="text-xs text-text-tertiary italic">No supplemental disciplines defined.</p>
          )}
        </div>
      </div>
    </div>
  );
}
