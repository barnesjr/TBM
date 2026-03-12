# Technology Business Management Assessment Tool — Implementation Prompt

> **Purpose:** Implementation prompt for building the TBM Assessment Tool in Claude Code.

---

## 1. Branding & Design

All assessment tools follow the shared Peraton design system.

- **Design guide:** `/Users/john/Dev/Assessments/Design-guide.md`
- **Logo:** `/Users/john/Dev/Assessments/2025_Peraton_Logo_2000x541px_White_White.png`
- **Theme:** Dark mode — page background `#0A0A0B`, surfaces `#131212`/`#1C1C1E`/`#262626`/`#333333`
- **Primary accent:** `#1BA1E2` (Peraton Cyan)
- **Text:** White `#FFFFFF` primary, Light Gray `#D0D0D0` secondary
- **Font stack:** `"Segoe UI", -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif`
- **Logo placement:** Sidebar top-left, ~160px wide on dark surface; loading screen centered ~300px wide

---

## 2. Tech Stack (Fixed)

All assessment tools use this exact stack. Do not substitute.

### Backend
| Package | Purpose |
|---------|---------|
| Python 3 | Runtime |
| FastAPI | API framework |
| Uvicorn | ASGI server |
| Pydantic v2 | Data models & validation |
| openpyxl | Excel (.xlsx) export |
| docxtpl | Word (.docx) export (template-based, wraps python-docx) |
| python-pptx | PowerPoint (.pptx) export |
| matplotlib (Agg backend) | Radar chart PNG generation |
| PyInstaller | Standalone executable packaging |

### Frontend
| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript 5.9+ | Type safety |
| Vite 7 | Build tool + dev server |
| Tailwind CSS 4 | Utility-first styling |
| Recharts | Interactive charts (RadarChart, BarChart) |
| Lucide React | Icon library |
| React Router 7 | Client-side routing |

### Python virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 3. Domain Configuration

### Identity
```
TOOL_NAME              = "Technology Business Management Assessment Tool"
TOOL_SLUG              = "tbm-assessment"
FRAMEWORK_ALIGNMENT    = "TBM Council Framework / OMB M-17-22"
SIDEBAR_STORAGE_KEY    = "tbm-sidebar"
DEFAULT_PORT           = 8751  # auto-scans 8751-8760
```

### Hierarchy Model

This tool uses a **flat (2-level) hierarchy** with **supplemental disciplines**:

```
Discipline (scored + weighted)
  └── Capability Area
       └── Assessment Item
```

#### Core Disciplines (always enabled)
```json
[
  {"id": "cost-transparency",       "name": "IT Cost Transparency",         "weight": 0.125},
  {"id": "budget-forecasting",      "name": "Budget & Forecasting",         "weight": 0.125},
  {"id": "benchmarking",            "name": "Benchmarking & Performance",   "weight": 0.125},
  {"id": "service-portfolio",       "name": "Service Portfolio Management", "weight": 0.125},
  {"id": "demand-management",       "name": "Demand Management",            "weight": 0.125},
  {"id": "investment-prioritization","name": "Investment Prioritization",   "weight": 0.125},
  {"id": "vendor-contract",         "name": "Vendor & Contract Management", "weight": 0.125},
  {"id": "asset-management",        "name": "Technology Asset Management",  "weight": 0.125}
]
```

#### Supplemental Disciplines (individually toggleable in Settings)

When a supplemental discipline is toggled on, all discipline weights (core + enabled supplemental) auto-rebalance to equal weight. These are visually grouped under a "Supplemental Disciplines" header in the sidebar and Settings page.

```json
[
  {"id": "federal-compliance",    "name": "Federal Compliance & Reporting",       "supplemental": true},
  {"id": "shared-services",      "name": "Shared Services & Consolidation",      "supplemental": true},
  {"id": "cloud-modernization",  "name": "Cloud & Modernization Investment",     "supplemental": true},
  {"id": "cybersecurity-investment", "name": "Cybersecurity Investment Management", "supplemental": true}
]
```

