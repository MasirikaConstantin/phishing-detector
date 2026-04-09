import logging
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from time import perf_counter
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.core.security import (
    NormalizedTarget,
    SecurityError,
    contains_suspicious_chars,
    count_subdomains,
    is_ip_hostname,
    normalize_url,
)
from app.models.analysis import Analysis
from app.models.audit_log import AuditLog
from app.models.indicator_result import IndicatorResult
from app.services.domain_tools import SUSPICIOUS_TLDS, DomainInfo, extract_domain_info
from app.services.html_fetcher import FetchResult, fetch_html, parse_html

logger = logging.getLogger("app.analysis")

SENSITIVE_KEYWORDS = {"login", "verify", "secure", "update", "bank", "password", "account"}
KNOWN_BRANDS = {
    "paypal": {"paypal"},
    "microsoft": {"microsoft", "office", "live"},
    "google": {"google", "gmail"},
    "amazon": {"amazon"},
    "apple": {"apple", "icloud"},
    "facebook": {"facebook", "meta"},
    "instagram": {"instagram"},
}


@dataclass(slots=True)
class IndicatorEvaluation:
    code: str
    label: str
    category: str
    weight: int
    detected: bool
    details: str


@dataclass(slots=True)
class AnalysisComputation:
    target: NormalizedTarget
    domain_info: DomainInfo
    indicators: list[IndicatorEvaluation]
    score: int
    risk_level: str
    verdict: str
    http_status: int | None
    redirected_to: str | None
    screenshot_path: str | None
    details_json: dict
    error_message: str | None


def compute_score(indicators: list[IndicatorEvaluation]) -> int:
    return min(sum(ind.weight for ind in indicators if ind.detected), 100)


def classify_risk(score: int) -> tuple[str, str]:
    if score >= 80:
        return "critical", "phishing_probable"
    if score >= 60:
        return "high", "phishing_probable"
    if score >= 35:
        return "medium", "suspect"
    return "low", "probably_safe"


def brand_mismatch(domain_info: DomainInfo, text: str) -> str | None:
    lowered = text.lower()
    for brand, tokens in KNOWN_BRANDS.items():
        if brand in lowered and not any(token in domain_info.registered_domain for token in tokens):
            return brand
    return None


def inspect_forms(soup: BeautifulSoup, domain_info: DomainInfo) -> tuple[bool, bool, str, str]:
    forms = soup.find_all("form")
    sensitive_form = False
    external_action = False
    sensitive_details = "Aucun formulaire sensible détecté."
    external_details = "Aucune cible de formulaire externe détectée."
    for form in forms:
        inputs = form.find_all("input")
        types = {((field.get("type") or "text").lower()) for field in inputs}
        names = " ".join((field.get("name") or "") + " " + (field.get("id") or "") for field in inputs).lower()
        if {"password", "email"} & types or re.search(r"(card|cvv|iban|password|email)", names):
            sensitive_form = True
            sensitive_details = "Le HTML contient un formulaire demandant des informations sensibles."
        action = (form.get("action") or "").strip()
        if action.startswith(("http://", "https://")):
            action_host = urlparse(action).hostname or ""
            if action_host and domain_info.registered_domain not in action_host:
                external_action = True
                external_details = f"Le formulaire envoie les données vers {action_host}."
    return sensitive_form, external_action, sensitive_details, external_details


def count_hidden_elements(soup: BeautifulSoup) -> int:
    hidden = 0
    for element in soup.find_all(True):
        style = (element.get("style") or "").replace(" ", "").lower()
        if (
            element.get("type") == "hidden"
            or "display:none" in style
            or "visibility:hidden" in style
            or element.get("hidden") is not None
        ):
            hidden += 1
    return hidden


def has_external_assets(soup: BeautifulSoup, domain_info: DomainInfo) -> tuple[bool, str]:
    suspicious_hosts: set[str] = set()
    selectors = soup.find_all(["link", "img"])
    for element in selectors:
        source = element.get("href") or element.get("src") or ""
        if not source.startswith(("http://", "https://")):
            continue
        host = urlparse(source).hostname or ""
        if host and domain_info.registered_domain not in host:
            suspicious_hosts.add(host)
    if suspicious_hosts:
        sample = ", ".join(sorted(suspicious_hosts)[:3])
        return True, f"Des ressources externes sont chargées depuis {sample}."
    return False, "Les ressources principales semblent provenir du même domaine."


