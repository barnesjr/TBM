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
