# Assessment Tool — Meta Prompt Template

> **Purpose:** Reusable prompt template for building Peraton assessment tools.
> Copy this file, replace all `{{PLACEHOLDER}}` values with your domain-specific content, and use it as the implementation prompt for Claude Code.

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

Replace every `{{PLACEHOLDER}}` below with your assessment domain's values.

### Identity
```
{{TOOL_NAME}}              # e.g., "ITSM Maturity Assessment Tool"
{{TOOL_SLUG}}              # e.g., "itsm-assessment" (used in filenames, dist folder)
{{FRAMEWORK_ALIGNMENT}}    # e.g., "ITIL v3/v4", "CISA ZTMM v2.0"
{{SIDEBAR_STORAGE_KEY}}    # e.g., "itsm-sidebar", "zt-sidebar"
{{DEFAULT_PORT}}           # e.g., 8741 (auto-scans 8741-8750)
```

### Hierarchy Model

Assessment tools support two hierarchy styles. Choose one:

**Option A — Grouped (3-level nesting):**
```
{{TOP_LEVEL_LABEL}}        # e.g., "Domain Group" (container of domains)
  └── {{MID_LEVEL_LABEL}}  # e.g., "Domain" (scored + weighted)
       └── Capability Area
            └── Assessment Item
```

**Option B — Flat (2-level nesting):**
```
{{TOP_LEVEL_LABEL}}        # e.g., "Pillar" (scored + weighted)
  └── Capability Area
       └── Assessment Item
```

```
{{HIERARCHY_STYLE}}        # "grouped" or "flat"
{{TOP_LEVEL_ENTITIES}}     # JSON array, e.g.:
                           # Grouped: [{"id":"service-operations","name":"Service Operations","children":["incident","problem","service-desk"]}]
                           # Flat: [{"id":"identity","name":"Identity","weight":0.25}]
{{MID_LEVEL_ENTITIES}}     # (Grouped only) JSON array of domains with weights
                           # e.g., [{"id":"incident","name":"Incident Management","weight":0.083}]
```

### Scoring
```
{{SCORE_SCALE}}            # e.g., "1-4"
{{SCORE_LABELS}}           # e.g., {1:"Initial", 2:"Developing", 3:"Established", 4:"Optimizing"}
                           # or    {1:"Traditional", 2:"Initial", 3:"Advanced", 4:"Optimal"}
{{SCORE_COLORS}}           # e.g., {1:"#ef4444", 2:"#f97316", 3:"#84cc16", 4:"#22c55e"}
{{RUBRIC_KEYS}}            # Lowercase keys matching score labels
                           # e.g., ["initial","developing","established","optimizing"]
                           # or    ["traditional","initial","advanced","optimal"]
```

### Maturity Bands
```
{{MATURITY_BANDS}}         # Array of {min, max, label, color}, e.g.:
                           # [
                           #   {min:1.0, max:1.5, label:"Reactive",    color:"#ef4444"},
                           #   {min:1.5, max:2.0, label:"Emerging",    color:"#f97316"},
                           #   {min:2.0, max:2.5, label:"Developing",  color:"#eab308"},
                           #   {min:2.5, max:3.0, label:"Established", color:"#84cc16"},
                           #   {min:3.0, max:3.5, label:"Managed",     color:"#22c55e"},
                           #   {min:3.5, max:4.0, label:"Optimizing",  color:"#15803d"}
                           # ]
```

### Weighting Models
```
{{WEIGHTING_MODELS}}       # Named presets, e.g.:
                           # {
                           #   "balanced":  {label:"Balanced", weights:{...equal...}},
                           #   "ops_heavy": {label:"Operations-Heavy", weights:{...}},
                           #   ...
                           # }
{{DEFAULT_WEIGHTING}}      # Key of default model, e.g., "balanced"
{{DEFAULT_TARGET_SCORE}}   # Default per-domain target, e.g., 3.0
```

### Exports & Distribution
```
{{EXPORT_TYPES}}           # Array of valid export type strings for POST /api/export/{type}
                           # e.g., ["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","itil4-alignment"]
{{DIST_FOLDER_NAME}}       # Distribution folder name, e.g., "ITSMAssessment", "ZeroTrustAssessment"
```

