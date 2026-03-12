# TBM Assessment Tool Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained TBM maturity assessment tool as a FastAPI + React SPA, packaged as a standalone executable.

**Architecture:** Clone-and-adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/`). Flat 2-level hierarchy (Discipline → Capability Area → Item) with per-discipline supplemental toggles. 8 core + 4 supplemental disciplines, 8 export types.

**Tech Stack:** Python 3 / FastAPI / Pydantic v2 / openpyxl / docxtpl / python-pptx / matplotlib | React 19 / TypeScript 5.9+ / Vite 7 / Tailwind CSS 4 / Recharts / Lucide React / React Router 7

**Spec:** `docs/superpowers/specs/2026-03-11-tbm-assessment-tool-design.md`

**Reference:** `/Users/john/Dev/Assessments/ITSM-ITIL/` (primary), `/Users/john/Dev/Assessments/Zero-Trust/` (secondary)

**Design guide:** `/Users/john/Dev/Assessments/Design-guide.md`

**Logo:** `/Users/john/Dev/Assessments/2025_Peraton_Logo_2000x541px_White_White.png`

---

## Chunk 1: Project Scaffolding

### Task 1.1: Initialize Project Files

**Files:**
- Create: `.gitignore`
- Create: `requirements.txt`
- Create: `backend/__init__.py`

- [ ] **Step 1: Create .gitignore**

```
.superpowers/
node_modules/
.DS_Store
__pycache__/
*.pyc
*.pyo
.venv/
backend/static/
exports/
data.json
data.json.bak
*.json.tmp
dist/
build_temp/
*.spec.bak
```

- [ ] **Step 2: Create requirements.txt**

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.0.0
openpyxl>=3.1.0
docxtpl>=0.18.0
python-pptx>=1.0.0
matplotlib>=3.9.0
```

Note: `pyinstaller` is intentionally excluded — it's only needed for packaging (Chunk 8) and is installed separately in CI.

- [ ] **Step 3: Create backend/__init__.py**

Empty file.

- [ ] **Step 4: Set up Python virtual environment**

```bash
cd /Users/john/Dev/Assessments/TBM
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore requirements.txt backend/__init__.py
git commit -m "chore: add project config files and Python dependencies"
```

### Task 1.2: FastAPI Backend Skeleton

**Files:**
- Create: `backend/main.py`

- [ ] **Step 1: Create backend/main.py**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/backend/main.py`). Key changes:
- Title: `"Technology Business Management Assessment Tool"`
- Port range: `8751–8760` (not 8741–8750)
- Print banner: `"TBM Assessment Tool"`
- Export types: `["findings", "executive-summary", "gap-analysis", "workbook", "outbrief", "heatmap", "quick-wins", "cost-transparency-roadmap", "all"]`
- Import models as `Discipline` (not `Domain`/`DomainGroup`)

For now, stub out the imports that don't exist yet (`models`, `data_manager`, `export_engine`) — just get the FastAPI app structure in place with a health check endpoint:

```python
import os
import sys
import socket
import webbrowser
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn


def get_base_dir() -> str:
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return str(Path(__file__).parent.parent)


BASE_DIR = get_base_dir()

app = FastAPI(title="Technology Business Management Assessment Tool", version="1.0.0")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "tool": "TBM Assessment Tool"}


def find_available_port(start: int = 8751, end: int = 8760) -> int:
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"No available port in range {start}-{end}")


def main():
    try:
        port = find_available_port()
    except RuntimeError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print(f"\n  TBM Assessment Tool")
    print(f"  Running at: {url}")
    print(f"  Press Ctrl+C to stop\n")

    webbrowser.open(url)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test the backend starts**

```bash
cd /Users/john/Dev/Assessments/TBM
source .venv/bin/activate
python -m backend.main
```

Expected: Server starts on port 8751, browser opens, `/api/health` returns `{"status": "ok", "tool": "TBM Assessment Tool"}`.

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: add FastAPI backend skeleton with health check"
```

### Task 1.3: Frontend Scaffolding (Vite + React + TypeScript + Tailwind)

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.app.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`
- Keep from Vite scaffold: `frontend/tsconfig.node.json`, `frontend/src/vite-env.d.ts`

- [ ] **Step 1: Initialize frontend with Vite**

```bash
cd /Users/john/Dev/Assessments/TBM
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/john/Dev/Assessments/TBM/frontend
npm install react-router-dom recharts lucide-react
npm install -D tailwindcss @tailwindcss/vite @types/node
```

- [ ] **Step 3: Configure vite.config.ts**

Replace the generated `frontend/vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/static'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8751',
    },
  },
})
```

Note: proxy target is `8751` (TBM port), not `8000` or `8741`.

- [ ] **Step 4: Configure TypeScript**

Replace `frontend/tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Replace `frontend/tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create index.css with Tailwind + Peraton theme**

Replace `frontend/src/index.css` with the Peraton dark theme. Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/index.css`).

Key changes from ITSM-ITIL:
- Score color variable names: `--color-score-ad-hoc`, `--color-score-foundational`, `--color-score-managed`, `--color-score-optimized` (not initial/developing/established/optimizing)
- Band color variables: only 4 bands (not 6): `--color-band-ad-hoc`, `--color-band-foundational`, `--color-band-managed`, `--color-band-optimized`

```css
@import "tailwindcss";

@theme {
  --color-page-bg: #0A0A0B;
  --color-surface-dark: #111113;
  --color-surface-medium: #1C1C1E;
  --color-surface-elevated: #262626;
  --color-surface-muted: #333333;
  --color-accent: #1BA1E2;
  --color-accent-bright: #00BCF2;
  --color-accent-glow: rgba(27, 161, 226, 0.08);
  --color-link-blue: #45A2FF;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D0D0D0;
  --color-text-tertiary: #8A8A8E;
  --color-border: #2A2A2E;
  --color-border-subtle: #222225;
  --color-border-hover: #3A3A3E;
  --color-sidebar: #111113;
  --color-sidebar-hover: #1C1C1E;
  --color-sidebar-active: #1BA1E2;
  --color-score-ad-hoc: #ef4444;
  --color-score-foundational: #f97316;
  --color-score-managed: #84cc16;
  --color-score-optimized: #22c55e;
  --color-score-na: #9ca3af;
  --color-band-ad-hoc: #ef4444;
  --color-band-foundational: #f97316;
  --color-band-managed: #84cc16;
  --color-band-optimized: #22c55e;
  --font-sans: "Segoe UI", "Segoe UI Web (West European)", -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif;
}

body {
  font-family: var(--font-sans);
  min-height: 100vh;
  background-color: var(--color-page-bg);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}

input[type="text"],
input[type="number"],
input[type="date"],
textarea,
select {
  color-scheme: dark;
}

main::-webkit-scrollbar { width: 6px; }
main::-webkit-scrollbar-track { background: transparent; }
main::-webkit-scrollbar-thumb { background: var(--color-surface-muted); border-radius: 3px; }
main::-webkit-scrollbar-thumb:hover { background: var(--color-text-tertiary); }

nav::-webkit-scrollbar { width: 4px; }
nav::-webkit-scrollbar-track { background: transparent; }
nav::-webkit-scrollbar-thumb { background: var(--color-surface-elevated); border-radius: 2px; }

input, textarea, select, button {
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}

@keyframes page-enter {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: page-enter 0.15s ease-out; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.2s ease-out; }

.item-focused {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
  border-radius: 12px;
}
```

- [ ] **Step 6: Create minimal App.tsx**

Replace `frontend/src/App.tsx`:

```typescript
export default function App() {
  return (
    <div className="min-h-screen bg-page-bg text-text-primary flex items-center justify-center">
      <h1 className="text-2xl font-bold">TBM Assessment Tool</h1>
    </div>
  );
}
```

- [ ] **Step 7: Update main.tsx**

Replace `frontend/src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 8: Update index.html**

Replace `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TBM Assessment Tool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Clean up Vite boilerplate**

Delete any generated files we don't need: `frontend/src/App.css`, `frontend/src/assets/`, `frontend/public/vite.svg`, etc.

- [ ] **Step 10: Verify frontend runs**

```bash
cd /Users/john/Dev/Assessments/TBM/frontend
npm run dev
```

Expected: Vite dev server on `:5173`, shows "TBM Assessment Tool" with dark background.

- [ ] **Step 11: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold frontend with Vite, React, TypeScript, Tailwind"
```

