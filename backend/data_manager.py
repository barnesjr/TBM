import json
import os
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
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


class DataManager:
    def __init__(self, base_dir: str, resource_dir: str | None = None):
        self.base_dir = Path(base_dir)
        self.resource_dir = Path(resource_dir) if resource_dir else self.base_dir
        self.data_path = self.base_dir / "data.json"
        self.backup_path = self.base_dir / "data.json.bak"
        self.framework_path = self.resource_dir / "framework" / "assessment-framework.json"
        self.exports_dir = self.base_dir / "exports"
        self.templates_dir = self.resource_dir / "templates"
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
                enabled=not is_supplemental,
                capability_areas=cas,
            ))

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