### Optional Extension Module
```
{{EXTENSION_ENABLED}}      # true/false — does this tool have an optional module?
{{EXTENSION_NAME}}         # e.g., "ITIL 4 Module", "Classified Extension"
{{EXTENSION_LABEL}}        # Short sidebar label, e.g., "ITIL 4", "Classified"
{{EXTENSION_TOGGLE}}       # How it's enabled: "sidebar switch" or "settings toggle"
{{EXTENSION_ENTITIES}}     # JSON array of sections/pillars in the extension
                           # e.g., [{"id":"guiding-principles","name":"Guiding Principles"}]
```

---

## 4. Project Structure

```
{{TOOL_SLUG}}/
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
│           ├── {{SUMMARY_PAGE}}.tsx   # Top-level entity summary (pillar or domain)
│           ├── CapabilityArea.tsx     # Item-level scoring (main work page)
│           ├── {{EXTENSION_SUMMARY_PAGE}}.tsx  # (if extension) Extension overview
│           ├── {{EXTENSION_DETAIL_PAGE}}.tsx   # (if extension) Extension items
│           ├── Export.tsx             # Export deliverables UI
│           ├── Settings.tsx           # Weighting model, target scores
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
    score: Optional[int] = Field(None, ge=1, le={{SCORE_SCALE_MAX}})  # e.g., ge=1, le=4
    na: bool = False
    na_justification: Optional[str] = None
    confidence: Optional[str] = None  # "High" | "Medium" | "Low"
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)  # Optional: file attachment paths

class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)

# --- Hierarchy Option A: Grouped ---
class {{MID_LEVEL_MODEL}}(BaseModel):       # e.g., Domain
    id: str
    name: str
    weight: float
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

class {{TOP_LEVEL_MODEL}}(BaseModel):       # e.g., DomainGroup
    id: str
    name: str
    {{MID_LEVEL_FIELD}}: list[{{MID_LEVEL_MODEL}}] = Field(default_factory=list)  # e.g., domains

# --- Hierarchy Option B: Flat ---
class {{TOP_LEVEL_MODEL}}(BaseModel):       # e.g., Pillar
    id: str
    name: str
    weight: float
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

# --- Optional Extension ---
class {{EXTENSION_SECTION_MODEL}}(BaseModel):  # e.g., ITIL4Section, ClassifiedPillar
    id: str
    name: str
    capability_areas: list[CapabilityArea] = Field(default_factory=list)
    # Note: ClassifiedPillar in Zero-Trust uses `items` directly instead of capability_areas

class {{EXTENSION_MODEL}}(BaseModel):          # e.g., ITIL4Extension, ClassifiedExtension
    enabled: bool = False
    {{EXTENSION_CHILDREN_FIELD}}: list[{{EXTENSION_SECTION_MODEL}}] = Field(default_factory=list)

# --- Shared Models ---
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
    weighting_model: str = "{{DEFAULT_WEIGHTING}}"
    {{WEIGHT_FIELD}}: dict[str, float] = Field(default_factory=dict)  # e.g., domain_weights, pillar_weights
    custom_weights: Optional[dict[str, float]] = None

class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    {{TOP_LEVEL_FIELD}}: list[{{TOP_LEVEL_MODEL}}] = Field(default_factory=list)
    # Flat hierarchy may also have:
    # cross_cutting_capabilities: list[CrossCuttingCapability] = Field(default_factory=list)
    {{EXTENSION_ENABLED_FIELD}}: bool = False     # e.g., itil4_enabled, classified_enabled
    {{EXTENSION_FIELD}}: Optional[{{EXTENSION_MODEL}}] = None
    target_scores: dict[str, float] = Field(default_factory=dict)
```

### Frontend — TypeScript Interfaces (`frontend/src/types.ts`)