### Task 1.4: Build Script

**Files:**
- Create: `build.py`

- [ ] **Step 1: Create build.py**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/build.py`). Key changes:
- Backend port: `8751` (not `8741`)
- Distribution name: `"TBM-Assessment"` (not `"ITSMAssessment"`)
- Print messages reference "TBM"

```python
#!/usr/bin/env python3
"""Build script for TBM Assessment Tool.

Usage:
  python build.py          # Build for current platform
  python build.py --dev    # Run in development mode (backend + frontend dev server)
  python build.py --frontend  # Build frontend only
  python build.py --dist   # Build and create distribution ZIP
"""

import subprocess
import sys
import os
from pathlib import Path

BASE = Path(__file__).parent


def build_frontend():
    print("Building frontend...")
    subprocess.run(
        ["npm", "run", "build"],
        cwd=str(BASE / "frontend"),
        check=True,
    )
    print("Frontend built to backend/static/")


def run_dev():
    """Run backend and frontend dev servers."""
    import signal

    print("Starting backend on :8751...")
    backend = subprocess.Popen(
        [sys.executable, "-m", "backend.main"],
        cwd=str(BASE),
    )

    print("Starting frontend dev server on :5173...")
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(BASE / "frontend"),
    )

    def cleanup(sig, frame):
        backend.terminate()
        frontend.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    try:
        backend.wait()
    except KeyboardInterrupt:
        cleanup(None, None)


def build_package():
    """Build standalone executable with PyInstaller."""
    import platform
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)

    build_frontend()

    spec_file = "assessment-tool-macos.spec" if platform.system() == "Darwin" else "assessment-tool-windows.spec"
    spec_path = BASE / spec_file

    if spec_path.exists():
        print(f"Building with {spec_file}...")
        subprocess.run([
            sys.executable, "-m", "PyInstaller",
            "--distpath", str(BASE / "dist"),
            "--workpath", str(BASE / "build_temp"),
            str(spec_path),
        ], check=True)
        print("\nBuild complete! Executable: dist/assessment-tool")
    else:
        print(f"Warning: {spec_file} not found, falling back to CLI args")
        subprocess.run([
            sys.executable, "-m", "PyInstaller",
            "--name", "assessment-tool",
            "--onefile",
            "--add-data", "backend/static:static",
            "--add-data", "framework:framework",
            "--hidden-import", "uvicorn.logging",
            "--hidden-import", "uvicorn.protocols.http",
            "--hidden-import", "uvicorn.protocols.http.auto",
            "--hidden-import", "uvicorn.protocols.http.h11_impl",
            "--hidden-import", "uvicorn.protocols.websockets",
            "--hidden-import", "uvicorn.protocols.websockets.auto",
            "--hidden-import", "uvicorn.lifespan",
            "--hidden-import", "uvicorn.lifespan.on",
            "--hidden-import", "uvicorn.lifespan.off",
            "--hidden-import", "email.mime.multipart",
            "--hidden-import", "email.mime.text",
            "--distpath", str(BASE / "dist"),
            "--workpath", str(BASE / "build_temp"),
            "--specpath", str(BASE),
            str(BASE / "backend" / "main.py"),
        ], check=True)
        print("\nBuild complete! Executable: dist/assessment-tool")


def assemble_distribution():
    """Assemble distribution ZIP with executable, templates, framework, README."""
    import shutil
    import platform

    build_package()

    dist_name = "TBM-Assessment"
    dist_dir = BASE / "dist" / dist_name
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir(parents=True)

    exe_name = "assessment-tool"
    if platform.system() == "Windows":
        exe_name += ".exe"
    exe_src = BASE / "dist" / exe_name
    if not exe_src.exists():
        print(f"Error: executable not found at {exe_src}")
        sys.exit(1)
    shutil.copy2(str(exe_src), str(dist_dir / exe_name))

    readme = BASE / "README.txt"
    if readme.exists():
        shutil.copy2(str(readme), str(dist_dir / "README.txt"))

    templates_src = BASE / "templates"
    if templates_src.exists():
        shutil.copytree(str(templates_src), str(dist_dir / "templates"))
    else:
        (dist_dir / "templates").mkdir()

    framework_src = BASE / "framework"
    if framework_src.exists():
        shutil.copytree(str(framework_src), str(dist_dir / "framework"))

    (dist_dir / "exports").mkdir()

    zip_path = BASE / "dist" / dist_name
    shutil.make_archive(str(zip_path), "zip", str(BASE / "dist"), dist_name)

    zip_file = BASE / "dist" / f"{dist_name}.zip"
    size_mb = zip_file.stat().st_size / (1024 * 1024)
    print(f"\nDistribution ZIP: dist/{dist_name}.zip ({size_mb:.1f} MB)")


if __name__ == "__main__":
    if "--dev" in sys.argv:
        run_dev()
    elif "--frontend" in sys.argv:
        build_frontend()
    elif "--dist" in sys.argv:
        assemble_distribution()
    else:
        build_package()
```

- [ ] **Step 2: Verify dev mode**

```bash
cd /Users/john/Dev/Assessments/TBM
source .venv/bin/activate
python build.py --dev
```

Expected: Backend starts on `:8751`, frontend dev server starts on `:5173`. Visiting `http://localhost:5173` shows "TBM Assessment Tool". `/api/health` returns `{"status": "ok"}`.

- [ ] **Step 3: Commit**

```bash
git add build.py
git commit -m "feat: add build script with dev, frontend, package, and dist modes"
```

---

## Chunk 2: Data Model & Framework

### Task 2.1: Fix Framework JSON — Rename Abbreviated CA IDs

**Files:**
- Modify: `framework/assessment-framework.json`

This is a **blocking prerequisite** — must be done before any models or types reference CA IDs.

- [ ] **Step 1: Identify all CAs needing rename**

The `cost-transparency` discipline already uses full prefixes (e.g., `cost-transparency-pools`). The remaining 11 disciplines use abbreviated prefixes. Rename all CA IDs to use the full discipline ID as prefix.

Pattern: `{abbreviated-prefix}-{suffix}` → `{full-discipline-id}-{suffix}`

Examples:
- `budget-process` → `budget-forecasting-process`
- `service-catalog` → `service-portfolio-catalog`
- `demand-intake` → `demand-management-intake`
- `vendor-lifecycle` → `vendor-contract-lifecycle`
- `asset-inventory` → `asset-management-inventory`
- `federal-fitara` → `federal-compliance-fitara`
- `shared-strategy` → `shared-services-strategy`
- `cloud-strategy` → `cloud-modernization-strategy`
- `cyber-visibility` → `cybersecurity-investment-visibility`

Important: Item IDs use a separate 2-letter abbreviation scheme (e.g., `ct-1-1`, `bf-1-1`) and do NOT need renaming — only CA IDs are affected.

- [ ] **Step 2: Validate the renamed JSON**

```bash
cd /Users/john/Dev/Assessments/TBM
python3 -c "import json; d=json.load(open('framework/assessment-framework.json')); print(f'Valid JSON, {len(d[\"disciplines\"])} disciplines'); [print(f'  {disc[\"id\"]}: {[ca[\"id\"] for ca in disc[\"capability_areas\"]]}') for disc in d['disciplines']]"
```

Expected: All CA IDs start with their parent discipline's full ID.

- [ ] **Step 3: Commit**

```bash
git add framework/assessment-framework.json
git commit -m "fix: rename abbreviated CA IDs to use full discipline prefix"
```

### Task 2.2: Expand Framework Content

**Files:**
- Modify: `framework/assessment-framework.json`

- [ ] **Step 1: Expand core disciplines batch 1 (cost-transparency, budget-forecasting, benchmarking, service-portfolio)**

Add ~5-8 items per discipline to these 4 core disciplines. Each new item must have:
- Unique `id` following the existing `XX-N-N` pattern
- Descriptive `text` with federal/government context
- Full 4-level `rubric` with keys `ad_hoc`, `foundational`, `managed`, `optimized`

