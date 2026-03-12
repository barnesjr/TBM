import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import type { Discipline } from '@/types';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Briefcase,
  Users,
  Target,
  Handshake,
  Server,
  Shield,
  Building2,
  Cloud,
  Lock,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  FileText,
  LayoutDashboard,
  Download,
  Settings as SettingsIcon,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */

const DISCIPLINE_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'cost-transparency': DollarSign,
  'budget-forecasting': TrendingUp,
  benchmarking: BarChart3,
  'service-portfolio': Briefcase,
  'demand-management': Users,
  'investment-prioritization': Target,
  'vendor-contract': Handshake,
  'asset-management': Server,
  'federal-compliance': Shield,
  'shared-services': Building2,
  'cloud-modernization': Cloud,
  'cybersecurity-investment': Lock,
};

function disciplineScore(disc: Discipline): number | null {
  const scored = disc.capability_areas.flatMap((ca) => ca.items).filter((i) => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score ?? 0), 0) / scored.length;
}

function disciplineCompletion(disc: Discipline): number {
  const items = disc.capability_areas.flatMap((ca) => ca.items);
  const total = items.length;
  if (total === 0) return 0;
  const done = items.filter((i) => i.score !== null || i.na).length;
  return done / total;
}

function scoreColor(score: number): string {
  if (score >= 3.25) return 'var(--color-score-optimized)';
  if (score >= 2.5) return 'var(--color-score-managed)';
  if (score >= 1.75) return 'var(--color-score-foundational)';
  return 'var(--color-score-ad-hoc)';
}

/* ── ProgressRing ────────────────────────────────────────────────── */

function ProgressRing({ pct, color, size = 20 }: { pct: number; color: string; size?: number }) {
  const r = (size - 3) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-elevated)" strokeWidth={2.5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}

/* ── ToggleSwitch ────────────────────────────────────────────────── */

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${
        checked ? 'bg-accent' : 'bg-surface-muted'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-3.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ── ScoreBadge ──────────────────────────────────────────────────── */

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ color: scoreColor(score), backgroundColor: `${scoreColor(score)}20` }}
    >
      {score.toFixed(1)}
    </span>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */

interface SidebarProps {
  width: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

export function Sidebar({ width, collapsed, onToggleCollapse }: SidebarProps) {
  const { data, updateData, saveStatus } = useStore();
  const location = useLocation();
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedDisciplines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSupplemental = (discId: string, enabled: boolean) => {
    updateData((d) => {
      const disc = d.disciplines.find((dd) => dd.id === discId);
      if (disc) disc.enabled = enabled;
      // Rebalance weights (balanced mode)
      if (d.scoring_config.weighting_model === 'balanced') {
        const enabledCount = d.disciplines.filter((dd) => dd.enabled).length;
        const equalWeight = enabledCount > 0 ? 1 / enabledCount : 0;
        d.disciplines.forEach((dd) => {
          dd.weight = dd.enabled ? equalWeight : 0;
          d.scoring_config.discipline_weights[dd.id] = dd.weight;
        });
      }
    });
  };

  const coreDisciplines = data?.disciplines.filter((d) => !d.supplemental) ?? [];
  const supplementalDisciplines = data?.disciplines.filter((d) => d.supplemental) ?? [];

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
      isActive
        ? 'bg-accent/15 text-accent font-medium'
        : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'
    }`;

  const renderDisciplineRow = (disc: Discipline, isSupplemental: boolean) => {
    const Icon = DISCIPLINE_ICONS[disc.id];
    const isExpanded = expandedDisciplines.has(disc.id);
    const score = disc.enabled ? disciplineScore(disc) : null;
    const completion = disc.enabled ? disciplineCompletion(disc) : 0;
    const isActive = location.pathname.startsWith(`/discipline/${disc.id}`);
    const ringColor = score !== null ? scoreColor(score) : 'var(--color-text-tertiary)';

    return (
      <div key={disc.id} className={!disc.enabled && isSupplemental ? 'opacity-40' : ''}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
            isActive
              ? 'bg-accent/15 text-accent'
              : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'
          }`}
          onClick={() => {
            if (disc.enabled || !isSupplemental) toggleExpand(disc.id);
          }}
        >
          {/* Expand chevron */}
          {!collapsed && (
            <ChevronRight
              size={12}
              className={`shrink-0 transition-transform duration-150 text-text-tertiary ${
                isExpanded && disc.enabled ? 'rotate-90' : ''
              }`}
            />
          )}
          {/* Icon */}
          {Icon && <Icon size={16} className="shrink-0" />}
          {/* Label */}
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-xs">{disc.name}</span>
              {/* Supplemental toggle */}
              {isSupplemental && (
                <ToggleSwitch
                  checked={disc.enabled}
                  onChange={(v) => toggleSupplemental(disc.id, v)}
                />
              )}
              {/* Score + progress */}
              {disc.enabled && (
                <>
                  {score !== null && <ScoreBadge score={score} />}
                  <ProgressRing pct={completion} color={ringColor} />
                </>
              )}
            </>
          )}
        </div>

        {/* Capability areas */}
        {!collapsed && isExpanded && disc.enabled && (
          <div className="ml-7 mt-0.5 space-y-0.5">
            {disc.capability_areas.map((ca) => {
              const caPath = `/discipline/${disc.id}/${ca.id}`;
              const caActive = location.pathname === caPath;
              return (
                <NavLink
                  key={ca.id}
                  to={caPath}
                  className={`block px-3 py-1 rounded text-xs truncate transition-colors duration-150 ${
                    caActive
                      ? 'text-accent bg-accent/10'
                      : 'text-text-tertiary hover:text-text-secondary hover:bg-sidebar-hover'
                  }`}
                >
                  {ca.name}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const saveIcon = (() => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 size={12} className="animate-spin text-text-tertiary" />;
      case 'saved':
        return <CheckCircle2 size={12} className="text-score-optimized" />;
      case 'error':
        return <AlertCircle size={12} className="text-score-ad-hoc" />;
      default:
        return null;
    }
  })();

  return (
    <nav
      className="h-full bg-sidebar border-r border-border flex flex-col overflow-hidden shrink-0 transition-[width] duration-200"
      style={{ width }}
    >
      {/* Logo header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/peraton-logo.png" alt="Peraton" className="h-5 shrink-0" />
            <span className="text-xs font-semibold text-text-secondary truncate">
              TBM Assessment
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-sidebar-hover text-text-tertiary hover:text-text-primary transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {/* Top nav */}
        <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
          <FileText size={16} className="shrink-0" />
          {!collapsed && <span>Client Info</span>}
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
          <LayoutDashboard size={16} className="shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Separator */}
        <div className="border-t border-border my-2" />

        {/* Core disciplines */}
        {!collapsed && (
          <p className="px-3 pt-1 pb-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
            Core Disciplines
          </p>
        )}
        {coreDisciplines.map((d) => renderDisciplineRow(d, false))}

        {/* Supplemental disciplines */}
        {supplementalDisciplines.length > 0 && (
          <>
            <div className="border-t border-border my-2" />
            {!collapsed && (
              <p className="px-3 pt-1 pb-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                Supplemental
              </p>
            )}
            {supplementalDisciplines.map((d) => renderDisciplineRow(d, true))}
          </>
        )}

        {/* Separator */}
        <div className="border-t border-border my-2" />

        {/* Bottom nav */}
        <NavLink to="/export" className={({ isActive }) => navLinkClass(isActive)}>
          <Download size={16} className="shrink-0" />
          {!collapsed && <span>Export</span>}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => navLinkClass(isActive)}>
          <SettingsIcon size={16} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <NavLink to="/help" className={({ isActive }) => navLinkClass(isActive)}>
          <HelpCircle size={16} className="shrink-0" />
          {!collapsed && <span>Help</span>}
        </NavLink>
      </div>

      {/* Save status footer */}
      {saveIcon && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border text-xs text-text-tertiary">
          {saveIcon}
          {!collapsed && (
            <span>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'error' && 'Save failed'}
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
