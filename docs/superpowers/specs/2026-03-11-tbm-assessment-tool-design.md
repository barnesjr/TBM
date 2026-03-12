# TBM Assessment Tool — Design Spec

## Overview

A self-contained assessment tool for evaluating Technology Business Management maturity across federal and state government organizations. Built as a FastAPI + React single-page application, packaged as a standalone executable via PyInstaller.

**Approach:** Clone-and-adapt from the ITSM-ITIL reference implementation, simplifying the hierarchy (3-level grouped → 2-level flat) and introducing per-discipline supplemental toggles (a new pattern).

**Reference implementations:**
- Zero-Trust (`/Users/john/Dev/Assessments/Zero-Trust/`) — flat hierarchy, classified extension
- ITSM-ITIL (`/Users/john/Dev/Assessments/ITSM-ITIL/`) — grouped hierarchy, ITIL 4 module, 8 exports

---

## Architecture

### Hierarchy Model

Flat 2-level — simpler than both references:

```
Discipline (12 total: 8 core + 4 supplemental)
  └── Capability Area
       └── Assessment Item
```

No grouping layer. No extension module. Supplemental disciplines are first-class citizens sharing the same routes, models, and scoring — differentiated only by `supplemental: bool` and `enabled: bool` fields.

### Core Disciplines (8, always enabled)

| ID | Name | Default Weight |
|----|------|---------------|
| `cost-transparency` | IT Cost Transparency | 0.125 |
| `budget-forecasting` | Budget & Forecasting | 0.125 |
| `benchmarking` | Benchmarking & Performance | 0.125 |
| `service-portfolio` | Service Portfolio Management | 0.125 |
| `demand-management` | Demand Management | 0.125 |
| `investment-prioritization` | Investment Prioritization | 0.125 |
| `vendor-contract` | Vendor & Contract Management | 0.125 |
| `asset-management` | Technology Asset Management | 0.125 |

### Supplemental Disciplines (4, individually toggleable)

| ID | Name | Default Weight |
|----|------|---------------|
| `federal-compliance` | Federal Compliance & Reporting | 0.0 (disabled) |
| `shared-services` | Shared Services & Consolidation | 0.0 (disabled) |
| `cloud-modernization` | Cloud & Modernization Investment | 0.0 (disabled) |
| `cybersecurity-investment` | Cybersecurity Investment Management | 0.0 (disabled) |

### Data Flow

```
Framework JSON (read-only) ──→ Backend loads on startup
                                    ↓
                              Initializes data.json if missing
                                    ↓
Frontend ←── GET /api/framework ───→ Backend
Frontend ←── GET /api/assessment ──→ Backend (loads data.json)
Frontend ───→ PUT /api/assessment ──→ Backend (atomic save + .bak)
Frontend ───→ POST /api/export/{t} ─→ Backend (generates file)
```

### Tech Stack

**Backend:** Python 3, FastAPI, Uvicorn, Pydantic v2, openpyxl, docxtpl, python-pptx, matplotlib (Agg), PyInstaller

**Frontend:** React 19, TypeScript 5.9+, Vite 7, Tailwind CSS 4, Recharts, Lucide React, React Router 7

### State Management

React Context + `useReducer`. Auto-save with 300ms debounce via `PUT /api/assessment`. `structuredClone` for immutable updates. Identical pattern to both references.

### Constants

```
TOOL_NAME              = "Technology Business Management Assessment Tool"
TOOL_SLUG              = "tbm-assessment"
FRAMEWORK_ALIGNMENT    = "TBM Council Framework / OMB M-17-22"
SIDEBAR_STORAGE_KEY    = "tbm-sidebar"
DEFAULT_PORT           = 8751
DEFAULT_TARGET_SCORE   = 3.0
```

### Data Models

**Backend (Pydantic):**

```python
class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"           # "balanced" | "custom"
    discipline_weights: dict[str, float] = {}   # Current active weights
    custom_weights: Optional[dict[str, float]] = None  # Saved custom weights

class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = ""                     # Updated on every PUT /api/assessment

class AssessmentData(BaseModel):
    client_info: ClientInfo
    assessment_metadata: AssessmentMetadata
    scoring_config: ScoringConfig
    disciplines: list[Discipline]               # Flat list, all 12
    target_scores: dict[str, float] = {}        # Per-discipline targets, default 3.0
```

**Supplemental discipline initialization:** When creating fresh assessment data from framework, `data_manager` must explicitly set `enabled = False` for all disciplines where `supplemental = True`. The Pydantic model defaults `enabled` to `True`, so this must be handled in the initialization logic, not the model default.

---