Content should reference OMB memoranda, FITARA, TBM Council taxonomy, federal IT Dashboard, etc.

- [ ] **Step 2: Expand core disciplines batch 2 (demand-management, investment-prioritization, vendor-contract, asset-management)**

Add ~5-8 items per discipline to these 4 core disciplines. Same quality requirements.

- [ ] **Step 3: Expand supplemental disciplines**

Add ~5-7 items per supplemental discipline to reach ~70-80 supplemental items total (from current 51). Same quality requirements.

- [ ] **Step 4: Validate expanded framework**

```bash
cd /Users/john/Dev/Assessments/TBM
python3 -c "
import json
d = json.load(open('framework/assessment-framework.json'))
core = sum(len(item) for disc in d['disciplines'] if not disc.get('supplemental') for ca in disc['capability_areas'] for item in [ca['items']])
supp = sum(len(item) for disc in d['disciplines'] if disc.get('supplemental') for ca in disc['capability_areas'] for item in [ca['items']])
print(f'Core items: {core} (target 250-280)')
print(f'Supplemental items: {supp} (target 70-80)')
# Verify all items have rubrics
for disc in d['disciplines']:
    for ca in disc['capability_areas']:
        for item in ca['items']:
            assert set(item['rubric'].keys()) == {'ad_hoc', 'foundational', 'managed', 'optimized'}, f'{item[\"id\"]} missing rubric keys'
print('All rubric keys valid')
"
```

- [ ] **Step 5: Commit**

```bash
git add framework/assessment-framework.json
git commit -m "feat: expand framework to ~260 core and ~75 supplemental items"
```

### Task 2.3: Pydantic Data Models

**Files:**
- Create: `backend/models.py`

- [ ] **Step 1: Create backend/models.py**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/backend/models.py`). Key changes:
- Replace `Domain`/`DomainGroup` with `Discipline` (flat list, no grouping)
- Add `supplemental: bool = False` and `enabled: bool = True` fields to `Discipline`
- `ScoringConfig.discipline_weights` instead of `domain_weights`
- No `ITIL4Extension`/`ITIL4Section` — supplemental disciplines are just `Discipline` objects with `supplemental=True`
- Add `attachments: list[str]` to `AssessmentItem`

```python
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


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
    confidence: Optional[str] = Field(None, pattern="^(High|Medium|Low)$")
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
    supplemental: bool = False
    enabled: bool = True
    capability_areas: list[CapabilityArea] = Field(default_factory=list)


class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""


class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = Field(default_factory=lambda: datetime.now().isoformat())


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

- [ ] **Step 2: Verify models parse**

```bash
cd /Users/john/Dev/Assessments/TBM
source .venv/bin/activate
python3 -c "from backend.models import AssessmentData; d = AssessmentData(); print(d.model_dump_json(indent=2)[:200])"
```

Expected: Valid JSON output with default empty values.

- [ ] **Step 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: add Pydantic data models for TBM assessment"
```

### Task 2.4: Data Manager

**Files:**
- Create: `backend/data_manager.py`

- [ ] **Step 1: Create backend/data_manager.py**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/backend/data_manager.py`). Key changes:
- No `DomainGroup` iteration — framework has flat `disciplines[]` array
- No `ITIL4Extension` handling
- Set `enabled=False` for supplemental disciplines when creating fresh assessment
- Equal weights for all enabled disciplines (`1 / enabled_count`)
- `target_scores` defaults to `3.0` for all disciplines

```python
import json
import os
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
from .models import (
    AssessmentData, AssessmentItem, CapabilityArea, Discipline,
    ClientInfo, AssessmentMetadata, ScoringConfig,
)


class DataManager:
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.data_path = self.base_dir / "data.json"
        self.backup_path = self.base_dir / "data.json.bak"
        self.framework_path = self.base_dir / "framework" / "assessment-framework.json"
        self.exports_dir = self.base_dir / "exports"
        self.templates_dir = self.base_dir / "templates"
        self._framework: dict | None = None

    def load_framework(self) -> dict:
        if self._framework is None:
            with open(self.framework_path, "r") as f:
                self._framework = json.load(f)
        return self._framework

    def _create_empty_item(self, fw_item: dict) -> dict:
        return {
            "id": fw_item["id"],
            "text": fw_item["text"],
            "score": None,
            "na": False,
            "na_justification": None,
            "confidence": None,
            "notes": "",
            "evidence_references": [],
            "attachments": [],
        }

    def create_empty_assessment(self) -> AssessmentData:
        fw = self.load_framework()

        disciplines = []
        for fw_disc in fw["disciplines"]:
            cas = []
            for fw_ca in fw_disc["capability_areas"]:
                items = [AssessmentItem(**self._create_empty_item(fi)) for fi in fw_ca["items"]]
                cas.append(CapabilityArea(id=fw_ca["id"], name=fw_ca["name"], items=items))

            is_supplemental = fw_disc.get("supplemental", False)
            disciplines.append(Discipline(
                id=fw_disc["id"],
                name=fw_disc["name"],
                weight=fw_disc.get("weight", 0.125),
                supplemental=is_supplemental,
                enabled=not is_supplemental,  # Supplemental disciplines start disabled
                capability_areas=cas,
            ))

        # Calculate balanced weights for enabled disciplines
        enabled = [d for d in disciplines if d.enabled]
        equal_weight = 1.0 / len(enabled) if enabled else 0.125
        weights = {}
        for d in disciplines:
            weights[d.id] = equal_weight if d.enabled else 0.0
            d.weight = weights[d.id]

        target_scores = {d.id: 3.0 for d in disciplines}

        return AssessmentData(
            client_info=ClientInfo(assessment_date=datetime.now().strftime("%Y-%m-%d")),
            assessment_metadata=AssessmentMetadata(),
            scoring_config=ScoringConfig(discipline_weights=weights),
            disciplines=disciplines,
            target_scores=target_scores,
        )

    def load_assessment(self) -> AssessmentData:
        if not self.data_path.exists():
            data = self.create_empty_assessment()
            self.save_assessment(data)
            return data

        try:
            with open(self.data_path, "r") as f:
                raw = json.load(f)
            return AssessmentData(**raw)
        except (json.JSONDecodeError, Exception):
            if self.backup_path.exists():
                try:
                    with open(self.backup_path, "r") as f:
                        raw = json.load(f)
                    return AssessmentData(**raw)
                except Exception:
                    pass
            data = self.create_empty_assessment()
            self.save_assessment(data)
            return data

    def save_assessment(self, data: AssessmentData) -> None:
        data.assessment_metadata.last_modified = datetime.now().isoformat()
        self.exports_dir.mkdir(exist_ok=True)

        if self.data_path.exists():
            shutil.copy2(self.data_path, self.backup_path)

        fd, tmp_path = tempfile.mkstemp(
            dir=str(self.base_dir), suffix=".json.tmp"
        )
        try:
            with os.fdopen(fd, "w") as f:
                json.dump(data.model_dump(), f, indent=2, default=str)
            os.replace(tmp_path, str(self.data_path))
        except Exception:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise
```

- [ ] **Step 2: Verify data manager creates valid assessment**

```bash
cd /Users/john/Dev/Assessments/TBM
source .venv/bin/activate
python3 -c "
from backend.data_manager import DataManager
dm = DataManager('.')
data = dm.create_empty_assessment()
enabled = [d for d in data.disciplines if d.enabled]
disabled = [d for d in data.disciplines if not d.enabled]
print(f'Enabled: {len(enabled)} disciplines')
print(f'Disabled: {len(disabled)} supplemental disciplines')
print(f'Weights sum: {sum(data.scoring_config.discipline_weights.values()):.3f}')
print(f'Target scores: {len(data.target_scores)} entries')
for d in data.disciplines:
    items = sum(len(ca.items) for ca in d.capability_areas)
    print(f'  {d.id}: {items} items, weight={d.weight:.4f}, enabled={d.enabled}')
"
```

Expected: 8 enabled core disciplines with equal weights summing to 1.0, 4 disabled supplemental disciplines with weight 0.0.

