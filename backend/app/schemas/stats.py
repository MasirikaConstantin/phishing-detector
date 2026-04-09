from pydantic import BaseModel


class NamedValue(BaseModel):
    label: str
    value: int


class ScorePoint(BaseModel):
    label: str
    score: int


class StatsOut(BaseModel):
    total_analyses: int
    risk_distribution: list[NamedValue]
    verdict_distribution: list[NamedValue]
    top_domains: list[NamedValue]
    recent_scores: list[ScorePoint]
