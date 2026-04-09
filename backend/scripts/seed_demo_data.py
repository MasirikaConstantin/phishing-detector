from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.indicator_result import IndicatorResult
from app.models.user import User
from app.db.session import get_engine


SAMPLES = [
    {
        "submitted_url": "http://198.51.100.24/login/verify",
        "normalized_url": "http://198.51.100.24/login/verify",
        "domain": "198.51.100.24",
        "scheme": "http",
        "score": 82,
        "risk_level": "critical",
        "verdict": "phishing_probable",
        "status": "completed",
        "duration_ms": 1420,
        "indicators": [
            ("ip_in_url", "Adresse IP utilisée dans l'URL", "url", 20, True, "Adresse IP directe utilisée."),
            ("sensitive_keywords", "Mots sensibles dans l'URL", "url", 12, True, "Présence du mot verify."),
            ("no_https", "Absence de HTTPS", "transport", 10, True, "HTTP utilisé."),
            ("password_or_email_form", "Formulaire sensible détecté", "content", 18, True, "Formulaire avec mot de passe."),
            ("brand_mismatch", "Marque affichée incohérente avec le domaine", "content", 18, True, "Référence à PayPal sur une IP."),
        ],
    },
    {
        "submitted_url": "https://portal-microsoft-secure-review.xyz/account/update",
        "normalized_url": "https://portal-microsoft-secure-review.xyz/account/update",
        "domain": "portal-microsoft-secure-review.xyz",
        "scheme": "https",
        "score": 71,
        "risk_level": "high",
        "verdict": "phishing_probable",
        "status": "completed",
        "duration_ms": 1890,
        "indicators": [
            ("suspicious_tld", "Extension de domaine à risque", "domain", 6, True, "Extension .xyz."),
            ("too_many_subdomains", "Trop de sous-domaines", "domain", 8, True, "Arborescence excessive."),
            ("sensitive_keywords", "Mots sensibles dans l'URL", "url", 12, True, "Présence de secure et update."),
            ("brand_mismatch", "Marque affichée incohérente avec le domaine", "content", 18, True, "Référence à Microsoft."),
            ("external_form_action", "Formulaire vers une cible externe", "content", 15, True, "Action externe observée."),
        ],
    },
    {
        "submitted_url": "https://www.openai.com",
        "normalized_url": "https://www.openai.com",
        "domain": "openai.com",
        "scheme": "https",
        "score": 0,
        "risk_level": "low",
        "verdict": "probably_safe",
        "status": "completed",
        "duration_ms": 620,
        "indicators": [
            ("overly_long_url", "URL anormalement longue", "url", 8, False, "URL courte."),
            ("no_https", "Absence de HTTPS", "transport", 10, False, "HTTPS détecté."),
            ("brand_mismatch", "Marque affichée incohérente avec le domaine", "content", 18, False, "Cohérence observée."),
        ],
    },
]


def main() -> None:
    engine = get_engine()
    with Session(engine) as session:
        existing = session.scalar(select(Analysis.id).limit(1))
        if existing:
            print("Des analyses existent déjà, seed ignoré.")
            return

        admin = session.scalar(select(User).where(User.username == "admin"))
        now = datetime.utcnow()
        for offset, sample in enumerate(SAMPLES):
            analysis = Analysis(
                submitted_url=sample["submitted_url"],
                normalized_url=sample["normalized_url"],
                domain=sample["domain"],
                scheme=sample["scheme"],
                score=sample["score"],
                risk_level=sample["risk_level"],
                verdict=sample["verdict"],
                status=sample["status"],
                duration_ms=sample["duration_ms"],
                analysis_started_at=now - timedelta(days=offset, minutes=1),
                analysis_finished_at=now - timedelta(days=offset),
                details_json={"seeded": True, "scoring_version": "1.0.0"},
                submitted_by_id=admin.id if admin else None,
            )
            session.add(analysis)
            session.flush()
            for code, label, category, weight, detected, details in sample["indicators"]:
                session.add(
                    IndicatorResult(
                        analysis_id=analysis.id,
                        code=code,
                        label=label,
                        category=category,
                        weight=weight,
                        detected=detected,
                        details=details,
                    )
                )
        session.commit()
        print("Données de démonstration insérées.")


if __name__ == "__main__":
    main()
