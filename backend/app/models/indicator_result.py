from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class IndicatorResult(Base):
    __tablename__ = "indicator_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(80), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False, default="generic")
    weight: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    detected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    details: Mapped[str] = mapped_column(Text, nullable=False, default="")

    analysis = relationship("Analysis", back_populates="indicator_results")
