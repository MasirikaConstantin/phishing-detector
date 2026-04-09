from app.services.analysis_engine import IndicatorEvaluation, classify_risk, compute_score


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
