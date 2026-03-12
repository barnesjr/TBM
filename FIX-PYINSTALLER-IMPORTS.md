# Fix: PyInstaller Relative Import Error

## Problem

When running the packaged release, the app crashes with:

```
ImportError: attempted relative import with no known parent package
```

PyInstaller runs `backend/main.py` as `__main__` (a standalone script), not as part of the `backend` package. Relative imports (e.g., `from .models import ...`) require a parent package and fail in this context.

## Fix

Wrap every relative import in a `try/except` fallback to an absolute import. This works in both dev mode (relative) and the frozen PyInstaller build (absolute).

### 1. `backend/main.py` (lines 12-14)

**Before:**
```python
from .models import AssessmentData
from .data_manager import DataManager
from .export_engine import ExportEngine
```

**After:**
```python
try:
    from .models import AssessmentData
    from .data_manager import DataManager
    from .export_engine import ExportEngine
except ImportError:
    from models import AssessmentData
    from data_manager import DataManager
    from export_engine import ExportEngine
```

### 2. `backend/data_manager.py` (line 7)

**Before:**
```python
from .models import (
    AssessmentData, AssessmentItem, CapabilityArea, Discipline,
    ClientInfo, AssessmentMetadata, ScoringConfig,
)
```

**After:**
```python
try:
    from .models import (
        AssessmentData, AssessmentItem, CapabilityArea, Discipline,
        ClientInfo, AssessmentMetadata, ScoringConfig,
    )
except ImportError:
    from models import (
        AssessmentData, AssessmentItem, CapabilityArea, Discipline,
        ClientInfo, AssessmentMetadata, ScoringConfig,
    )
```

### 3. `backend/export_engine.py`

No relative imports found -- no changes needed in this file.

## Verify

After making changes, confirm both import paths work:

```bash
# Dev mode (relative imports)
python -c "from backend.main import app; print('OK')"

# Direct script mode (absolute imports, simulates PyInstaller)
cd backend && python -c "from models import AssessmentData; print('OK')"
```

Then rebuild: `pyinstaller assessment-tool-macos.spec`
