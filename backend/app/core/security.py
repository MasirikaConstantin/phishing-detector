import ipaddress
import re
import socket
from dataclasses import dataclass
from typing import Iterable
from urllib.parse import urlparse, urlunparse


PRIVATE_LABELS = {"localhost", "0.0.0.0"}
URL_MAX_LENGTH = 2048
ALLOWED_SCHEMES = {"http", "https"}


class SecurityError(ValueError):
    pass


@dataclass(slots=True)
class NormalizedTarget:
    raw_url: str
    normalized_url: str
    hostname: str
    scheme: str


def normalize_url(raw_url: str) -> NormalizedTarget:
    if not raw_url or len(raw_url) > URL_MAX_LENGTH:
        raise SecurityError("URL manquante ou trop longue.")

    trimmed = raw_url.strip()
    if "://" not in trimmed:
        trimmed = f"https://{trimmed}"

    parsed = urlparse(trimmed)
    scheme = parsed.scheme.lower()
    if scheme not in ALLOWED_SCHEMES:
        raise SecurityError("Seules les URLs HTTP et HTTPS sont autorisées.")

    if not parsed.hostname:
        raise SecurityError("URL invalide : domaine introuvable.")

    if parsed.username or parsed.password:
        raise SecurityError("Les identifiants dans l'URL sont interdits.")

    netloc = parsed.hostname.lower()
    if parsed.port:
        netloc = f"{netloc}:{parsed.port}"

    normalized = parsed._replace(
        scheme=scheme,
        netloc=netloc,
        fragment="",
    )

    normalized_url = urlunparse(normalized)
    ensure_public_target(parsed.hostname)
    return NormalizedTarget(
        raw_url=raw_url,
        normalized_url=normalized_url,
        hostname=parsed.hostname.lower(),
        scheme=scheme,
    )


def ensure_public_target(hostname: str) -> None:
    lowered = hostname.lower().strip(".")
    if lowered in PRIVATE_LABELS:
        raise SecurityError("Les hôtes locaux sont interdits.")

    if lowered.startswith("127.") or lowered == "::1":
        raise SecurityError("Les adresses loopback sont interdites.")

    if lowered.startswith("file"):
        raise SecurityError("Les fichiers locaux sont interdits.")

    for address in resolve_addresses(hostname):
        if is_private_ip(address):
            raise SecurityError("Les réseaux privés et réservés sont interdits.")


def resolve_addresses(hostname: str) -> set[str]:
    try:
        infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise SecurityError("Résolution DNS impossible pour cette URL.") from exc
    return {info[4][0] for info in infos}


def is_private_ip(value: str) -> bool:
    try:
        ip = ipaddress.ip_address(value)
    except ValueError:
        return False
    return any(
        (
            ip.is_private,
            ip.is_loopback,
            ip.is_link_local,
            ip.is_multicast,
            ip.is_reserved,
            ip.is_unspecified,
        )
    )


def is_ip_hostname(hostname: str) -> bool:
    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def contains_suspicious_chars(url: str) -> bool:
    return bool(re.search(r"[@%]|--|_{2,}|%[0-9a-fA-F]{2}", url))


def count_subdomains(parts: Iterable[str]) -> int:
    return len([part for part in parts if part])
