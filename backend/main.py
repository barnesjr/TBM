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
