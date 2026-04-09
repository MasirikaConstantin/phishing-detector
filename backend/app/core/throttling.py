from dataclasses import dataclass
from time import time

from django.core.cache import cache


@dataclass(slots=True)
class ThrottleResult:
    allowed: bool
    remaining: int
    reset_in_seconds: int


def check_rate_limit(key: str, limit: int, window_seconds: int = 60) -> ThrottleResult:
    current = int(time())
    bucket = current // window_seconds
    cache_key = f"rate:{key}:{bucket}"
    hits = cache.get(cache_key, 0) + 1
    cache.set(cache_key, hits, timeout=window_seconds)
    allowed = hits <= limit
    remaining = max(limit - hits, 0)
    reset_in_seconds = window_seconds - (current % window_seconds)
    return ThrottleResult(allowed=allowed, remaining=remaining, reset_in_seconds=reset_in_seconds)
