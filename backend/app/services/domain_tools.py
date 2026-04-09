from dataclasses import dataclass
from datetime import datetime, timezone

import tldextract

try:
    import whois
except ImportError:  # pragma: no cover
    whois = None


SUSPICIOUS_TLDS = {"zip", "review", "top", "xyz", "click", "country", "kim", "gq"}


@dataclass(slots=True)
class DomainInfo:
    hostname: str
    subdomain: str
    domain: str
    suffix: str
    registered_domain: str
    age_days: int | None


def extract_domain_info(hostname: str) -> DomainInfo:
    extracted = tldextract.extract(hostname)
    registered_domain = ".".join(part for part in [extracted.domain, extracted.suffix] if part)
    return DomainInfo(
        hostname=hostname,
        subdomain=extracted.subdomain,
        domain=extracted.domain,
        suffix=extracted.suffix,
        registered_domain=registered_domain or hostname,
        age_days=get_domain_age_days(hostname),
    )


def get_domain_age_days(hostname: str) -> int | None:
    if whois is None:
        return None
    try:
        data = whois.whois(hostname)
    except Exception:
        return None

    created = data.creation_date
    if isinstance(created, list):
        created = created[0]
    if not isinstance(created, datetime):
        return None
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    delta = datetime.now(timezone.utc) - created
    return max(delta.days, 0)
