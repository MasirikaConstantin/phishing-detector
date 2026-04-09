from app.core.security import NormalizedTarget
from app.services.analysis_engine import IndicatorEvaluation, classify_risk, compute_score, evaluate_indicators
from app.services.domain_tools import DomainInfo
from app.services.html_fetcher import FetchResult


def test_compute_score_caps_to_100():
    indicators = [
        IndicatorEvaluation("a", "A", "url", 60, True, ""),
        IndicatorEvaluation("b", "B", "content", 60, True, ""),
    ]
    assert compute_score(indicators) == 100


def test_classify_risk_levels():
    assert classify_risk(10) == ("low", "probably_safe")
    assert classify_risk(45) == ("medium", "suspect")
    assert classify_risk(65) == ("high", "phishing_probable")
    assert classify_risk(85) == ("critical", "phishing_probable")


def test_404_limits_content_analysis():
    target = NormalizedTarget(
        raw_url="https://example.com/login",
        normalized_url="https://example.com/login",
        hostname="example.com",
        scheme="https",
    )
    domain_info = DomainInfo(
        hostname="example.com",
        subdomain="",
        domain="example",
        suffix="com",
        registered_domain="example.com",
        age_days=365,
    )
    fetch_result = FetchResult(
        final_url="https://example.com/login",
        status_code=404,
        html='<html><head><link href="https://fonts.googleapis.com/css2"></head><body>Not found</body></html>',
        headers={"content-type": "text/html"},
    )

    indicators = evaluate_indicators(target, domain_info, fetch_result, fetch_result.html)
    by_code = {indicator.code: indicator for indicator in indicators}

    assert by_code["http_error_status"].detected is True
    assert by_code["external_assets"].detected is False