### Scoring
```
SCORE_SCALE            = "1-4"
SCORE_LABELS           = {1: "Ad Hoc", 2: "Foundational", 3: "Managed", 4: "Optimized"}
SCORE_COLORS           = {1: "#ef4444", 2: "#f97316", 3: "#84cc16", 4: "#22c55e"}
RUBRIC_KEYS            = ["ad_hoc", "foundational", "managed", "optimized"]
```

### Maturity Bands
```json
[
  {"min": 1.0,  "max": 1.75, "label": "Ad Hoc",        "color": "#ef4444"},
  {"min": 1.75, "max": 2.5,  "label": "Foundational",  "color": "#f97316"},
  {"min": 2.5,  "max": 3.25, "label": "Managed",       "color": "#84cc16"},
  {"min": 3.25, "max": 4.0,  "label": "Optimized",     "color": "#22c55e"}
]
```

### Weighting Models
```json
{
  "balanced": {
    "label": "Balanced",
    "weights": "equal weight across all enabled disciplines (auto-calculated)"
  },
  "custom": {
    "label": "Custom",
    "weights": "user-defined per-discipline weights"
  }
}
```
```
DEFAULT_WEIGHTING      = "balanced"
DEFAULT_TARGET_SCORE   = 3.0
```

### Exports & Distribution
```
EXPORT_TYPES           = ["findings", "executive-summary", "gap-analysis", "workbook", "outbrief", "heatmap", "quick-wins", "cost-transparency-roadmap"]
DIST_FOLDER_NAME       = "TBM-Assessment"
```

### Extension Module
```
EXTENSION_ENABLED      = false
```
> **Note:** This tool does NOT use the formal extension module pattern. Instead, 4 supplemental disciplines have individual toggles in Settings. They use the same routes, models, and scoring as core disciplines.

---

## 4. Project Structure

```
tbm-assessment/
├── backend/
│   ├── __init__.py
│   ├── main.py                        # FastAPI app — serves API + built frontend
│   ├── models.py                      # Pydantic data models
│   ├── data_manager.py                # Load/save assessment + framework JSON
│   ├── export_engine.py               # All export generators
│   └── static/                        # Vite build output (generated)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                 # Proxy /api → backend in dev
│   ├── tailwind.config.ts             # Design tokens from Design-guide.md
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Router + layout (sidebar + content)
│       ├── store.tsx                  # React Context state management
│       ├── types.ts                   # TypeScript interfaces + constants
│       ├── api.ts                     # Fetch client for /api/*
│       ├── scoring.ts                 # Score calculations
│       ├── validation.ts              # Assessment validation rules
│       ├── hooks/
│       │   └── useNextUnscored.ts     # Cmd+Right jump-to-next-unscored logic
│       ├── components/
│       │   ├── Sidebar.tsx            # Collapsible nav tree with progress rings
│       │   ├── AssessmentItemCard.tsx  # Item card with scoring + notes
│       │   ├── ScoringWidget.tsx      # 1-4 radio buttons + N/A toggle
│       │   ├── ConfidenceWidget.tsx   # High/Medium/Low selector
│       │   ├── Breadcrumb.tsx         # Path breadcrumbs
│       │   ├── StatsFooter.tsx        # Progress bar + save status
│       │   ├── CommandPalette.tsx     # Cmd+K quick navigation
│       │   └── OnboardingTooltip.tsx  # First-time hints
│       └── pages/
│           ├── ClientInfo.tsx         # Client name, industry, date, assessor
│           ├── Dashboard.tsx          # Composite score, radar chart, progress
│           ├── DisciplineSummary.tsx   # Per-discipline overview with CA scores
│           ├── CapabilityArea.tsx     # Item-level scoring (main work page)
│           ├── Export.tsx             # Export deliverables UI
│           ├── Settings.tsx           # Weighting model, target scores, supplemental toggles
│           └── Help.tsx              # Keyboard shortcuts, documentation
├── framework/
│   └── assessment-framework.json      # Read-only framework definition
├── templates/                         # (Optional) Word/Excel/PowerPoint templates
├── exports/                           # Generated deliverables (created at runtime)
├── build.py                           # Build orchestration script
├── assessment-tool-macos.spec         # PyInstaller spec — macOS
├── assessment-tool-windows.spec       # PyInstaller spec — Windows
├── requirements.txt                   # Python dependencies
├── data.json                          # Persistent assessment data (auto-created)
├── data.json.bak                      # Backup (auto-created on save)
├── README.txt                         # End-user documentation
└── .gitignore
```

