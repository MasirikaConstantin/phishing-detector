from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.analysis import Analysis
from app.models.indicator_result import IndicatorResult


def get_analysis(session: Session, analysis_id: int) -> Analysis | None:
    statement = (
        select(Analysis)
        .where(Analysis.id == analysis_id)
        .options(selectinload(Analysis.indicator_results))
    )
    return session.scalar(statement)


def list_analyses(
    session: Session,
    verdict: str | None = None,
    risk_level: str | None = None,
    min_score: int | None = None,
    max_score: int | None = None,
    from_date=None,
    to_date=None,
    limit: int = 25,
) -> tuple[list[Analysis], int]:
    statement = select(Analysis).order_by(Analysis.id.desc())
    count_statement = select(func.count(Analysis.id))
    filters = []
    if verdict:
        filters.append(Analysis.verdict == verdict)
    if risk_level:
        filters.append(Analysis.risk_level == risk_level)
    if min_score is not None:
        filters.append(Analysis.score >= min_score)
    if max_score is not None:
        filters.append(Analysis.score <= max_score)
    if from_date is not None:
        filters.append(Analysis.analysis_finished_at >= from_date)
    if to_date is not None:
        filters.append(Analysis.analysis_finished_at <= to_date)
    if filters:
        statement = statement.where(*filters)
        count_statement = count_statement.where(*filters)
    statement = statement.limit(limit)
    items = session.scalars(statement).all()
    total = session.scalar(count_statement) or 0
    return items, total