```typescript
// Score constants — replace with domain values
export const SCORE_LABELS: Record<number, string> = {{SCORE_LABELS}};
export const SCORE_COLORS: Record<number, string> = {{SCORE_COLORS}};
export const MATURITY_BANDS = {{MATURITY_BANDS}};
export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {{WEIGHTING_MODELS}};

// Utility function — maps a numeric score to its maturity band
export function getMaturityBand(score: number): { label: string; color: string } { ... }

// Assessment interfaces — mirror backend models
export interface EvidenceReference { document: string; section: string; date: string; }
export interface AssessmentItem { id: string; text: string; score: number | null; na: boolean; na_justification: string | null; confidence: string | null; notes: string; evidence_references: EvidenceReference[]; attachments: string[]; }
export interface CapabilityArea { id: string; name: string; items: AssessmentItem[]; }

// Hierarchy-specific interfaces (choose A or B)
// ... mirrors backend models ...

// Framework read-only interfaces
export interface FrameworkItem { id: string; text: string; rubric: Record<string, string>; }
// rubric keys = {{RUBRIC_KEYS}}
export interface FrameworkCapabilityArea { id: string; name: string; items: FrameworkItem[]; }
// ... rest mirrors framework JSON structure ...

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

- **Port discovery:** Try `{{DEFAULT_PORT}}` through `{{DEFAULT_PORT}}+9`, use first available; log port diagnostics (`lsof`/`netstat`) if all ports busy
- **Auto-launch browser:** Call `webbrowser.open(url)` after server starts
- **Static files:** Serve built frontend from `backend/static/`
- **SPA fallback:** All non-`/api/*` GET requests serve `index.html`
- **No CORS needed:** Vite dev server proxies `/api` requests, so no CORS middleware required
- **Atomic save:** Write to temp file, then `os.replace()` to swap into `data.json`; write `data.json.bak` before overwriting
- **Load behavior:** Try `data.json` → fall back to `data.json.bak` → create fresh from framework
- **Export types:** `{{EXPORT_TYPES}}` + `"all"`
- **Error codes:** 400 invalid export type, 404 framework missing, 500 server error

---

## 7. Pages & Routing

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ClientInfoPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />

    {/* --- Hierarchy Option A: Grouped --- */}
    <Route path="/{{MID_LEVEL_ROUTE}}/:entityId" element={<{{SUMMARY_PAGE}} />} />
    <Route path="/{{MID_LEVEL_ROUTE}}/:entityId/:areaId" element={<CapabilityAreaPage />} />

    {/* --- Hierarchy Option B: Flat --- */}
    <Route path="/{{TOP_LEVEL_ROUTE}}/:entityId" element={<{{SUMMARY_PAGE}} />} />
    <Route path="/{{TOP_LEVEL_ROUTE}}/:entityId/:areaId" element={<CapabilityAreaPage />} />
    {/* If cross-cutting capabilities exist: */}
    <Route path="/cross-cutting/:entityId" element={<{{SUMMARY_PAGE}} />} />
    <Route path="/cross-cutting/:entityId/:areaId" element={<CapabilityAreaPage />} />

    {/* --- Optional Extension --- */}
    <Route path="/{{EXTENSION_ROUTE}}" element={<{{EXTENSION_SUMMARY_PAGE}} />} />
    <Route path="/{{EXTENSION_ROUTE}}/:sectionId" element={<{{EXTENSION_DETAIL_PAGE}} />} />
    <Route path="/{{EXTENSION_ROUTE}}/:sectionId/:areaId" element={<{{EXTENSION_DETAIL_PAGE}} />} />

    {/* --- Standard pages --- */}
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

{{TOP_LEVEL_LABEL}} 1 NAME                    [score badge] [progress ring] [chevron]
  ├── {{MID_LEVEL_LABEL}} 1 Name              [score] [ring]
  │     (capability areas expand on click)
  ├── {{MID_LEVEL_LABEL}} 2 Name              [score] [ring]
  └── {{MID_LEVEL_LABEL}} 3 Name              [score] [ring]

{{TOP_LEVEL_LABEL}} 2 NAME
  └── ...

(repeat for all top-level entities)

──────────────────
{{EXTENSION_LABEL}}  [toggle switch]          (if extension enabled, show children)
──────────────────