## API

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/assessment` | — | Full `AssessmentData` JSON |
| `PUT` | `/api/assessment` | `AssessmentData` JSON | `{"status": "saved"}` |
| `GET` | `/api/framework` | — | Framework JSON (read-only) |
| `POST` | `/api/export/{type}` | — | `{"filenames": ["path1", ...]}` |

- Port discovery: try 8751–8760, use first available
- Auto-launch browser after server starts
- Static files served from `backend/static/`
- SPA fallback: non-`/api/*` GET requests serve `index.html`
- Atomic save: write temp file, `os.replace()` into `data.json`, write `.bak` before overwriting
- Load order: `data.json` → `data.json.bak` → fresh from framework
- Error codes: 400 invalid export type, 404 framework missing, 500 server error

---

## Sidebar

### Layout

```
[Logo ~160px]
──────────────
Client Info        → /
Dashboard          → /dashboard
──────────────
CORE DISCIPLINES
  IT Cost Transparency           [score] [ring] [▶]
    └── CA 1, CA 2, ...
  Budget & Forecasting           [score] [ring] [▶]
  ... (6 more)
──────────────
SUPPLEMENTAL DISCIPLINES
  Federal Compliance             [toggle] [score] [ring]
  Shared Services                [toggle] [score] [ring]
  Cloud & Modernization          [toggle] [score] [ring]
  Cybersecurity Investment       [toggle] [score] [ring]
──────────────
Export             → /export
Settings           → /settings
Help               → /help
```

### Supplemental Toggle Behavior

- Toggle switch inline in sidebar, preceding the score badge
- **Off:** row grayed out, score badge and progress ring hidden, CA tree not expandable
- **On:** behaves identically to a core discipline
- Toggling triggers weight auto-rebalance (balanced mode) and auto-save

### Sidebar Mechanics

- Collapsible to 56px icon-only mode
- Resizable via drag handle (min 180px, max 480px, default 350px)
- State persisted in `localStorage` key `tbm-sidebar`
- Progress rings: SVG circles showing % scored per discipline
- Score badges: color-coded by maturity band

---

## Routing

```
/                              → ClientInfo
/dashboard                     → Dashboard
/discipline/:entityId          → DisciplineSummary
/discipline/:entityId/:areaId  → CapabilityArea
/export                        → Export
/settings                      → Settings
/help                          → Help
```

All 12 disciplines (core + supplemental) use the same `/discipline/` routes. Disabled supplemental disciplines are still navigable (greyed sidebar entry prevents casual access but URLs still work).

### Keyboard Shortcuts

**Global:**
- `Cmd/Ctrl+K` — Command Palette
- `Cmd/Ctrl+Right` — Jump to next unscored item

**CapabilityArea page:**
- `1`–`4` — Set score on focused item
- `H`/`M`/`L` — Set confidence
- `N` — Toggle N/A
- `Arrow Up/Down` — Navigate between items

---

## Scoring

### Scale

1–4: Ad Hoc (1), Foundational (2), Managed (3), Optimized (4)

### Colors

| Score | Color |
|-------|-------|
| 1 | `#ef4444` (red) |
| 2 | `#f97316` (orange) |
| 3 | `#84cc16` (lime) |
| 4 | `#22c55e` (green) |

### Maturity Bands

| Range | Label | Color |
|-------|-------|-------|
| 1.0–1.75 | Ad Hoc | `#ef4444` |
| 1.75–2.5 | Foundational | `#f97316` |
| 2.5–3.25 | Managed | `#84cc16` |
| 3.25–4.0 | Optimized | `#22c55e` |

### Scoring Functions

```
averageScore(items)              → mean of scored items, excluding N/A
capabilityAreaScore(ca)          → average of its items
disciplineScore(discipline)      → average of all items across all CAs
weightedCompositeScore(data)     → Σ(disciplineScore × weight) / Σ(weights)
                                    only enabled disciplines
overallCompletion(data)          → {scored, total}, only enabled disciplines
```

### Weight Auto-Rebalancing (Balanced Mode)

When any supplemental discipline is toggled on/off:
1. Count all enabled disciplines
2. Set each enabled discipline's weight to `1 / enabledCount`
3. Set disabled disciplines' weight to `0`
4. Trigger auto-save

Examples:
- 8 core only → 0.125 each
- 8 core + 2 supplemental → 0.1 each
- 8 core + 4 supplemental → ~0.0833 each

### Custom Weighting Mode

User sets weights manually per discipline. Toggling a supplemental discipline adds/removes it but does not auto-rebalance — user adjusts manually.

### Validation Rules (Informational Only)

| Rule | Severity | Condition |
|------|----------|-----------|
| `unscored` | info | No score and not N/A |
| `na-no-justification` | error | N/A checked, no justification |
| `scored-no-notes` | warning | Score set, notes empty |
| `low-confidence-no-notes` | warning | Confidence = Low, no notes |

Shown as warnings on the Export page. Do not gate export functionality.

---

## Exports

### 8 Export Types

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-discipline item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, embedded radar chart PNG, top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Current vs target matrix, remediation timeline |
| 4 | Scored Workbook | XLSX | Dashboard sheet + per-discipline sheets |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar + per-discipline slides |
| 6 | TBM Maturity Heatmap | XLSX | Discipline × CA color grid |
| 7 | Quick Wins Report | DOCX | Low-score, high-impact items |
| 8 | Cost Transparency Roadmap | DOCX | Phased TBM taxonomy adoption plan |

### Export Behavior

- All exports respect supplemental enabled/disabled state — disabled disciplines omitted
- Radar chart: matplotlib Agg → PNG (6×6in, 150 DPI), one axis per enabled discipline
- Filenames: `D-XX_Name_YYYY-MM-DD_HHMMSS.ext`
- Template fallback: use `templates/<name>-template.<ext>` if present, otherwise auto-generate
- "Export All" button generates all 8

### Export Page UI

All 8 export buttons always enabled. Validation warnings shown as an informational panel above buttons. No gating.

---

## Dashboard

- Radar chart (Recharts `RadarChart`) — one axis per enabled discipline, scale 0–4
- Bar chart (Recharts `BarChart`) — discipline scores with maturity band colors
- Overall completion percentage + per-discipline progress rings
- Composite score with maturity band label and color
- Top gaps list
- Only enabled disciplines appear in charts

---

## Framework Fixes (Pre-Implementation)

Two fixes to the existing `framework/assessment-framework.json`. These are **blocking prerequisites** — must be completed at the start of Chunk 2 before any models or types are written, since all routing and scoring depends on correct IDs.

1. **Rename abbreviated CA IDs** — all capability area IDs must use the full discipline ID as prefix (e.g., `budget-process` → `budget-forecasting-process`). Note: `cost-transparency` CAs already use the full prefix and should not be changed. The remaining 11 disciplines need their CA IDs updated.
2. **Expand item coverage** — target ~250-280 core items (from 200) and ~70-80 supplemental items (from 51). Add items with the same federal/government context quality as existing content.

---

## Build System

```bash
python3 build.py --dev        # FastAPI (8751) + Vite (5173) dev servers
python3 build.py --frontend   # npm build → backend/static/
python3 build.py              # PyInstaller standalone executable
python3 build.py --dist       # Build + ZIP distribution
```

### Distribution ZIP

```
TBM-Assessment/
├── assessment-tool           # Executable
├── README.txt                # End-user guide
├── framework/                # Read-only framework JSON
├── templates/                # Optional export templates
└── exports/                  # Empty (generated at runtime)
```

### GitHub Actions (Last Step)

CI (lint + type-check) and Release (macOS ARM + Windows builds, draft GitHub release) workflows added as the very last implementation step.

---

## Branding

- Dark mode throughout — page background `#0A0A0B`
- Primary accent: `#1BA1E2` (Peraton Cyan)
- Logo: `2025_Peraton_Logo_2000x541px_White_White.png` — sidebar top-left ~160px, loading screen ~300px
- Font: `"Segoe UI", -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif`
- All design tokens from `/Users/john/Dev/Assessments/Design-guide.md`

---

## Implementation Order

Build in 8 sequential chunks, each fully functional before the next:

1. **Project Scaffolding** — git, dependencies, FastAPI skeleton, Vite+React+TS+Tailwind, `build.py --dev`
2. **Data Model & Framework** — **First:** fix framework JSON (rename abbreviated CA IDs + expand items to target counts). **Then:** Pydantic models, data_manager (with supplemental `enabled=False` initialization), types.ts, API endpoints
3. **State Management & Core Layout** — store.tsx, api.ts, App.tsx, Sidebar.tsx (with supplemental section), ClientInfo, basic Dashboard
4. **Assessment Scoring UI** — scoring.ts, AssessmentItemCard, ScoringWidget, ConfidenceWidget, DisciplineSummary, CapabilityArea, Breadcrumb
5. **Dashboard & Charts** — Radar chart, bar chart, progress summary, StatsFooter
6. **Supplemental Discipline Toggles** — Settings toggles, sidebar toggles, weight rebalancing, chart/scoring updates
7. **Exports** — export_engine.py (all 8 types), radar chart PNG, Export page with validation warnings
8. **Polish & Packaging** — CommandPalette, OnboardingTooltip, Settings, Help, PyInstaller specs, build.py --dist, README.txt, GitHub Actions CI + Release