---

## 5. Data Model

### Backend — Pydantic Models (`backend/models.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional

class EvidenceReference(BaseModel):
    document: str = ""
    section: str = ""
    date: str = ""

class AssessmentItem(BaseModel):
    id: str
    text: str
    score: Optional[int] = Field(None, ge=1, le=4)
    na: bool = False
    na_justification: Optional[str] = None
    confidence: Optional[str] = None  # "High" | "Medium" | "Low"
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)

class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)

class Discipline(BaseModel):
    id: str
    name: str
    weight: float
    supplemental: bool = False      # True for the 4 toggleable disciplines
    enabled: bool = True            # Supplemental disciplines can be toggled off
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""

class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = ""

class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"
    discipline_weights: dict[str, float] = Field(default_factory=dict)
    custom_weights: Optional[dict[str, float]] = None

class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    disciplines: list[Discipline] = Field(default_factory=list)
    target_scores: dict[str, float] = Field(default_factory=dict)
```

### Frontend — TypeScript Interfaces (`frontend/src/types.ts`)

```typescript
// Score constants
export const SCORE_LABELS: Record<number, string> = {1: "Ad Hoc", 2: "Foundational", 3: "Managed", 4: "Optimized"};
export const SCORE_COLORS: Record<number, string> = {1: "#ef4444", 2: "#f97316", 3: "#84cc16", 4: "#22c55e"};
export const MATURITY_BANDS = [
  {min: 1.0, max: 1.75, label: "Ad Hoc",       color: "#ef4444"},
  {min: 1.75, max: 2.5,  label: "Foundational", color: "#f97316"},
  {min: 2.5,  max: 3.25, label: "Managed",      color: "#84cc16"},
  {min: 3.25, max: 4.0,  label: "Optimized",    color: "#22c55e"},
];
export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  balanced: { label: "Balanced", weights: {} },  // Auto-calculated equal weights
  custom:   { label: "Custom",   weights: {} },  // User-defined
};

// Utility function — maps a numeric score to its maturity band
export function getMaturityBand(score: number): { label: string; color: string } { ... }

// Assessment interfaces — mirror backend models
export interface EvidenceReference { document: string; section: string; date: string; }
export interface AssessmentItem { id: string; text: string; score: number | null; na: boolean; na_justification: string | null; confidence: string | null; notes: string; evidence_references: EvidenceReference[]; attachments: string[]; }
export interface CapabilityArea { id: string; name: string; items: AssessmentItem[]; }
export interface Discipline { id: string; name: string; weight: number; supplemental: boolean; enabled: boolean; capability_areas: CapabilityArea[]; }

// Framework read-only interfaces
export interface FrameworkItem { id: string; text: string; rubric: Record<string, string>; }
// rubric keys = ["ad_hoc", "foundational", "managed", "optimized"]
export interface FrameworkCapabilityArea { id: string; name: string; items: FrameworkItem[]; }
export interface FrameworkDiscipline { id: string; name: string; weight: number; supplemental: boolean; capability_areas: FrameworkCapabilityArea[]; }

export interface ClientInfo { name: string; industry: string; assessment_date: string; assessor: string; }
export interface AssessmentMetadata { framework_version: string; tool_version: string; last_modified: string; }
```

---

## 6. API Routes

All tools expose exactly these endpoints:

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/assessment` | — | Full `AssessmentData` JSON |
| `PUT` | `/api/assessment` | `AssessmentData` JSON | `{"status": "saved"}` |
| `GET` | `/api/framework` | — | Framework JSON (read-only) |
| `POST` | `/api/export/{type}` | — | `{"filenames": ["path1", ...]}` |