- [ ] **Step 3: Commit**

```bash
git add backend/data_manager.py
git commit -m "feat: add data manager with framework loading and atomic save"
```

### Task 2.5: Wire Up API Endpoints

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Update backend/main.py with full API**

Replace the skeleton with the complete API. Add imports for `DataManager` and `ExportEngine` (stub export engine for now). Wire up all 4 endpoints: `GET /api/assessment`, `PUT /api/assessment`, `GET /api/framework`, `POST /api/export/{type}`.

Update `backend/main.py` to import and use `DataManager`. For the export endpoint, create a minimal stub `backend/export_engine.py` that raises `NotImplementedError` for now.

```python
import os
import sys
import socket
import webbrowser
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

from .models import AssessmentData
from .data_manager import DataManager


def get_base_dir() -> str:
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return str(Path(__file__).parent.parent)


BASE_DIR = get_base_dir()
data_manager = DataManager(BASE_DIR)

app = FastAPI(title="Technology Business Management Assessment Tool", version="1.0.0")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "tool": "TBM Assessment Tool"}


@app.get("/api/assessment")
async def get_assessment():
    try:
        data = data_manager.load_assessment()
        return data.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/assessment")
async def save_assessment(data: AssessmentData):
    try:
        data_manager.save_assessment(data)
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/framework")
async def get_framework():
    try:
        fw = data_manager.load_framework()
        return fw
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Framework file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


VALID_EXPORT_TYPES = [
    "findings", "executive-summary", "gap-analysis", "workbook",
    "outbrief", "heatmap", "quick-wins", "cost-transparency-roadmap", "all",
]


@app.post("/api/export/{export_type}")
async def export_deliverable(export_type: str):
    if export_type not in VALID_EXPORT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown export type: {export_type}")
    # Export engine will be implemented in Chunk 7
    raise HTTPException(status_code=501, detail="Exports not yet implemented")


# Static file serving
static_dir = Path(BASE_DIR) / "backend" / "static"
if not static_dir.exists():
    static_dir = Path(BASE_DIR) / "static"

if static_dir.exists() and (static_dir / "index.html").exists():
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(static_dir / "index.html"))


def find_available_port(start: int = 8751, end: int = 8760) -> int:
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"No available port in range {start}-{end}")


def main():
    try:
        port = find_available_port()
    except RuntimeError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print(f"\n  TBM Assessment Tool")
    print(f"  Running at: {url}")
    print(f"  Press Ctrl+C to stop\n")

    webbrowser.open(url)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify API endpoints**

```bash
cd /Users/john/Dev/Assessments/TBM
source .venv/bin/activate
python -m backend.main &
sleep 2
curl -s http://localhost:8751/api/health | python3 -m json.tool
curl -s http://localhost:8751/api/framework | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d[\"disciplines\"])} disciplines')"
curl -s http://localhost:8751/api/assessment | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d[\"disciplines\"])} disciplines, saved={d[\"assessment_metadata\"][\"last_modified\"][:10]}')"
kill %1
```

Expected: Health check returns ok, framework returns 12 disciplines, assessment creates and returns data with 12 disciplines.

- [ ] **Step 3: Clean up data.json created by test**

```bash
rm -f /Users/john/Dev/Assessments/TBM/data.json /Users/john/Dev/Assessments/TBM/data.json.bak
```

- [ ] **Step 4: Commit**

```bash
git add backend/main.py
git commit -m "feat: wire up assessment and framework API endpoints"
```

### Task 2.6: Frontend TypeScript Types

**Files:**
- Create: `frontend/src/types.ts`

- [ ] **Step 1: Create frontend/src/types.ts**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/types.ts`). Key changes:
- Replace `Domain`/`DomainGroup` with `Discipline` (flat, with `supplemental` and `enabled`)
- Score labels: Ad Hoc / Foundational / Managed / Optimized (not Initial / Developing / Established / Optimizing)
- 4 maturity bands (not 6)
- Rubric keys: `ad_hoc`, `foundational`, `managed`, `optimized`
- Only 2 weighting models: `balanced` and `custom`
- Framework interface uses flat `disciplines[]` (no `domain_groups`)
- Add `attachments: string[]` to `AssessmentItem`

```typescript
// === Assessment Data Interfaces ===

export interface EvidenceReference {
  document: string;
  section: string;
  date: string;
}

export interface AssessmentItem {
  id: string;
  text: string;
  score: number | null;
  na: boolean;
  na_justification: string | null;
  confidence: 'High' | 'Medium' | 'Low' | null;
  notes: string;
  evidence_references: EvidenceReference[];
  attachments: string[];
}

export interface CapabilityArea {
  id: string;
  name: string;
  items: AssessmentItem[];
}

export interface Discipline {
  id: string;
  name: string;
  weight: number;
  supplemental: boolean;
  enabled: boolean;
  capability_areas: CapabilityArea[];
}

export interface ScoringConfig {
  weighting_model: string;
  discipline_weights: Record<string, number>;
  custom_weights: Record<string, number> | null;
}

export interface ClientInfo {
  name: string;
  industry: string;
  assessment_date: string;
  assessor: string;
}

export interface AssessmentMetadata {
  framework_version: string;
  tool_version: string;
  last_modified: string;
}

export interface AssessmentData {
  client_info: ClientInfo;
  assessment_metadata: AssessmentMetadata;
  scoring_config: ScoringConfig;
  disciplines: Discipline[];
  target_scores: Record<string, number>;
}

// === Framework (Read-Only) Interfaces ===

export interface FrameworkItem {
  id: string;
  text: string;
  rubric: {
    ad_hoc: string;
    foundational: string;
    managed: string;
    optimized: string;
  };
}

export interface FrameworkCapabilityArea {
  id: string;
  name: string;
  items: FrameworkItem[];
}

export interface FrameworkDiscipline {
  id: string;
  name: string;
  weight: number;
  supplemental: boolean;
  capability_areas: FrameworkCapabilityArea[];
}

export interface Framework {
  version: string;
  framework_alignment: string;
  disciplines: FrameworkDiscipline[];
  weighting_models: Record<string, { label: string; description: string }>;
}

// === Constants ===

export const SCORE_LABELS: Record<number, string> = {
  1: 'Ad Hoc',
  2: 'Foundational',
  3: 'Managed',
  4: 'Optimized',
};

export const SCORE_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#84cc16',
  4: '#22c55e',
};

export const MATURITY_BANDS = [
  { min: 1.0, max: 1.75, label: 'Ad Hoc', color: '#ef4444' },
  { min: 1.75, max: 2.5, label: 'Foundational', color: '#f97316' },
  { min: 2.5, max: 3.25, label: 'Managed', color: '#84cc16' },
  { min: 3.25, max: 4.0, label: 'Optimized', color: '#22c55e' },
];

export function getMaturityBand(score: number) {
  for (const band of MATURITY_BANDS) {
    if (score >= band.min && score < band.max) return band;
  }
  if (score >= 4.0) return MATURITY_BANDS[MATURITY_BANDS.length - 1];
  return MATURITY_BANDS[0];
}

export const WEIGHTING_MODELS: Record<string, { label: string }> = {
  balanced: { label: 'Balanced' },
  custom: { label: 'Custom' },
};

export const DEFAULT_TARGET_SCORE = 3.0;
```

- [ ] **Step 2: Verify types compile**

```bash
cd /Users/john/Dev/Assessments/TBM/frontend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types.ts
git commit -m "feat: add TypeScript interfaces and scoring constants"
```

### Task 2.7: Frontend API Client

**Files:**
- Create: `frontend/src/api.ts`

- [ ] **Step 1: Create frontend/src/api.ts**

Adapt from ITSM-ITIL reference. Change export types to TBM's list.

