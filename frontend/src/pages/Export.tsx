import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { exportDeliverable } from '@/api';
import type { ExportType } from '@/api';
import { validateAssessment } from '@/validation';
import {
  FileDown, FileText, FileSpreadsheet, Presentation,
  Loader2, CheckCircle, AlertCircle, BarChart3, Zap, DollarSign,
  AlertTriangle, Info,
} from 'lucide-react';

interface DeliverableDef {
  id: ExportType;
  name: string;
  description: string;
  format: string;
  icon: typeof FileText;
  section: 'core' | 'tbm';
}

const DELIVERABLES: DeliverableDef[] = [
  { id: 'findings', name: 'Assessment Findings', description: 'Per-discipline item breakdown with scores, notes, and evidence', format: 'DOCX', icon: FileText, section: 'core' },
  { id: 'executive-summary', name: 'Executive Summary', description: 'Composite score, embedded radar chart, top priority gaps', format: 'DOCX', icon: FileText, section: 'core' },
  { id: 'gap-analysis', name: 'Gap Analysis & Roadmap', description: 'Current vs target matrix with remediation priorities', format: 'DOCX', icon: FileText, section: 'core' },
  { id: 'workbook', name: 'Scored Assessment Workbook', description: 'Dashboard sheet plus per-discipline sheets with all items', format: 'XLSX', icon: FileSpreadsheet, section: 'core' },
  { id: 'outbrief', name: 'Out-Brief Presentation', description: 'Title, overview, radar chart, and per-discipline slides', format: 'PPTX', icon: Presentation, section: 'core' },
  { id: 'heatmap', name: 'TBM Heatmap', description: 'Discipline x capability area color-coded score grid', format: 'XLSX', icon: BarChart3, section: 'tbm' },
  { id: 'quick-wins', name: 'Quick Wins Report', description: 'Low-score, high-impact items prioritized by weight and gap', format: 'DOCX', icon: Zap, section: 'tbm' },
  { id: 'cost-transparency-roadmap', name: 'Cost Transparency Roadmap', description: 'TBM taxonomy adoption roadmap with cost allocation maturity progression', format: 'DOCX', icon: DollarSign, section: 'tbm' },
];

interface ExportStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  filenames: string[];
}

export default function Export() {
  const { data } = useStore();
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({});
  const [allLoading, setAllLoading] = useState(false);

  const issues = useMemo(() => {
    if (!data) return [];
    return validateAssessment(data);
  }, [data]);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  async function handleExport(id: ExportType) {
    setStatuses((s) => ({ ...s, [id]: { loading: true, success: false, error: null, filenames: [] } }));
    try {
      const result = await exportDeliverable(id);
      setStatuses((s) => ({ ...s, [id]: { loading: false, success: true, error: null, filenames: result.filenames } }));
    } catch (e) {
      setStatuses((s) => ({ ...s, [id]: { loading: false, success: false, error: (e as Error).message, filenames: [] } }));
    }
  }

  async function handleExportAll() {
    setAllLoading(true);
    try {
      const result = await exportDeliverable('all');
      const newStatuses: Record<string, ExportStatus> = {};
      for (const d of DELIVERABLES) {
        newStatuses[d.id] = { loading: false, success: true, error: null, filenames: result.filenames };
      }
      setStatuses(newStatuses);
    } catch (e) {
      const errStatuses: Record<string, ExportStatus> = {};
      for (const d of DELIVERABLES) {
        errStatuses[d.id] = { loading: false, success: false, error: (e as Error).message, filenames: [] };
      }
      setStatuses(errStatuses);
    } finally {
      setAllLoading(false);
    }
  }

  const coreDeliverables = DELIVERABLES.filter((d) => d.section === 'core');
  const tbmDeliverables = DELIVERABLES.filter((d) => d.section === 'tbm');

  function renderCard(d: DeliverableDef) {
    const status = statuses[d.id];
    const Icon = d.icon;

    return (
      <div
        key={d.id}
        className="bg-surface-medium border border-border rounded-xl p-5 flex items-center gap-5 transition-colors hover:border-border-hover"
      >
        <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
          <Icon size={20} className="text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-text-primary">{d.name}</h3>
            <span className="text-[10px] px-2 py-0.5 bg-surface-elevated text-text-tertiary rounded-md font-medium">{d.format}</span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">{d.description}</p>
          {status?.success && status.filenames.length > 0 && (
            <p className="text-xs text-green-400 mt-1.5">{status.filenames.join(', ')}</p>
          )}
          {status?.error && <p className="text-xs text-red-400 mt-1.5">{status.error}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {status?.loading ? <Loader2 size={16} className="animate-spin text-accent" /> :
           status?.success ? <CheckCircle size={16} className="text-green-400" /> :
           status?.error ? <AlertCircle size={16} className="text-red-400" /> : null}
          <button
            onClick={() => handleExport(d.id)}
            disabled={status?.loading}
            className="px-4 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/10 disabled:opacity-50 transition-all"
          >
            Export
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Validation warnings panel */}
      {issues.length > 0 && (
        <div className="mb-8 bg-surface-medium border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Pre-Export Validation</h3>
          {errors.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-xs font-semibold text-red-400">{errors.length} Error{errors.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1 ml-5">
                {errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-xs text-red-300">{e.message}</p>
                ))}
                {errors.length > 5 && <p className="text-xs text-red-300/60">...and {errors.length - 5} more</p>}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1 ml-5">
                {warnings.slice(0, 5).map((w, i) => (
                  <p key={i} className="text-xs text-amber-300">{w.message}</p>
                ))}
                {warnings.length > 5 && <p className="text-xs text-amber-300/60">...and {warnings.length - 5} more</p>}
              </div>
            </div>
          )}
          {infos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Info size={14} className="text-text-tertiary" />
                <span className="text-xs font-semibold text-text-tertiary">{infos.length} unscored item{infos.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Export Deliverables</h2>
          <p className="text-sm text-text-tertiary mt-1">Generate assessment reports and workbooks.</p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={allLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-page-bg text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {allLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Export All
        </button>
      </div>

      <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">Core Deliverables</h3>
      <div className="space-y-3 mb-8">{coreDeliverables.map(renderCard)}</div>

      <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">TBM-Specific Deliverables</h3>
      <div className="space-y-3">{tbmDeliverables.map(renderCard)}</div>

      <p className="text-xs text-text-tertiary mt-6">
        Exports are saved to the <code className="bg-surface-elevated px-1.5 py-0.5 rounded-md text-text-secondary">exports/</code> directory.
      </p>
    </div>
  );
}