def evaluate_indicators(
    target: NormalizedTarget,
    domain_info: DomainInfo,
    fetch_result: FetchResult | None,
    html: str,
) -> list[IndicatorEvaluation]:
    path_and_query = target.normalized_url.lower()
    subdomain_count = count_subdomains(domain_info.subdomain.split(".")) if domain_info.subdomain else 0
    status_code = fetch_result.status_code if fetch_result else None
    content_analysis_allowed = bool(html and status_code is not None and status_code < 400)
    soup = parse_html(html) if content_analysis_allowed else parse_html("")
    sensitive_form, external_action, sensitive_details, external_details = inspect_forms(soup, domain_info)
    hidden_elements = count_hidden_elements(soup)
    external_assets, external_assets_details = has_external_assets(soup, domain_info)
    mismatch_brand = brand_mismatch(domain_info, soup.get_text(" ", strip=True)[:3000] + " " + (soup.title.string if soup.title and soup.title.string else ""))
    redirected_host = urlparse(fetch_result.final_url).hostname if fetch_result else None

    indicators = [
        IndicatorEvaluation(
            code="http_error_status",
            label="Statut HTTP non valide",
            category="network",
            weight=0,
            detected=bool(status_code is not None and status_code >= 400),
            details=f"La ressource a répondu HTTP {status_code}. Le contenu a été analysé de manière limitée." if status_code is not None and status_code >= 400 else f"Statut HTTP observé : {status_code or 'indisponible'}.",
        ),
        IndicatorEvaluation(
            code="ip_in_url",
            label="Adresse IP utilisée dans l'URL",
            category="url",
            weight=20,
            detected=is_ip_hostname(target.hostname),
            details="L'URL utilise une adresse IP au lieu d'un nom de domaine." if is_ip_hostname(target.hostname) else "Nom de domaine textuel standard.",
        ),
        IndicatorEvaluation(
            code="overly_long_url",
            label="URL anormalement longue",
            category="url",
            weight=8,
            detected=len(target.normalized_url) > 90,
            details=f"Longueur observée : {len(target.normalized_url)} caractères.",
        ),
        IndicatorEvaluation(
            code="too_many_subdomains",
            label="Trop de sous-domaines",
            category="domain",
            weight=8,
            detected=subdomain_count >= 3,
            details=f"Sous-domaines détectés : {subdomain_count}.",
        ),
        IndicatorEvaluation(
            code="suspicious_chars",
            label="Caractères suspects dans l'URL",
            category="url",
            weight=10,
            detected=contains_suspicious_chars(path_and_query),
            details="L'URL contient des motifs ambigus (@, %, doubles séparateurs)." if contains_suspicious_chars(path_and_query) else "Aucun motif ambigu notable.",
        ),
        IndicatorEvaluation(
            code="sensitive_keywords",
            label="Mots sensibles dans l'URL",
            category="url",
            weight=12,
            detected=any(keyword in path_and_query for keyword in SENSITIVE_KEYWORDS),
            details="Des mots souvent utilisés dans les campagnes de phishing sont présents." if any(keyword in path_and_query for keyword in SENSITIVE_KEYWORDS) else "Aucun mot sensible détecté dans l'URL.",
        ),
        IndicatorEvaluation(
            code="suspicious_tld",
            label="Extension de domaine à risque",
            category="domain",
            weight=6,
            detected=domain_info.suffix in SUSPICIOUS_TLDS,
            details=f"Extension observée : .{domain_info.suffix or 'n/a'}.",
        ),
        IndicatorEvaluation(
            code="recent_domain",
            label="Domaine très récent",
            category="domain",
            weight=15,
            detected=(domain_info.age_days is not None and domain_info.age_days < 180),
            details=f"Âge estimé du domaine : {domain_info.age_days} jours." if domain_info.age_days is not None else "Âge du domaine indisponible.",
        ),
        IndicatorEvaluation(
            code="no_https",
            label="Absence de HTTPS",
            category="transport",
            weight=10,
            detected=target.scheme != "https",
            details="La ressource n'utilise pas HTTPS." if target.scheme != "https" else "HTTPS détecté.",
        ),
        IndicatorEvaluation(
            code="password_or_email_form",
            label="Formulaire sensible détecté",
            category="content",
            weight=18,
            detected=sensitive_form,
            details=sensitive_details,
        ),
        IndicatorEvaluation(
            code="external_form_action",
            label="Formulaire vers une cible externe",
            category="content",
            weight=15,
            detected=external_action,
            details=external_details,
        ),
        IndicatorEvaluation(
            code="hidden_elements",
            label="Éléments cachés nombreux",
            category="content",
            weight=8,
            detected=hidden_elements >= 5,
            details=f"{hidden_elements} éléments cachés détectés.",
        ),
        IndicatorEvaluation(
            code="external_assets",
            label="Ressources externes suspectes",
            category="content",
            weight=6,
            detected=external_assets,
            details=external_assets_details,
        ),
        IndicatorEvaluation(
            code="brand_mismatch",
            label="Marque affichée incohérente avec le domaine",
            category="content",
            weight=18,
            detected=bool(mismatch_brand),
            details=f"Le contenu évoque la marque {mismatch_brand} mais le domaine observé est {domain_info.registered_domain}." if mismatch_brand else "Aucune incohérence de marque évidente.",
        ),
        IndicatorEvaluation(
            code="suspicious_redirect",
            label="Redirection vers un autre domaine",
            category="network",
            weight=12,
            detected=bool(fetch_result and redirected_host and domain_info.registered_domain not in redirected_host),
            details=f"URL finale observée : {fetch_result.final_url}." if fetch_result else "Aucune redirection observée.",
        ),
    ]
    return indicators