```typescript
import type { AssessmentData, Framework } from './types';

const API_BASE = '/api';

export async function fetchAssessment(): Promise<AssessmentData> {
  const res = await fetch(`${API_BASE}/assessment`);
  if (!res.ok) throw new Error(`Failed to fetch assessment: ${res.statusText}`);
  return res.json() as Promise<AssessmentData>;
}

export async function saveAssessment(data: AssessmentData): Promise<void> {
  const res = await fetch(`${API_BASE}/assessment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save assessment: ${res.statusText}`);
}

export async function fetchFramework(): Promise<Framework> {
  const res = await fetch(`${API_BASE}/framework`);
  if (!res.ok) throw new Error(`Failed to fetch framework: ${res.statusText}`);
  return res.json() as Promise<Framework>;
}

export type ExportType =
  | 'findings' | 'executive-summary' | 'gap-analysis' | 'workbook'
  | 'outbrief' | 'heatmap' | 'quick-wins' | 'cost-transparency-roadmap' | 'all';

export async function exportDeliverable(type: ExportType): Promise<{ filenames: string[] }> {
  const res = await fetch(`${API_BASE}/export/${type}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText })) as { detail?: string };
    throw new Error(err.detail || `Export failed: ${res.statusText}`);
  }
  return res.json() as Promise<{ filenames: string[] }>;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api.ts
git commit -m "feat: add API client for assessment, framework, and export endpoints"
```

---

## Chunk 3: State Management & Core Layout

### Task 3.1: Store (React Context + Auto-Save)

**Files:**
- Create: `frontend/src/store.tsx`

- [ ] **Step 1: Create frontend/src/store.tsx**

Copy directly from ITSM-ITIL reference — the store is essentially identical. It uses React Context, debounced auto-save (300ms), and `structuredClone` for immutable updates. No TBM-specific changes needed.

```typescript
import { createContext, useContext, useCallback, useRef, useEffect, useState, type ReactNode } from 'react';
import type { AssessmentData, Framework } from './types';
import { fetchAssessment, saveAssessment, fetchFramework } from './api';

interface StoreContextType {
  data: AssessmentData | null;
  framework: Framework | null;
  loading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updateData: (updater: (draft: AssessmentData) => void) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef<AssessmentData | null>(null);

