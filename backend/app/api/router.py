from typing import Any

from django.http import HttpRequest
from ninja import NinjaAPI, Router
from ninja.errors import HttpError
from ninja.security import HttpBearer
from sqlalchemy import text

from app.core.config import get_settings
from app.core.security import SecurityError
from app.core.throttling import check_rate_limit
from app.db.session import get_engine, session_scope
from app.repositories.analysis_repository import get_analysis, list_analyses
from app.repositories.stats_repository import fetch_stats
from app.schemas.analysis import AnalysisFilterIn, AnalysisListOut, AnalysisOut, AnalyzeInput
from app.schemas.auth import LoginInput, TokenOut, UserOut
from app.schemas.stats import StatsOut
from app.services.analysis_engine import analyze_and_persist
from app.services.auth_service import authenticate, create_token, decode_token


class JWTAuth(HttpBearer):
    def authenticate(self, request: HttpRequest, token: str) -> dict[str, Any] | None:
        try:
            payload = decode_token(token)
        except Exception:
            return None
        request.auth_payload = payload
        return payload


auth = JWTAuth()
router = Router(tags=["phishing"])
settings = get_settings()


def request_ip(request: HttpRequest) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    return (forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "unknown"))


def require_admin(request: HttpRequest) -> dict[str, Any]:
    payload = getattr(request, "auth_payload", None)
    if not payload or payload.get("role") != "admin":
        raise HttpError(403, "Accès administrateur requis.")
    return payload


def get_optional_auth_payload(request: HttpRequest) -> dict[str, Any] | None:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        return None
    token = header.split(" ", 1)[1].strip()
    try:
        return decode_token(token)
    except Exception:
        return None


def serialize_analysis(analysis) -> dict[str, Any]:
    return {
        "id": analysis.id,
        "submitted_url": analysis.submitted_url,
        "normalized_url": analysis.normalized_url,
        "domain": analysis.domain,
        "scheme": analysis.scheme,
        "score": analysis.score,
        "risk_level": analysis.risk_level,
        "verdict": analysis.verdict,
        "status": analysis.status,
        "analysis_finished_at": analysis.analysis_finished_at,
        "duration_ms": analysis.duration_ms,
        "error_message": analysis.error_message,
        "http_status": analysis.http_status,
        "redirected_to": analysis.redirected_to,
        "screenshot_path": analysis.screenshot_path,
        "details_json": analysis.details_json,
        "indicators": [
            {
                "code": indicator.code,
                "label": indicator.label,
                "category": indicator.category,
                "weight": indicator.weight,
                "detected": indicator.detected,
                "details": indicator.details,
            }
            for indicator in sorted(
                analysis.indicator_results,
                key=lambda item: (not item.detected, -item.weight, item.code),
            )
        ],
    }


def serialize_analysis_summary(analysis) -> dict[str, Any]:
    return {
        "id": analysis.id,
        "submitted_url": analysis.submitted_url,
        "normalized_url": analysis.normalized_url,
        "domain": analysis.domain,
        "score": analysis.score,
        "risk_level": analysis.risk_level,
        "verdict": analysis.verdict,
        "status": analysis.status,
        "analysis_finished_at": analysis.analysis_finished_at,
        "duration_ms": analysis.duration_ms,
    }


@router.post("/v1/analyze", response=AnalysisOut)
async def analyze_url(request: HttpRequest, payload: AnalyzeInput):
    throttle = check_rate_limit(
        f"analyze:{request_ip(request)}",
        settings.rate_limit_analyze_per_minute,
    )
    if not throttle.allowed:
        raise HttpError(429, f"Trop de requêtes. Réessayez dans {throttle.reset_in_seconds}s.")
    with session_scope() as session:
        try:
            auth_payload = get_optional_auth_payload(request)
            user_id = int(auth_payload["sub"]) if auth_payload else None
            analysis = await analyze_and_persist(session, payload.url, user_id, request_ip(request))
        except SecurityError as exc:
            raise HttpError(400, str(exc)) from exc
    with session_scope() as session:
        fresh = get_analysis(session, analysis.id)
    return serialize_analysis(fresh)


@router.get("/v1/analyses", auth=auth, response=AnalysisListOut)
def analyses(request: HttpRequest, filters: AnalysisFilterIn):
    require_admin(request)
    with session_scope() as session:
        items, total = list_analyses(
            session,
            verdict=filters.verdict,
            risk_level=filters.risk_level,
            min_score=filters.min_score,
            max_score=filters.max_score,
            from_date=filters.from_date,
            to_date=filters.to_date,
        )
    return {
        "items": [serialize_analysis_summary(item) for item in items],
        "total": total,
    }


@router.get("/v1/analyses/{analysis_id}", auth=auth, response=AnalysisOut)
def analysis_detail(request: HttpRequest, analysis_id: int):
    require_admin(request)
    with session_scope() as session:
        item = get_analysis(session, analysis_id)
    if item is None:
        raise HttpError(404, "Analyse introuvable.")
    return serialize_analysis(item)


@router.get("/v1/stats", auth=auth, response=StatsOut)
def stats(request: HttpRequest):
    require_admin(request)
    with session_scope() as session:
        return fetch_stats(session)


@router.post("/v1/auth/login", response=TokenOut)
def login(request: HttpRequest, payload: LoginInput):
    throttle = check_rate_limit(
        f"login:{request_ip(request)}",
        settings.rate_limit_login_per_minute,
    )
    if not throttle.allowed:
        raise HttpError(429, f"Trop de tentatives. Réessayez dans {throttle.reset_in_seconds}s.")
    with session_scope() as session:
        user = authenticate(session, payload.username, payload.password, request_ip(request))
    if user is None:
        raise HttpError(401, "Identifiants invalides.")
    token, expires_in = create_token(user)
    return {
        "access_token": token,
        "expires_in": expires_in,
        "user": UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.value,
            last_login_at=user.last_login_at,
        ),
    }


@router.get("/v1/health")
def health(request: HttpRequest):
    engine = get_engine()
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok", "service": settings.app_name, "database": "reachable"}


api = NinjaAPI(
    title=settings.app_name,
    version="1.0.0",
    urls_namespace="phishing-api",
    docs_url="/v1/docs",
    openapi_url="/v1/openapi.json",
)
api.add_router("", router)