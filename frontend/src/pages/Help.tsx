import { Keyboard, BookOpen, FileDown, Layers, Settings, Info } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-3xl page-enter">
      <h2 className="text-2xl font-bold text-text-primary mb-8">Help & Reference</h2>

      {/* Keyboard Shortcuts */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Keyboard size={14} /> Keyboard Shortcuts
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-2 text-sm">
          {[
            ['1 / 2 / 3 / 4', 'Set score on focused item'],
            ['N', 'Toggle N/A on focused item'],
            ['H / M / L', 'Set confidence (High / Medium / Low)'],
            ['↑ / ↓ or J / K', 'Navigate between items'],
            ['Enter / Space', 'Expand or collapse focused item'],
            ['Cmd/Ctrl + K', 'Open command palette'],
            ['Cmd/Ctrl + →', 'Jump to next unscored item'],
            ['Cmd/Ctrl + \\', 'Toggle sidebar collapse'],
            ['Escape', 'Close palette or deselect item'],
          ].map(([keys, desc]) => (
            <div key={keys} className="flex items-center gap-3">
              <code className="bg-surface-elevated px-2 py-1 rounded text-xs text-accent font-mono min-w-[160px]">{keys}</code>
              <span className="text-text-secondary">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring Methodology */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <BookOpen size={14} /> Scoring Methodology
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>Each item is scored on a 1-4 TBM maturity scale:</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              ['1 — Ad Hoc', 'No formal process defined. Activities are reactive, inconsistent, and undocumented.', '#ef4444'],
              ['2 — Foundational', 'Basic processes are in place but not consistently followed. Some documentation exists.', '#f97316'],
              ['3 — Managed', 'Standardized processes are consistently followed and measured. Metrics are tracked and reported.', '#84cc16'],
              ['4 — Optimized', 'Continuously improving with automation and predictive capabilities. Industry-leading practices.', '#22c55e'],
            ].map(([label, desc, color]) => (
              <div key={label} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                <div className="text-xs font-semibold mb-1" style={{ color: color as string }}>{label}</div>
                <p className="text-[11px] text-text-tertiary">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3">Items may be marked N/A with justification. N/A items are excluded from score averaging.</p>
          <p>The weighted composite score combines all enabled discipline scores using the selected weighting model.</p>
        </div>
      </section>

      {/* Discipline Overview */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Layers size={14} /> TBM Disciplines
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>The assessment covers 8 core disciplines aligned to the TBM Council Framework:</p>
          <div className="space-y-3 mt-3">
            {[
              ['IT Cost Transparency', 'Cost pool definition, allocation methodology, fully-loaded costing, and TBM taxonomy mapping'],
              ['IT Financial Management', 'Budget planning, forecasting, variance analysis, chargeback/showback, and financial governance'],
              ['Business-Aligned Portfolio', 'Application portfolio management, business capability mapping, and investment alignment'],
              ['Technology Business Planning', 'Strategic IT planning, demand management, capacity planning, and roadmap development'],
              ['Vendor & Contract Management', 'Vendor lifecycle management, contract optimization, SLA governance, and sourcing strategy'],
              ['Service Costing & Pricing', 'IT service catalog costing, unit cost analysis, rate card management, and pricing models'],
              ['Value & Performance Measurement', 'KPI frameworks, value realization tracking, benchmarking, and performance reporting'],
              ['Data & Analytics Foundation', 'Data quality, integration architecture, reporting infrastructure, and analytics maturity'],
            ].map(([name, desc]) => (
              <div key={name} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                <div className="text-xs font-semibold text-accent-bright mb-1">{name}</div>
                <p className="text-[11px] text-text-tertiary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplemental Disciplines */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Settings size={14} /> Supplemental Disciplines
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>4 optional supplemental disciplines can be enabled for specialized assessments:</p>
          <ul className="list-disc list-inside space-y-1 text-text-tertiary text-xs mt-2">
            <li><span className="text-text-secondary">Federal Compliance & Reporting</span> — FITARA, OMB M-17-22, federal IT spending transparency</li>
            <li><span className="text-text-secondary">Shared Services & Consolidation</span> — Shared services governance, consolidation planning, economies of scale</li>
            <li><span className="text-text-secondary">Cloud & Modernization Investment</span> — Cloud cost management, FinOps, modernization ROI tracking</li>
            <li><span className="text-text-secondary">Cybersecurity Investment Management</span> — Security investment analysis, risk-based budgeting, cyber cost transparency</li>
          </ul>
          <p className="mt-2">Enable supplemental disciplines in <strong>Settings</strong> or via sidebar toggles. When enabled, discipline weights are automatically rebalanced to maintain a total weight of 1.0.</p>
        </div>
      </section>

      {/* Export Deliverables */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <FileDown size={14} /> Export Deliverables
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-2 text-sm text-text-secondary">
          {[
            ['Findings', 'Assessment Findings (DOCX)', 'Per-discipline findings with scores, capability areas, and recommendations'],
            ['Summary', 'Executive Summary (DOCX)', 'Client profile, overall score, radar chart, top priorities'],
            ['Gap', 'Gap Analysis & Roadmap (DOCX)', 'Current vs target gap matrix with severity and remediation roadmap'],
            ['Workbook', 'Scored Assessment Workbook (XLSX)', 'All item scores, confidence, evidence, with auto-calculated averages'],
            ['Outbrief', 'Out-Brief Presentation (PPTX)', 'Executive summary, radar chart, discipline breakdowns'],
            ['Heatmap', 'TBM Maturity Heatmap (XLSX)', 'Discipline x capability area color-coded score matrix'],
            ['Quick Wins', 'Quick Wins Report (DOCX)', 'Low-effort, high-impact improvement opportunities'],
            ['Cost Roadmap', 'Cost Transparency Roadmap (DOCX)', 'Phased implementation plan for TBM cost transparency improvements'],
          ].map(([code, name, desc]) => (
            <div key={code} className="flex items-start gap-3 py-1">
              <code className="bg-surface-elevated px-2 py-0.5 rounded text-[10px] text-text-tertiary font-mono shrink-0">{code}</code>
              <div>
                <div className="font-medium text-text-primary">{name}</div>
                <div className="text-xs text-text-tertiary">{desc}</div>
              </div>
            </div>
          ))}
          <p className="text-xs text-text-tertiary mt-3">
            Exports are saved to the <code className="bg-surface-elevated px-1 py-0.5 rounded">exports/</code> directory.
          </p>
        </div>
      </section>

      {/* TBM Framework Alignment */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Info size={14} /> TBM Framework Alignment
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>This assessment tool is aligned to the <strong>TBM Council Framework</strong> and <strong>OMB M-17-22</strong> guidance for IT cost transparency and management.</p>
          <p>The TBM taxonomy provides a standardized way to categorize, communicate, and optimize IT spending through three layers:</p>
          <ul className="list-disc list-inside space-y-1 text-text-tertiary text-xs mt-2">
            <li><span className="text-text-secondary">Finance</span> — Cost pools (what you spend money on)</li>
            <li><span className="text-text-secondary">IT</span> — IT towers and services (what IT delivers)</li>
            <li><span className="text-text-secondary">Business</span> — Applications and business capabilities (what the business consumes)</li>
          </ul>
          <p className="mt-2">The assessment evaluates organizational maturity across all three layers to identify gaps and prioritize improvements in technology business management practices.</p>
        </div>
      </section>
    </div>
  );
}