Export               (link → /export)
Settings             (link → /settings)
Help                 (link → /help)
```

### Behavior
- **Collapsible:** Toggle between 56px icon-only and full width
- **Resizable:** Drag right edge (min: `180px`, max: `480px`, default: `350px`)
- **Persist state:** `localStorage` key `{{SIDEBAR_STORAGE_KEY}}`
- **Progress rings:** SVG circle showing % scored per entity
- **Score badges:** Rounded average score, color-coded by `{{SCORE_COLORS}}`
- **Chevron expand:** Click to show/hide children in tree

---

## 9. Export Deliverables

### Core Exports (all tools)

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-entity item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, radar chart (embedded PNG), top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Gap matrix table (current vs target), remediation timeline |
| 4 | Scored Assessment Workbook | XLSX | Multi-sheet: Dashboard + per-entity sheets with all items |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar chart + per-entity slides |

### Domain-Specific Exports

```
{{ADDITIONAL_EXPORTS}}     # Array of additional exports, e.g.:
                           # [
                           #   {name:"Maturity Heatmap", format:"XLSX", content:"Domain × CA color grid"},
                           #   {name:"Quick Wins Report", format:"DOCX", content:"Low-score high-impact items"},
                           #   {name:"ITIL 4 Alignment", format:"DOCX", content:"Extension module report"}
                           # ]
```

### Export Implementation Details
- **Filenames:** `D-XX_Name_YYYY-MM-DD_HHMMSS.ext` (timestamped)
- **Radar chart:** matplotlib Agg backend → `exports/radar_chart.png` (6×6 in, 150 DPI)
- **Template support:** If `templates/<name>-template.<ext>` exists, use it; otherwise auto-generate
- **"Export All" button:** Generates core exports + domain-specific (skip extension-only exports if extension disabled)

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
entityScore(entity: Entity): number                 // Average of all items in entity
weightedCompositeScore(data: AssessmentData): number // Σ(entityScore × weight) / Σ(weights)
overallCompletion(data: AssessmentData): {scored: number, total: number}
```

### Command Palette (`Cmd+K`)
- Fuzzy search across all entities + capability areas
- Navigate to any page instantly
- Show score + completion status in results

### Validation (`frontend/src/validation.ts`)
| Rule | Severity | Condition |
|------|----------|-----------|
| `unscored` | info | Item has no score and is not N/A |
| `na-no-justification` | error | N/A checked but no justification |
| `scored-no-notes` | warning | Score assigned but notes empty |
| `low-confidence-no-notes` | warning | Confidence = "Low" with no notes |