### Implementation Details (`backend/main.py`)

- **Port discovery:** Try `8751` through `8760`, use first available; log port diagnostics (`lsof`/`netstat`) if all ports busy
- **Auto-launch browser:** Call `webbrowser.open(url)` after server starts
- **Static files:** Serve built frontend from `backend/static/`
- **SPA fallback:** All non-`/api/*` GET requests serve `index.html`
- **No CORS needed:** Vite dev server proxies `/api` requests, so no CORS middleware required
- **Atomic save:** Write to temp file, then `os.replace()` to swap into `data.json`; write `data.json.bak` before overwriting
- **Load behavior:** Try `data.json` → fall back to `data.json.bak` → create fresh from framework
- **Export types:** `["findings", "executive-summary", "gap-analysis", "workbook", "outbrief", "heatmap", "quick-wins", "cost-transparency-roadmap"]` + `"all"`
- **Error codes:** 400 invalid export type, 404 framework missing, 500 server error

---

## 7. Pages & Routing

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ClientInfoPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />

    {/* All disciplines (core + supplemental) use the same routes */}
    <Route path="/discipline/:entityId" element={<DisciplineSummary />} />
    <Route path="/discipline/:entityId/:areaId" element={<CapabilityAreaPage />} />

    {/* Standard pages */}
    <Route path="/export" element={<ExportPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/help" element={<HelpPage />} />
  </Routes>
</BrowserRouter>
```

### Global Keyboard Shortcuts
- `Cmd/Ctrl+K` — Toggle Command Palette
- `Cmd/Ctrl+Right` — Jump to next unscored item

### CapabilityArea Page Keyboard Shortcuts
- `1`-`4` — Set score on focused item
- `H`/`M`/`L` — Set confidence (High/Medium/Low)
- `N` — Toggle N/A
- `Arrow Up/Down` — Navigate between items

---

## 8. Sidebar Structure

### Layout
```
[Logo ~160px wide]
──────────────────
Client Info          (link → /)
Dashboard            (link → /dashboard)
──────────────────

CORE DISCIPLINES

IT Cost Transparency                    [score badge] [progress ring] [chevron]
  └── (capability areas expand on click)
Budget & Forecasting                    [score] [ring] [chevron]
  └── ...
Benchmarking & Performance              [score] [ring] [chevron]
Service Portfolio Management            [score] [ring] [chevron]
Demand Management                       [score] [ring] [chevron]
Investment Prioritization               [score] [ring] [chevron]
Vendor & Contract Management            [score] [ring] [chevron]
Technology Asset Management             [score] [ring] [chevron]

──────────────────
SUPPLEMENTAL DISCIPLINES

Federal Compliance & Reporting          [toggle] [score] [ring]
Shared Services & Consolidation         [toggle] [score] [ring]
Cloud & Modernization Investment        [toggle] [score] [ring]
Cybersecurity Investment Management     [toggle] [score] [ring]

(disabled disciplines are grayed out, score/ring hidden)
──────────────────

Export               (link → /export)
Settings             (link → /settings)
Help                 (link → /help)
```

### Behavior
- **Collapsible:** Toggle between 56px icon-only and full width
- **Resizable:** Drag right edge (min: `180px`, max: `480px`, default: `350px`)
- **Persist state:** `localStorage` key `tbm-sidebar`
- **Progress rings:** SVG circle showing % scored per discipline
- **Score badges:** Rounded average score, color-coded by score colors
- **Chevron expand:** Click to show/hide capability areas in tree
- **Supplemental toggles:** Individual on/off switches per supplemental discipline; when toggled off, discipline is grayed out and its items are excluded from scoring

---

## 9. Export Deliverables

### Core Exports

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-discipline item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, radar chart (embedded PNG), top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Gap matrix table (current vs target), remediation timeline |
| 4 | Scored Assessment Workbook | XLSX | Multi-sheet: Dashboard + per-discipline sheets with all items |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar chart + per-discipline slides |

### Domain-Specific Exports

| # | Name | Format | Content |
|---|------|--------|---------|
| 6 | TBM Maturity Heatmap | XLSX | Discipline × Capability Area color grid showing maturity at a glance |
| 7 | Quick Wins Report | DOCX | Low-score, high-impact items for easy early wins |
| 8 | Cost Transparency Roadmap | DOCX | Phased plan for TBM taxonomy adoption and cost allocation maturity |

### Export Implementation Details
- **Filenames:** `D-XX_Name_YYYY-MM-DD_HHMMSS.ext` (timestamped)
- **Radar chart:** matplotlib Agg backend → `exports/radar_chart.png` (6×6 in, 150 DPI)
- **Template support:** If `templates/<name>-template.<ext>` exists, use it; otherwise auto-generate
- **"Export All" button:** Generates all exports; skips disabled supplemental discipline content
- **Supplemental handling:** Exports include enabled supplemental disciplines alongside core disciplines

---

## 10. Key Behaviors

### Auto-Save
- **Debounce:** 300ms after any data change
- **Mechanism:** `PUT /api/assessment` with full `AssessmentData`
- **Backup:** Server writes `data.json.bak` before overwriting `data.json`
- **Status indicator:** StatsFooter shows "Saving..." / "Saved" / "Error"

### Scoring Engine (`frontend/src/scoring.ts`)
```typescript
averageScore(items: AssessmentItem[]): number      // Mean of scored items (exclude N/A)
capabilityAreaScore(ca: CapabilityArea): number     // Average of CA items
disciplineScore(discipline: Discipline): number     // Average of all items in discipline
weightedCompositeScore(data: AssessmentData): number // Σ(disciplineScore × weight) / Σ(weights)
                                                     // Only includes enabled disciplines
                                                     // "balanced" model: auto-equal weights
                                                     // "custom" model: user-defined weights
overallCompletion(data: AssessmentData): {scored: number, total: number}
                                                     // Only counts enabled disciplines
```

### Weight Auto-Rebalancing
When a supplemental discipline is toggled on/off and the weighting model is "balanced":
- Recalculate equal weights across all enabled disciplines
- e.g., 8 core = 0.125 each; 8 core + 2 supplemental = 0.1 each

### Command Palette (`Cmd+K`)
- Fuzzy search across all disciplines + capability areas
- Navigate to any page instantly
- Show score + completion status in results
- Only shows enabled disciplines (supplemental toggles respected)

### Validation (`frontend/src/validation.ts`)
| Rule | Severity | Condition |
|------|----------|-----------|
| `unscored` | info | Item has no score and is not N/A |
| `na-no-justification` | error | N/A checked but no justification |
| `scored-no-notes` | warning | Score assigned but notes empty |
| `low-confidence-no-notes` | warning | Confidence = "Low" with no notes |

### Charts (Dashboard)
- **Radar chart:** Recharts `RadarChart` — one axis per enabled discipline, scale 0–4
- **Bar chart:** Recharts `BarChart` — discipline scores with maturity band colors
- **Progress:** Overall completion percentage + per-discipline progress rings
- **Note:** Only enabled disciplines appear in charts

### State Management (`frontend/src/store.tsx`)
- React Context with `useReducer` pattern
- `StoreProvider` wraps entire app
- `useStore()` hook returns `{data, framework, loading, saveStatus, updateData}`
- `updateData()` uses `structuredClone` for immutable updates

---

## 11. Framework Content

The framework JSON defines all assessment items and rubrics. Place at `framework/assessment-framework.json`.

### Structure

```json
{
  "version": "1.0",
  "framework_alignment": "TBM Council Framework / OMB M-17-22",

  "disciplines": [
    {
      "id": "cost-transparency",
      "name": "IT Cost Transparency",
      "weight": 0.125,
      "supplemental": false,
      "capability_areas": [
        {
          "id": "cost-transparency-ca1",
          "name": "Cost Pool Definition & Allocation",
          "items": [
            {
              "id": "cost-transparency-1-1",
              "text": "Assessment item question text",
              "rubric": {
                "ad_hoc": "Level 1 description...",
                "foundational": "Level 2 description...",
                "managed": "Level 3 description...",
                "optimized": "Level 4 description..."
              }
            }
          ]
        }
      ]
    },
    {
      "id": "federal-compliance",
      "name": "Federal Compliance & Reporting",
      "weight": 0.0,
      "supplemental": true,
      "capability_areas": [...]
    }
  ],

  "weighting_models": {
    "balanced": {
      "label": "Balanced",
      "description": "Equal weight across all enabled disciplines (auto-calculated)"
    },
    "custom": {
      "label": "Custom",
      "description": "User-defined per-discipline weights"
    }
  }
}
```

### Content Specification

The framework should include comprehensive assessment items covering all 12 disciplines (8 core + 4 supplemental). Target counts:
- **Core disciplines:** ~200-300 items total across 8 disciplines
- **Supplemental disciplines:** ~50-100 items total across 4 disciplines
- Each item must include a 4-level rubric (ad_hoc, foundational, managed, optimized)

Items should be written for a **state and federal government** audience, referencing:
- OMB memoranda (M-17-22, M-23-18, etc.)
- FITARA scorecard requirements
- Federal IT Dashboard reporting
- TBM Council taxonomy and cost towers
- Government shared services mandates
- Cloud Smart / Data Center Optimization Initiative
- NIST Cybersecurity Framework alignment (for cybersecurity investment discipline)

---

## 12. Build & Packaging

### `build.py` Commands

```bash
python3 build.py              # Build standalone executable (PyInstaller)
python3 build.py --dev        # Run backend (FastAPI) + frontend (Vite) dev servers
python3 build.py --frontend   # Build frontend only → backend/static/
python3 build.py --dist       # Build + create distribution ZIP
```

### Development Mode (`--dev`)
- Backend: `python -m backend.main` on port `8751`
- Frontend: `npm run dev` on port `5173` with Vite proxy `/api → localhost:8751`

### Frontend Build (`--frontend`)
- Runs `npm run build` in `frontend/`
- Output copied to `backend/static/`

### PyInstaller Packaging
- Spec files: `assessment-tool-macos.spec`, `assessment-tool-windows.spec`
- Entry point: `backend/main.py`
- Bundled data: `backend/static/`, `framework/`, `templates/` (if present)
- Hidden imports: `uvicorn.logging`, `uvicorn.loops.auto`, `uvicorn.protocols.http.auto`, `uvicorn.protocols.websockets.auto`, `uvicorn.lifespan.on`
- Output: `dist/assessment-tool` (macOS) or `dist/assessment-tool.exe` (Windows)

### Distribution ZIP (`--dist`)
Creates `dist/TBM-Assessment/`:
```
TBM-Assessment/
├── assessment-tool           # Executable
├── README.txt                # End-user guide
├── framework/                # Read-only framework JSON
├── templates/                # Optional export templates
└── exports/                  # Empty (generated at runtime)
```
Zipped to `dist/TBM-Assessment.zip`.

### GitHub Actions (`.github/workflows/`)

#### CI (`.github/workflows/ci.yml`)
Lint + type-check on push and pull requests.

#### Release (`.github/workflows/release.yml`)

Builds macOS (ARM) + Windows executables and creates a draft GitHub release with both ZIPs.

**Critical notes:**
- **GitHub macOS runners are ARM-only** (`macos-latest` = Apple Silicon). The macOS PyInstaller spec must use `target_arch='arm64'`. There are no x86 macOS runners available.
- **The `templates/` directory is optional and may not exist in the repo.** PyInstaller spec files must conditionally include it or the build will fail with `ERROR: Unable to find '…/templates'`. Use this pattern in both spec files:

```python
import os

datas = [
    ('backend/static', 'static'),
    ('framework', 'framework'),
]
if os.path.isdir('templates'):
    datas.append(('templates', 'templates'))

a = Analysis(
    ['backend/main.py'],
    datas=datas,
    ...
)
```

**Workflow structure:**

```yaml
name: Build & Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag (e.g. v1.0.0)'
        required: true

permissions:
  contents: write

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: macos-latest        # ARM only
            platform: macos
            artifact: TBM-Assessment-macos
          - os: windows-latest
            platform: windows
            artifact: TBM-Assessment-windows

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt pyinstaller

      - name: Install and build frontend
        working-directory: frontend
        run: npm ci && npm run build

      - name: Build executable (macOS)
        if: matrix.platform == 'macos'
        run: python -m PyInstaller --distpath dist --workpath build_temp assessment-tool-macos.spec

      - name: Build executable (Windows)
        if: matrix.platform == 'windows'
        run: python -m PyInstaller --distpath dist --workpath build_temp assessment-tool-windows.spec

      - name: Assemble distribution (macOS)
        if: matrix.platform == 'macos'
        run: |
          mkdir -p dist/${{ matrix.artifact }}
          cp dist/assessment-tool dist/${{ matrix.artifact }}/
          chmod +x dist/${{ matrix.artifact }}/assessment-tool
          cp -r framework dist/${{ matrix.artifact }}/
          if [ -d templates ]; then cp -r templates dist/${{ matrix.artifact }}/; else mkdir dist/${{ matrix.artifact }}/templates; fi
          if [ -f README.txt ]; then cp README.txt dist/${{ matrix.artifact }}/; fi
          mkdir -p dist/${{ matrix.artifact }}/exports
          cd dist && zip -r ${{ matrix.artifact }}.zip ${{ matrix.artifact }}

      - name: Assemble distribution (Windows)
        if: matrix.platform == 'windows'
        shell: pwsh
        run: |
          New-Item -ItemType Directory -Force -Path "dist/${{ matrix.artifact }}"
          Copy-Item "dist/assessment-tool.exe" "dist/${{ matrix.artifact }}/"
          Copy-Item -Recurse "framework" "dist/${{ matrix.artifact }}/framework"
          if (Test-Path "templates") { Copy-Item -Recurse "templates" "dist/${{ matrix.artifact }}/templates" } else { New-Item -ItemType Directory -Force -Path "dist/${{ matrix.artifact }}/templates" }
          if (Test-Path "README.txt") { Copy-Item "README.txt" "dist/${{ matrix.artifact }}/" }
          New-Item -ItemType Directory -Force -Path "dist/${{ matrix.artifact }}/exports"
          Compress-Archive -Path "dist/${{ matrix.artifact }}" -DestinationPath "dist/${{ matrix.artifact }}.zip"

      - uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.artifact }}
          path: dist/${{ matrix.artifact }}.zip

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: artifacts
      - name: Determine tag
        id: tag
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "version=${{ github.event.inputs.tag }}" >> "$GITHUB_OUTPUT"
          else
            echo "version=${GITHUB_REF#refs/tags/}" >> "$GITHUB_OUTPUT"
          fi
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.tag.outputs.version }}
          name: Technology Business Management Assessment Tool ${{ steps.tag.outputs.version }}
          draft: true
          generate_release_notes: true
          files: |
            artifacts/TBM-Assessment-macos/TBM-Assessment-macos.zip
            artifacts/TBM-Assessment-windows/TBM-Assessment-windows.zip