async def compute_analysis(target_url: str) -> AnalysisComputation:
    target = normalize_url(target_url)
    domain_info = extract_domain_info(target.hostname)
    fetch_result = None
    html = ""
    error_message = None
    try:
        fetch_result = await fetch_html(target.normalized_url)
        html = fetch_result.html
        if fetch_result.status_code is not None and fetch_result.status_code >= 400:
            error_message = (
                f"La ressource a répondu HTTP {fetch_result.status_code}. "
                "Le verdict est fourni avec une analyse de contenu limitée."
            )
    except SecurityError:
        raise
    except Exception as exc:
        logger.warning("Analyse réseau partielle pour %s: %s", target.normalized_url, exc)
        error_message = "Analyse réseau partielle indisponible."

    indicators = evaluate_indicators(target, domain_info, fetch_result, html)
    score = compute_score(indicators)
    risk_level, verdict = classify_risk(score)
    details_json = {
        "target": {
            "hostname": target.hostname,
            "registered_domain": domain_info.registered_domain,
            "domain_age_days": domain_info.age_days,
        },
        "fetch": {
            "final_url": fetch_result.final_url if fetch_result else target.normalized_url,
            "status_code": fetch_result.status_code if fetch_result else None,
            "used_browser_fallback": fetch_result.used_browser_fallback if fetch_result else False,
            "content_analysis_limited": bool(fetch_result and fetch_result.status_code is not None and fetch_result.status_code >= 400),
        },
        "scoring_version": "1.0.0",
    }
    return AnalysisComputation(
        target=target,
        domain_info=domain_info,
        indicators=indicators,
        score=score,
        risk_level=risk_level,
        verdict=verdict,
        http_status=fetch_result.status_code if fetch_result else None,
        redirected_to=fetch_result.final_url if fetch_result and fetch_result.final_url != target.normalized_url else None,
        screenshot_path=None,
        details_json=details_json,
        error_message=error_message,
    )


async def analyze_and_persist(
    session: Session,
    raw_url: str,
    submitted_by_id: int | None,
    requester_ip: str | None,
) -> Analysis:
    start = perf_counter()
    computation = await compute_analysis(raw_url)
    duration_ms = int((perf_counter() - start) * 1000)

    analysis = Analysis(
        submitted_url=computation.target.raw_url,
        normalized_url=computation.target.normalized_url,
        domain=computation.domain_info.registered_domain,
        scheme=computation.target.scheme,
        score=computation.score,
        risk_level=computation.risk_level,
        verdict=computation.verdict,
        details_json=computation.details_json,
        analysis_started_at=datetime.utcnow(),
        analysis_finished_at=datetime.utcnow(),
        duration_ms=duration_ms,
        status="completed" if not computation.error_message else "partial",
        error_message=computation.error_message,
        http_status=computation.http_status,
        redirected_to=computation.redirected_to,
        screenshot_path=computation.screenshot_path,
        submitted_by_id=submitted_by_id,
    )
    session.add(analysis)
    session.flush()
    for indicator in computation.indicators:
        session.add(IndicatorResult(analysis_id=analysis.id, **asdict(indicator)))
    session.add(
        AuditLog(
            actor_id=submitted_by_id,
            action="analysis.created",
            target_type="analysis",
            target_id=str(analysis.id),
            ip_address=requester_ip,
            metadata_json={"score": computation.score, "verdict": computation.verdict},
        )
    )
    session.commit()
    session.refresh(analysis)
    return analysis