### Charts (Dashboard)
- **Radar chart:** Recharts `RadarChart` — one axis per weighted entity, scale 0–`{{SCORE_SCALE_MAX}}`
- **Bar chart:** Recharts `BarChart` — entity scores with maturity band colors
- **Progress:** Overall completion percentage + per-entity progress rings

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
  "framework_alignment": "{{FRAMEWORK_ALIGNMENT}}",

  // --- Hierarchy Option A: Grouped ---
  "{{TOP_LEVEL_FIELD}}": [
    {
      "id": "{{group-id}}",
      "name": "{{Group Name}}",
      "{{MID_LEVEL_FIELD}}": [
        {
          "id": "{{entity-id}}",
          "name": "{{Entity Name}}",
          "weight": 0.083,
          "capability_areas": [
            {
              "id": "{{entity-ca1}}",
              "name": "{{Capability Area Name}}",
              "items": [
                {
                  "id": "{{entity-1-1}}",
                  "text": "{{Assessment item question text}}",
                  "rubric": {
                    "{{RUBRIC_KEYS[0]}}": "Level 1 description...",
                    "{{RUBRIC_KEYS[1]}}": "Level 2 description...",
                    "{{RUBRIC_KEYS[2]}}": "Level 3 description...",
                    "{{RUBRIC_KEYS[3]}}": "Level 4 description..."
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],

  // --- Hierarchy Option B: Flat ---
  "pillars": [...],
  "cross_cutting_capabilities": [...],

  // --- Optional Extension ---
  "{{EXTENSION_FIELD}}": {
    "{{EXTENSION_CHILDREN_FIELD}}": [
      {
        "id": "{{section-id}}",
        "name": "{{Section Name}}",
        "capability_areas": [...]
      }
    ]
  },

  // --- Weighting models (read by frontend) ---
  "weighting_models": {
    "{{DEFAULT_WEIGHTING}}": { ... },
    ...
  }
}
```

### Content Specification

```
{{FRAMEWORK_ITEMS}}        # Full list of assessment items to include.
                           # Provide: group/entity structure, capability area names,
                           # item texts, and 4-level rubric descriptions for every item.
                           # Typical counts: 200-400 base items + 0-100 extension items.
```

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
- Backend: `python -m backend.main` on port `{{DEFAULT_PORT}}`
- Frontend: `npm run dev` on port `5173` with Vite proxy `/api → localhost:{{DEFAULT_PORT}}`

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
Creates `dist/{{DIST_FOLDER_NAME}}/`:
```
{{DIST_FOLDER_NAME}}/
├── assessment-tool           # Executable
├── README.txt                # End-user guide
├── framework/                # Read-only framework JSON
├── templates/                # Optional export templates
└── exports/                  # Empty (generated at runtime)
```
Zipped to `dist/{{DIST_FOLDER_NAME}}.zip`.

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
            artifact: {{DIST_FOLDER_NAME}}-macos
          - os: windows-latest
            platform: windows
            artifact: {{DIST_FOLDER_NAME}}-windows

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
          name: {{TOOL_NAME}} ${{ steps.tag.outputs.version }}
          draft: true
          generate_release_notes: true
          files: |
            artifacts/{{DIST_FOLDER_NAME}}-macos/{{DIST_FOLDER_NAME}}-macos.zip
            artifacts/{{DIST_FOLDER_NAME}}-windows/{{DIST_FOLDER_NAME}}-windows.zip
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
- Backend: `models.py` with all Pydantic models
- Backend: `data_manager.py` (load/save/backup logic)
- Frontend: `types.ts` with all interfaces + constants
- Framework: `assessment-framework.json` with complete content
- API: `GET/PUT /api/assessment`, `GET /api/framework`
- Verify: API returns framework and saves/loads assessment

### Chunk 3 — State Management & Core Layout
- Frontend: `store.tsx` (Context + auto-save)
- Frontend: `api.ts` (fetch client)
- Frontend: `App.tsx` (router + sidebar + content layout)
- Frontend: `Sidebar.tsx` (collapsible, resizable, persistent)
- Pages: `ClientInfo.tsx`, `Dashboard.tsx` (basic)
- Verify: Navigate between pages, data persists

### Chunk 4 — Assessment Scoring UI
- Frontend: `scoring.ts` (all calculation functions)
- Components: `AssessmentItemCard.tsx`, `ScoringWidget.tsx`, `ConfidenceWidget.tsx`
- Pages: Entity summary page, `CapabilityArea.tsx` (keyboard shortcuts)
- Component: `Breadcrumb.tsx`
- Verify: Score items, see scores update in sidebar + dashboard

### Chunk 5 — Dashboard & Charts
- Dashboard: Radar chart (Recharts), bar chart, progress summary
- Dashboard: Maturity band display, top gaps list
- Component: `StatsFooter.tsx` (global progress + save status)
- Verify: Dashboard reflects scoring accurately

### Chunk 6 — Optional Extension Module
- Backend: Extension models + framework loading
- Frontend: Extension pages (summary + detail)
- Sidebar: Extension toggle + navigation
- Scoring: Extension scores (separate from composite unless specified)
- Verify: Toggle extension, score items, see results

### Chunk 7 — Exports
- Backend: `export_engine.py` — all export generators
- Radar chart PNG generation (matplotlib)
- API: `POST /api/export/{type}`
- Frontend: `Export.tsx` page with buttons + validation
- Verify: Each export generates a real, correct file

### Chunk 8 — Polish & Packaging
- Components: `CommandPalette.tsx`, `OnboardingTooltip.tsx`
- Frontend: `validation.ts` + validation warnings in Export page
- Pages: `Settings.tsx` (weighting), `Help.tsx`
- PyInstaller specs + `build.py --dist`
- `README.txt` for end users
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
- **Progress rings** — SVG circles in sidebar showing % complete per entity
- **Score color coding** — consistent colors across sidebar badges, charts, exports
- **Template fallback exports** — check for template file, auto-generate if missing
- **Port scanning** — try default port, increment up to +9 if occupied
- **SPA routing** — FastAPI serves `index.html` for all non-API routes
- **Backup on save** — always write `.bak` before overwriting main data file
- **Dark theme** — all colors from `Design-guide.md`, no light mode

---

## Quick Start Checklist

To create a new assessment tool:

1. Copy this template
2. Fill in all `{{PLACEHOLDER}}` values for your domain
3. Write the full framework JSON content (items + rubrics)
4. Create the git repo and add as submodule to `/Users/john/Dev/Assessments/`
5. Follow the 8-chunk implementation order
6. Cross-reference the two existing tools whenever you need implementation details