```

---

## 13. Implementation Order

Build in 8 sequential chunks. Each chunk should be fully functional before moving to the next.

### Chunk 1 — Project Scaffolding
- Initialize git repo, `.gitignore`, `requirements.txt`, `package.json`
- Backend: `main.py` with FastAPI skeleton, health check endpoint
- Frontend: Vite + React + TypeScript + Tailwind setup
- `build.py` with `--dev` and `--frontend` modes
- Verify: `python3 build.py --dev` serves empty app

### Chunk 2 — Data Model & Framework
- Backend: `models.py` with all Pydantic models (including `supplemental` and `enabled` fields)
- Backend: `data_manager.py` (load/save/backup logic)
- Frontend: `types.ts` with all interfaces + constants
- Framework: `assessment-framework.json` with complete content (all 12 disciplines)
- API: `GET/PUT /api/assessment`, `GET /api/framework`
- Verify: API returns framework and saves/loads assessment

### Chunk 3 — State Management & Core Layout
- Frontend: `store.tsx` (Context + auto-save)
- Frontend: `api.ts` (fetch client)
- Frontend: `App.tsx` (router + sidebar + content layout)
- Frontend: `Sidebar.tsx` (collapsible, resizable, persistent, with supplemental discipline section)
- Pages: `ClientInfo.tsx`, `Dashboard.tsx` (basic)
- Verify: Navigate between pages, data persists

### Chunk 4 — Assessment Scoring UI
- Frontend: `scoring.ts` (all calculation functions including weight auto-rebalancing)
- Components: `AssessmentItemCard.tsx`, `ScoringWidget.tsx`, `ConfidenceWidget.tsx`
- Pages: `DisciplineSummary.tsx`, `CapabilityArea.tsx` (keyboard shortcuts)
- Component: `Breadcrumb.tsx`
- Verify: Score items, see scores update in sidebar + dashboard

### Chunk 5 — Dashboard & Charts
- Dashboard: Radar chart (Recharts), bar chart, progress summary
- Dashboard: Maturity band display, top gaps list
- Component: `StatsFooter.tsx` (global progress + save status)
- Charts only show enabled disciplines
- Verify: Dashboard reflects scoring accurately

### Chunk 6 — Supplemental Discipline Toggles
- Settings page: Individual toggle switches for each supplemental discipline
- Sidebar: Supplemental disciplines section with per-discipline toggles
- Scoring: Weight auto-rebalancing when disciplines toggled on/off
- Dashboard/Charts: Update to reflect only enabled disciplines
- Verify: Toggle disciplines, see scores and charts update correctly

### Chunk 7 — Exports
- Backend: `export_engine.py` — all export generators (8 types)
- Radar chart PNG generation (matplotlib)
- API: `POST /api/export/{type}`
- Frontend: `Export.tsx` page with buttons + validation
- Exports respect supplemental discipline enabled/disabled state
- Verify: Each export generates a real, correct file

### Chunk 8 — Polish & Packaging
- Components: `CommandPalette.tsx`, `OnboardingTooltip.tsx`
- Frontend: `validation.ts` + validation warnings in Export page
- Pages: `Settings.tsx` (weighting + supplemental toggles), `Help.tsx`
- PyInstaller specs + `build.py --dist`
- `README.txt` for end users
- GitHub Actions CI + Release workflows
- Verify: Standalone executable runs, all features work

---

## 14. Reference Implementations

Use these existing tools as canonical examples. When in doubt, match their patterns exactly.

| Tool | Path | Hierarchy | Extension |
|------|------|-----------|-----------|
| Zero-Trust Assessment | `/Users/john/Dev/Assessments/Zero-Trust/` | Flat (Pillars + Cross-Cutting) | Classified Extension |
| ITSM Maturity Assessment | `/Users/john/Dev/Assessments/ITSM-ITIL/` | Grouped (Domain Groups → Domains) | ITIL 4 Module |

### Key Patterns to Replicate
- **Auto-save with debounce** — 300ms, immutable state updates via `structuredClone`
- **Sidebar resize + collapse** — drag handle, localStorage persistence, icon-only mode
- **Progress rings** — SVG circles in sidebar showing % complete per discipline
- **Score color coding** — consistent colors across sidebar badges, charts, exports
- **Template fallback exports** — check for template file, auto-generate if missing
- **Port scanning** — try default port, increment up to +9 if occupied
- **SPA routing** — FastAPI serves `index.html` for all non-API routes
- **Backup on save** — always write `.bak` before overwriting main data file
- **Dark theme** — all colors from `Design-guide.md`, no light mode

### New Pattern: Supplemental Discipline Toggles
This tool introduces a pattern not in the reference implementations:
- **Individual toggles** for supplemental disciplines (not an all-or-nothing extension module)
- **Auto-rebalancing weights** when disciplines are toggled on/off in balanced mode
- **Visual grouping** in sidebar under "Supplemental Disciplines" header
- **Scoring exclusion** — disabled disciplines excluded from composite score and completion counts
- **Export handling** — disabled disciplines omitted from all exports
