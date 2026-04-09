from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, HttpUrl


class AnalyzeInput(BaseModel):
    url: str = Field(min_length=4, max_length=2048)


class IndicatorOut(BaseModel):
    code: str
    label: str
    category: str
    weight: int
    detected: bool
    details: str


class AnalysisSummaryOut(BaseModel):
    id: int
    submitted_url: str
    normalized_url: str
    domain: str
    score: int
    risk_level: str
    verdict: str
    status: str
    analysis_finished_at: datetime | None = None
    duration_ms: int | None = None


class AnalysisOut(AnalysisSummaryOut):
    scheme: str
    error_message: str | None = None
    http_status: int | None = None
    redirected_to: str | None = None
    screenshot_path: str | None = None
    indicators: list[IndicatorOut]
    details_json: dict[str, Any]


class AnalysisListOut(BaseModel):
    items: list[AnalysisSummaryOut]
    total: int


class AnalysisFilterIn(BaseModel):
    verdict: str | None = None
    risk_level: str | None = None
    min_score: int | None = Field(default=None, ge=0, le=100)
    max_score: int | None = Field(default=None, ge=0, le=100)
    from_date: datetime | None = None
    to_date: datetime | None = None