  useEffect(() => {
    Promise.all([fetchAssessment(), fetchFramework()])
      .then(([assessmentData, frameworkData]) => {
        setData(assessmentData);
        latestData.current = assessmentData;
        setFramework(frameworkData);
      })
      .catch((err) => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  const debouncedSave = useCallback((newData: AssessmentData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveAssessment(newData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 300);
  }, []);

  const updateData = useCallback(
    (updater: (draft: AssessmentData) => void) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        updater(next);
        next.assessment_metadata.last_modified = new Date().toISOString();
        latestData.current = next;
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave]
  );

  return (
    <StoreContext.Provider value={{ data, framework, loading, saveStatus, updateData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/store.tsx
git commit -m "feat: add React Context store with debounced auto-save"
```

### Task 3.2: App Shell with Router

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create stub page components**

Create these files, each as a minimal stub that renders the page name:
- `frontend/src/pages/ClientInfo.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/DisciplineSummary.tsx`
- `frontend/src/pages/CapabilityArea.tsx`
- `frontend/src/pages/Export.tsx`
- `frontend/src/pages/Settings.tsx`
- `frontend/src/pages/Help.tsx`

Each stub:
```typescript
export default function PageName() {
  return <div className="p-8 page-enter"><h1 className="text-2xl font-bold">Page Name</h1></div>;
}
```

- [ ] **Step 2: Copy logo to frontend**

```bash
cp "/Users/john/Dev/Assessments/2025_Peraton_Logo_2000x541px_White_White.png" "/Users/john/Dev/Assessments/TBM/frontend/public/peraton-logo.png"
```

- [ ] **Step 3: Create App.tsx with router and layout**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/App.tsx`). Key changes:
- Routes use `/discipline/:entityId` (not `/domains/:domainId`)
- No ITIL 4 routes
- Import `Sidebar` (will be created next — use a placeholder div for now)
- Sidebar resize and collapse logic
- Keyboard shortcut: `Cmd+K` (command palette — stub handler for now)
- `Cmd+Right` (next unscored — stub no-op until `useNextUnscored` hook in Chunk 5)
- Loading screen (dark bg, centered Peraton logo ~300px, "Loading..." text)
- `StoreProvider` wrapper
- `BrowserRouter` with all routes
- Sidebar state from `localStorage` key `tbm-sidebar`

- [ ] **Step 4: Verify the app renders with routing**

```bash
cd /Users/john/Dev/Assessments/TBM
python build.py --dev
```

Expected: Frontend loads at `:5173`, shows loading screen then sidebar + "Client Info" page. Clicking sidebar links navigates between stub pages.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/pages/ frontend/public/peraton-logo.png
git commit -m "feat: add app shell with router, sidebar layout, and stub pages"
```

### Task 3.3: Sidebar Component

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/Sidebar.tsx`). This is the most significant adaptation. Key changes:

- **No domain groups** — flat list of disciplines under "CORE DISCIPLINES" and "SUPPLEMENTAL DISCIPLINES" section headers
- **Supplemental toggle** — each supplemental discipline gets an inline toggle switch (preceding the score badge)
- **Toggle behavior:**
  - When toggled off: row grayed out (opacity-40), score badge and progress ring hidden, CA tree not expandable
  - When toggled on: behaves like a core discipline
  - Toggling calls `updateData()` to set `enabled` and recalculate weights
- **Progress rings** — SVG circle per discipline showing % scored
- **Score badges** — rounded average, color-coded
- **Collapsible** — 56px icon-only mode
- **Resizable** — drag handle, min 180px, max 480px, default 350px
- **Persist** — `localStorage` key `tbm-sidebar`

Discipline icons (use Lucide): Choose appropriate icons for each discipline:
- `cost-transparency` → `DollarSign`
- `budget-forecasting` → `TrendingUp`
- `benchmarking` → `BarChart3`
- `service-portfolio` → `Briefcase`
- `demand-management` → `Users`
- `investment-prioritization` → `Target`
- `vendor-contract` → `Handshake`
- `asset-management` → `Server`
- `federal-compliance` → `Shield`
- `shared-services` → `Building2`
- `cloud-modernization` → `Cloud`
- `cybersecurity-investment` → `Lock`

Weight auto-rebalancing when toggling (balanced mode only):
```typescript
const enabledCount = data.disciplines.filter(d => d.enabled).length;
const equalWeight = 1 / enabledCount;
data.disciplines.forEach(d => {
  d.weight = d.enabled ? equalWeight : 0;
  data.scoring_config.discipline_weights[d.id] = d.weight;
});
```

- [ ] **Step 2: Verify sidebar renders and navigates**

```bash
cd /Users/john/Dev/Assessments/TBM
python build.py --dev
```

Expected: Sidebar shows logo, Client Info, Dashboard, 8 core disciplines with expand chevrons, 4 supplemental disciplines with toggle switches (grayed out), Export, Settings, Help links.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat: add sidebar with discipline hierarchy and supplemental toggles"
```

### Task 3.4: Client Info Page

**Files:**
- Modify: `frontend/src/pages/ClientInfo.tsx`

- [ ] **Step 1: Implement ClientInfo page**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/ClientInfo.tsx`). Form with fields: Client Name, Industry, Assessment Date, Assessor. All fields call `updateData()` on change.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/ClientInfo.tsx
git commit -m "feat: implement client info page with auto-save form"
```

### Task 3.5: Basic Dashboard Page

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement basic Dashboard**

For now, show:
- Client info summary
- Overall completion percentage (text only — charts come in Chunk 5)
- List of disciplines with their scores (if any)
- Placeholder for charts: "Charts will be added in a future update"

This gives us a working navigation target without the complexity of Recharts integration yet.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: add basic dashboard with completion summary"
```

---

## Chunk 4: Assessment Scoring UI

### Task 4.1: Scoring Engine

**Files:**
- Create: `frontend/src/scoring.ts`

- [ ] **Step 1: Create scoring.ts**

Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/scoring.ts`). Key changes:
- Replace `domainScore`/`groupScore`/`groupCompletion` with `disciplineScore`/`disciplineCompletion`
- No ITIL4 section scoring functions
- `weightedCompositeScore` iterates flat `disciplines[]` (only enabled ones)
- `overallCompletion` counts only enabled disciplines

```typescript
import type { AssessmentData, AssessmentItem, CapabilityArea, Discipline } from './types';

export function averageScore(items: AssessmentItem[]): number | null {
  const scored = items.filter((i) => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length;
}

export function capabilityAreaScore(ca: CapabilityArea): number | null {
  return averageScore(ca.items);
}

export function disciplineScore(discipline: Discipline): number | null {
  const allItems = discipline.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function disciplineCompletion(discipline: Discipline): number {
  const allItems = discipline.capability_areas.flatMap((ca) => ca.items);
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function weightedCompositeScore(data: AssessmentData): number | null {
  const weights = data.scoring_config.discipline_weights;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const disc of data.disciplines) {
    if (!disc.enabled) continue;
    const score = disciplineScore(disc);
    const weight = weights[disc.id] ?? 0;
    if (score !== null) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

export function overallCompletion(data: AssessmentData): { scored: number; total: number } {
  const enabledItems = data.disciplines
    .filter((d) => d.enabled)
    .flatMap((d) => d.capability_areas.flatMap((ca) => ca.items));
  const scored = enabledItems.filter((i) => i.score !== null || i.na).length;
  return { scored, total: enabledItems.length };
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/scoring.ts
git commit -m "feat: add scoring engine with weighted composite and completion tracking"
```

### Task 4.2: Scoring Widget

**Files:**
- Create: `frontend/src/components/ScoringWidget.tsx`

- [ ] **Step 1: Create ScoringWidget.tsx**

Adapt from ITSM-ITIL reference. Change score labels to: Ad Hoc (1), Foundational (2), Managed (3), Optimized (4). Four radio-style buttons plus N/A toggle.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ScoringWidget.tsx
git commit -m "feat: add scoring widget with 1-4 buttons and N/A toggle"
```

### Task 4.3: Confidence Widget

**Files:**
- Create: `frontend/src/components/ConfidenceWidget.tsx`

- [ ] **Step 1: Create ConfidenceWidget.tsx**

Copy from ITSM-ITIL reference — no TBM-specific changes needed. High/Medium/Low selector.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ConfidenceWidget.tsx
git commit -m "feat: add confidence widget (High/Medium/Low)"
```

### Task 4.4: Assessment Item Card

**Files:**
- Create: `frontend/src/components/AssessmentItemCard.tsx`

- [ ] **Step 1: Create AssessmentItemCard.tsx**

Adapt from ITSM-ITIL reference. Key changes:
- Rubric keys: `ad_hoc`, `foundational`, `managed`, `optimized` (not `initial`, `developing`, `established`, `optimizing`)
- Rubric labels: "Ad Hoc", "Foundational", "Managed", "Optimized"
- Include attachments display (list of filenames)

Card layout:
- Item text (question)
- Expandable rubric (4-level descriptions)
- ScoringWidget
- ConfidenceWidget
- N/A checkbox with justification textarea
- Notes textarea
- Evidence references (document, section, date fields)

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/AssessmentItemCard.tsx
git commit -m "feat: add assessment item card with scoring, rubric, notes, evidence"
```

### Task 4.5: Breadcrumb Component

**Files:**
- Create: `frontend/src/components/Breadcrumb.tsx`

- [ ] **Step 1: Create Breadcrumb.tsx**

Adapt from ITSM-ITIL reference. Simpler since no ITIL4 routes. Path: Home → Discipline Name → Capability Area Name.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Breadcrumb.tsx
git commit -m "feat: add breadcrumb navigation component"
```

### Task 4.6: Discipline Summary Page

**Files:**
- Modify: `frontend/src/pages/DisciplineSummary.tsx`

- [ ] **Step 1: Implement DisciplineSummary page**

Adapt from ITSM-ITIL `DomainSummary.tsx`. Shows:
- Discipline name and description
- List of capability areas with their scores and completion
- Click through to capability area page
- Breadcrumb at top

Route: `/discipline/:entityId`

Find the discipline by `entityId` from `data.disciplines`.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DisciplineSummary.tsx
git commit -m "feat: implement discipline summary page with CA scores"
```

### Task 4.7: Capability Area Page

**Files:**
- Modify: `frontend/src/pages/CapabilityArea.tsx`

- [ ] **Step 1: Implement CapabilityArea page**

Adapt from ITSM-ITIL `CapabilityArea.tsx`. This is the main work page where items are scored. Key features:
- Breadcrumb navigation
- List of AssessmentItemCards
- Keyboard shortcuts: `1`-`4` (score), `H`/`M`/`L` (confidence), `N` (N/A), `Arrow Up/Down` (navigate)
- Focus management for keyboard nav
- Route: `/discipline/:entityId/:areaId`

Find the discipline by `entityId` and capability area by `areaId`.

- [ ] **Step 2: Verify scoring flow**

```bash
cd /Users/john/Dev/Assessments/TBM
python build.py --dev
```

Expected: Navigate to a discipline → capability area → score items with buttons or keyboard → scores appear in sidebar badges and progress rings → data auto-saves.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/CapabilityArea.tsx
git commit -m "feat: implement capability area page with keyboard shortcuts"
```

---

## Chunk 5: Dashboard & Charts

### Task 5.1: Dashboard with Charts

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement full Dashboard**

Adapt from ITSM-ITIL `Dashboard.tsx`. Key changes:
- Radar chart axes: one per enabled discipline (not per domain)
- No domain group sections — flat list of discipline scores
- No ITIL4 section
- Maturity bands: 4 (not 6)

Dashboard sections:
1. **Composite score** — large number with maturity band label and color
2. **Radar chart** — Recharts `RadarChart`, one axis per enabled discipline, scale 0–4
3. **Bar chart** — Recharts `BarChart`, discipline scores with maturity band colors
4. **Progress** — overall completion percentage
5. **Top gaps** — disciplines with largest gap between current and target score
6. **Per-discipline summary** — list of all enabled disciplines with scores

Only show enabled disciplines in all charts and calculations.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: implement dashboard with radar chart, bar chart, and gap analysis"
```

### Task 5.2: Stats Footer

**Files:**
- Create: `frontend/src/components/StatsFooter.tsx`

- [ ] **Step 1: Create StatsFooter.tsx**

Adapt from ITSM-ITIL reference. Shows:
- Overall progress bar and percentage
- Items scored / total
- Save status indicator ("Saving..." / "Saved" / "Error")
- Next unscored item button (uses `useNextUnscored` hook)

- [ ] **Step 2: Create useNextUnscored hook**

Create `frontend/src/hooks/useNextUnscored.ts`. Adapt from ITSM-ITIL reference. Key change: iterate flat `disciplines[]` (only enabled), no ITIL4 sections.

- [ ] **Step 3: Add StatsFooter to App.tsx layout**

Add the StatsFooter component below the main content area in `App.tsx`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/StatsFooter.tsx frontend/src/hooks/useNextUnscored.ts frontend/src/App.tsx
git commit -m "feat: add stats footer with progress bar and save status"
```

---

## Chunk 6: Supplemental Discipline Toggles

### Task 6.1: Settings Page — Supplemental Toggles

**Files:**
- Modify: `frontend/src/pages/Settings.tsx`

- [ ] **Step 1: Implement Settings page**

Adapt from ITSM-ITIL `Settings.tsx`. Sections:

1. **Weighting Model** — dropdown: Balanced / Custom
2. **Discipline Weights** — when Custom is selected, show sliders/inputs per enabled discipline. When Balanced, show read-only equal weights.
3. **Target Scores** — per-discipline target score inputs (default 3.0)
4. **Supplemental Disciplines** — toggle switches for each supplemental discipline with name and description. Toggling triggers weight auto-rebalance in balanced mode.

Key logic for supplemental toggle:
```typescript
const handleToggle = (discId: string) => {
  updateData((draft) => {
    const disc = draft.disciplines.find(d => d.id === discId);
    if (!disc) return;
    disc.enabled = !disc.enabled;

    if (draft.scoring_config.weighting_model === 'balanced') {
      const enabledCount = draft.disciplines.filter(d => d.enabled).length;
      const equalWeight = enabledCount > 0 ? 1 / enabledCount : 0;
      draft.disciplines.forEach(d => {
        d.weight = d.enabled ? equalWeight : 0;
        draft.scoring_config.discipline_weights[d.id] = d.weight;
      });
    }
  });
};
```

- [ ] **Step 2: Verify supplemental toggles work end-to-end**

```bash
cd /Users/john/Dev/Assessments/TBM
python build.py --dev
```

Expected: Go to Settings, toggle on "Federal Compliance". Sidebar shows it as active (not grayed out). Dashboard charts update to include it. Weights rebalance to equal across 9 disciplines. Toggle off — reverts to 8 disciplines.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings.tsx
git commit -m "feat: implement settings page with supplemental toggles and weighting"
```

### Task 6.2: Verify Sidebar Toggle Integration

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx` (if needed)

- [ ] **Step 1: Verify sidebar toggles sync with settings**

The sidebar should already have inline toggle switches from Task 3.3. Verify that:
- Toggling in sidebar updates Settings page
- Toggling in Settings page updates sidebar
- Score badges/rings appear/disappear correctly
- Grayed-out state works
- Navigation to disabled discipline pages shows appropriate state

Fix any integration issues.

- [ ] **Step 2: Commit (if changes needed)**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "fix: sync sidebar supplemental toggles with settings page"
```

---

## Chunk 7: Exports

### Task 7.1: Export Engine

**Files:**
- Create: `backend/export_engine.py`

- [ ] **Step 1: Create export_engine.py — class skeleton and helper functions**

Create `backend/export_engine.py`. Adapt from ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/backend/export_engine.py`). Key changes throughout:
- Iterate flat `disciplines[]` (not `domain_groups[].domains[]`)
- Only include enabled disciplines in all exports
- Score labels: Ad Hoc / Foundational / Managed / Optimized
- 4 maturity bands (not 6)
- `_weighted_composite()` uses `discipline_weights` (not `domain_weights`)

Start with:
- `ExportEngine.__init__()` — sets up paths
- `_score_avg(items)` — average of scored, non-N/A items
- `_get_maturity_band(score)` — returns band label for 4-band scale
- `_weighted_composite(data)` — weighted composite score
- `_timestamp()` — filename timestamp helper
- `generate_radar_chart_png(data)` → PNG (matplotlib Agg, 6×6in, 150 DPI, axes = enabled discipline names)

- [ ] **Step 2: Implement DOCX exports (findings, executive-summary, gap-analysis)**

Add methods:
- `export_findings(data)` → DOCX — per-discipline item breakdown with scores, notes, evidence. Filenames: `D-01_*`
- `export_executive_summary(data)` → DOCX — composite score, embedded radar chart PNG, top gaps. Filenames: `D-02_*`
- `export_gap_analysis(data)` → DOCX — current vs target matrix, remediation timeline. Filenames: `D-03_*`

- [ ] **Step 3: Implement workbook and outbrief exports**

Add methods:
- `export_workbook(data)` → XLSX — Dashboard sheet + per-discipline sheets with all items. Filenames: `D-04_*`
- `export_outbrief(data)` → PPTX — Title + overview + radar + per-discipline slides. Filenames: `D-05_*`

- [ ] **Step 4: Implement heatmap, quick-wins, and cost-transparency-roadmap exports**

Add methods:
- `export_heatmap(data)` → XLSX — Discipline × CA color grid. Filenames: `D-06_*`
- `export_quick_wins(data)` → DOCX — Low-score, high-impact items. Filenames: `D-07_*`
- `export_cost_transparency_roadmap(data)` → DOCX (new — TBM-specific). Filenames: `D-08_*`. Content:
  - Current maturity assessment of cost transparency practices
  - Phased roadmap for TBM taxonomy adoption
  - Cost allocation maturity progression recommendations
  - Quick wins in cost transparency

- [ ] **Step 5: Implement export_all and commit**

Add `export_all(data)` — calls all 8 export methods, returns list of all filenames.

```bash
git add backend/export_engine.py
git commit -m "feat: add export engine with all 8 export types"
```

### Task 7.2: Wire Export Engine to API

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Update main.py to use ExportEngine**

Replace the stub export endpoint with the real implementation. Import `ExportEngine`, instantiate it, wire up the method map.

```python
from .export_engine import ExportEngine

# ... after data_manager initialization:
export_engine = ExportEngine(BASE_DIR)

# Replace the export endpoint:
@app.post("/api/export/{export_type}")
async def export_deliverable(export_type: str):
    if export_type not in VALID_EXPORT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown export type: {export_type}")

    try:
        data = data_manager.load_assessment()
        method_map = {
            "findings": export_engine.export_findings,
            "executive-summary": export_engine.export_executive_summary,
            "gap-analysis": export_engine.export_gap_analysis,
            "workbook": export_engine.export_workbook,
            "outbrief": export_engine.export_outbrief,
            "heatmap": export_engine.export_heatmap,
            "quick-wins": export_engine.export_quick_wins,
            "cost-transparency-roadmap": export_engine.export_cost_transparency_roadmap,
        }
        if export_type == "all":
            filenames = export_engine.export_all(data)
        else:
            filenames = [method_map[export_type](data)]
        return {"filenames": filenames}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 2: Test exports**

```bash
cd /Users/john/Dev/Assessments/TBM
source .venv/bin/activate
python -m backend.main &
sleep 2
curl -s -X POST http://localhost:8751/api/export/findings | python3 -m json.tool
curl -s -X POST http://localhost:8751/api/export/workbook | python3 -m json.tool
curl -s -X POST http://localhost:8751/api/export/all | python3 -m json.tool
ls -la exports/
kill %1
```

Expected: Each export creates a file in `exports/`, API returns filenames.

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: wire export engine to API endpoints"
```

### Task 7.3: Export Page with Validation Warnings

**Files:**
- Create: `frontend/src/validation.ts`
- Modify: `frontend/src/pages/Export.tsx`

- [ ] **Step 1: Create validation.ts**

Adapt from ITSM-ITIL reference. Validation rules (informational only):

```typescript
import type { AssessmentData } from './types';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  disciplineId?: string;
  areaId?: string;
  itemId?: string;
}

export function validateAssessment(data: AssessmentData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const disc of data.disciplines) {
    if (!disc.enabled) continue;
    for (const ca of disc.capability_areas) {
      for (const item of ca.items) {
        if (item.score === null && !item.na) {
          issues.push({
            severity: 'info',
            rule: 'unscored',
            message: `"${item.text.slice(0, 60)}..." is not scored`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
        if (item.na && !item.na_justification) {
          issues.push({
            severity: 'error',
            rule: 'na-no-justification',
            message: `"${item.text.slice(0, 60)}..." marked N/A without justification`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
        if (item.score !== null && !item.notes) {
          issues.push({
            severity: 'warning',
            rule: 'scored-no-notes',
            message: `"${item.text.slice(0, 60)}..." scored but has no notes`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
        if (item.confidence === 'Low' && !item.notes) {
          issues.push({
            severity: 'warning',
            rule: 'low-confidence-no-notes',
            message: `"${item.text.slice(0, 60)}..." has low confidence with no notes`,
            disciplineId: disc.id,
            areaId: ca.id,
            itemId: item.id,
          });
        }
      }
    }
  }

  return issues;
}
```

- [ ] **Step 2: Implement Export page**

Adapt from ITSM-ITIL `Export.tsx`. Show all 8 export buttons (always enabled) with:
- Core Exports section (1-5)
- TBM-Specific Exports section (6-8)
- Informational validation warnings panel above buttons
- Export status per type (idle/exporting/done/error)
- "Export All" button

- [ ] **Step 3: Commit**

```bash
git add frontend/src/validation.ts frontend/src/pages/Export.tsx
git commit -m "feat: implement export page with validation warnings"
```

---

## Chunk 8: Polish & Packaging

### Task 8.1: Command Palette

**Files:**
- Create: `frontend/src/components/CommandPalette.tsx`

- [ ] **Step 1: Create CommandPalette.tsx**

Adapt from ITSM-ITIL reference. Key changes:
- Search across flat `disciplines[]` and their capability areas (no domain groups, no ITIL4 sections)
- Only show enabled disciplines
- Navigate to `/discipline/:id` or `/discipline/:id/:areaId`

- [ ] **Step 2: Wire Cmd+K shortcut in App.tsx**

Ensure `App.tsx` opens the command palette on `Cmd+K` / `Ctrl+K`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CommandPalette.tsx frontend/src/App.tsx
git commit -m "feat: add command palette with fuzzy search (Cmd+K)"
```

### Task 8.2: Onboarding Tooltip

**Files:**
- Create: `frontend/src/components/OnboardingTooltip.tsx`

- [ ] **Step 1: Create OnboardingTooltip.tsx**

Copy from ITSM-ITIL reference — no TBM-specific changes needed. Reusable tooltip with localStorage persistence for dismissal.

- [ ] **Step 2: Add tooltips to key UI elements**

Add first-time hints to:
- Sidebar (how to expand/collapse)
- First assessment item (keyboard shortcuts)
- Dashboard (what the composite score means)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/OnboardingTooltip.tsx
git commit -m "feat: add onboarding tooltips for first-time users"
```

### Task 8.3: Help Page

**Files:**
- Modify: `frontend/src/pages/Help.tsx`

- [ ] **Step 1: Implement Help page**

Adapt from ITSM-ITIL reference. Sections:
- Keyboard shortcuts table
- Scoring methodology (1-4 scale with descriptions)
- Discipline overview (8 core + 4 supplemental)
- Supplemental disciplines explanation
- Export deliverables guide
- TBM framework alignment info

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Help.tsx
git commit -m "feat: implement help page with shortcuts and methodology guide"
```

### Task 8.4: PyInstaller Specs

**Files:**
- Create: `assessment-tool-macos.spec`
- Create: `assessment-tool-windows.spec`

- [ ] **Step 1: Create macOS spec**

Adapt from ITSM-ITIL reference. Key changes per the prompt spec:
- `target_arch='arm64'` (GitHub macOS runners are ARM-only)
- Conditional `templates` directory inclusion
- Port range in comments: 8751-8760

```python
# assessment-tool-macos.spec
import os
from pathlib import Path

block_cipher = None
BASE = Path(SPECPATH)

datas = [
    (str(BASE / 'backend' / 'static'), 'static'),
    (str(BASE / 'framework'), 'framework'),
]
if os.path.isdir(str(BASE / 'templates')):
    datas.append((str(BASE / 'templates'), 'templates'))

a = Analysis(
    [str(BASE / 'backend' / 'main.py')],
    pathex=[str(BASE)],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'email.mime.multipart',
        'email.mime.text',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='assessment-tool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch='arm64',
    codesign_identity=None,
    entitlements_file=None,
)
```

- [ ] **Step 2: Create Windows spec**

Same as macOS but without `target_arch`:

```python
# assessment-tool-windows.spec
import os
from pathlib import Path

block_cipher = None
BASE = Path(SPECPATH)

datas = [
    (str(BASE / 'backend' / 'static'), 'static'),
    (str(BASE / 'framework'), 'framework'),
]
if os.path.isdir(str(BASE / 'templates')):
    datas.append((str(BASE / 'templates'), 'templates'))

a = Analysis(
    [str(BASE / 'backend' / 'main.py')],
    pathex=[str(BASE)],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'email.mime.multipart',
        'email.mime.text',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='assessment-tool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    codesign_identity=None,
    entitlements_file=None,
)
```

- [ ] **Step 3: Commit**

```bash
git add assessment-tool-macos.spec assessment-tool-windows.spec
git commit -m "feat: add PyInstaller spec files for macOS ARM and Windows"
```

### Task 8.5: README.txt

**Files:**
- Create: `README.txt`

- [ ] **Step 1: Create README.txt**

End-user documentation:

```
Technology Business Management (TBM) Assessment Tool
=====================================================

GETTING STARTED
1. Double-click "assessment-tool" (macOS) or "assessment-tool.exe" (Windows)
2. Your browser will open automatically
3. If not, navigate to http://localhost:8751

WORKFLOW
1. Enter client information on the home page
2. Navigate through disciplines in the sidebar
3. Score each assessment item (1-4 scale)
4. Review results on the Dashboard
5. Generate deliverables from the Export page

SCORING SCALE
  1 = Ad Hoc        - No formal process
  2 = Foundational   - Basic processes in place
  3 = Managed        - Standardized and measured
  4 = Optimized      - Continuously improving

KEYBOARD SHORTCUTS
  Cmd/Ctrl+K         Command palette (quick navigation)
  Cmd/Ctrl+Right     Jump to next unscored item
  1-4                Score focused item
  H/M/L              Set confidence (High/Medium/Low)
  N                  Toggle N/A
  Arrow Up/Down      Navigate between items

SUPPLEMENTAL DISCIPLINES
The tool includes 4 optional supplemental disciplines:
  - Federal Compliance & Reporting
  - Shared Services & Consolidation
  - Cloud & Modernization Investment
  - Cybersecurity Investment Management

Enable them in Settings or via sidebar toggles.

EXPORTS
All deliverables are saved to the "exports" folder:
  - Assessment Findings (DOCX)
  - Executive Summary (DOCX)
  - Gap Analysis & Roadmap (DOCX)
  - Scored Assessment Workbook (XLSX)
  - Out-Brief Presentation (PPTX)
  - TBM Maturity Heatmap (XLSX)
  - Quick Wins Report (DOCX)
  - Cost Transparency Roadmap (DOCX)

DATA
Assessment data is saved automatically to "data.json".
A backup is maintained at "data.json.bak".

TROUBLESHOOTING
- If the tool won't start, check if port 8751-8760 is available
- If the browser doesn't open, manually visit http://localhost:8751
- To reset, delete data.json and restart
```

- [ ] **Step 2: Commit**

```bash
git add README.txt
git commit -m "docs: add end-user README"
```

### Task 8.6: GitHub Actions — CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - name: Install frontend dependencies
        working-directory: frontend
        run: npm ci
      - name: Type check
        working-directory: frontend
        run: npx tsc --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint and type-check workflow"
```

### Task 8.7: GitHub Actions — Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create Release workflow**

Use the exact workflow from the prompt spec (Section 12). It builds macOS ARM + Windows executables, assembles distribution ZIPs, and creates a draft GitHub release.

Key points:
- macOS uses `target_arch='arm64'`
- Templates directory is conditional
- Artifact names: `TBM-Assessment-macos`, `TBM-Assessment-windows`
- Release title: "Technology Business Management Assessment Tool ${{ version }}"

Copy the workflow YAML from `/Users/john/Dev/Assessments/TBM/assessment-tool-prompt-TBM.md` Section 12 (lines 652-763) verbatim.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow for macOS ARM and Windows builds"
```

---

## Implementation Notes

### Key Differences from ITSM-ITIL Reference

| Aspect | ITSM-ITIL | TBM |
|--------|-----------|-----|
| Hierarchy | 3-level (Group → Domain → CA) | 2-level (Discipline → CA) |
| Extension | ITIL 4 module (all-or-nothing) | 4 individual supplemental toggles |
| Scoring labels | Initial/Developing/Established/Optimizing | Ad Hoc/Foundational/Managed/Optimized |
| Maturity bands | 6 bands | 4 bands |
| Port range | 8741-8750 | 8751-8760 |
| Weighting models | 4 (balanced, ops_heavy, governance, service_delivery) | 2 (balanced, custom) |
| Export types | 8 (includes itil4-alignment) | 8 (includes cost-transparency-roadmap) |
| Data model root | `domain_groups[]` | `disciplines[]` |

### Files to Copy Unchanged from ITSM-ITIL

These files can be copied with minimal or no changes:
- `frontend/src/store.tsx` — identical pattern
- `frontend/src/components/ConfidenceWidget.tsx` — no domain-specific logic
- `frontend/src/components/OnboardingTooltip.tsx` — generic component

### Files Requiring Significant Adaptation

These files need careful adaptation:
- `frontend/src/components/Sidebar.tsx` — new supplemental toggle pattern
- `frontend/src/types.ts` — new data model structure
- `frontend/src/scoring.ts` — simplified (flat, no groups)
- `backend/export_engine.py` — new export type + flat discipline iteration
- `frontend/src/pages/Dashboard.tsx` — different chart data source
