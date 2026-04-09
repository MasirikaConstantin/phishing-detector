from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.analysis import Analysis


def fetch_stats(session: Session) -> dict:
    total = session.scalar(select(func.count(Analysis.id))) or 0
    risk_distribution = session.execute(
        select(Analysis.risk_level, func.count(Analysis.id)).group_by(Analysis.risk_level)
    ).all()
    verdict_distribution = session.execute(
        select(Analysis.verdict, func.count(Analysis.id)).group_by(Analysis.verdict)
    ).all()
    top_domains = session.execute(
        select(Analysis.domain, func.count(Analysis.id))
        .group_by(Analysis.domain)
        .order_by(desc(func.count(Analysis.id)))
        .limit(5)
    ).all()
    recent_scores = session.execute(
        select(Analysis.id, Analysis.score).order_by(Analysis.id.desc()).limit(12)
    ).all()
    return {
        "total_analyses": total,
        "risk_distribution": [{"label": label, "value": value} for label, value in risk_distribution],
        "verdict_distribution": [{"label": label, "value": value} for label, value in verdict_distribution],
        "top_domains": [{"label": label, "value": value} for label, value in top_domains],
        "recent_scores": [{"label": f"#{item_id}", "score": score} for item_id, score in reversed(recent_scores)],
    }
