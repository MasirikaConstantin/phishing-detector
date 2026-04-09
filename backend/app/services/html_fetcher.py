import logging
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.core.security import ensure_public_target

logger = logging.getLogger("app.fetcher")


@dataclass(slots=True)
class FetchResult:
    final_url: str
    status_code: int | None
    html: str
    headers: dict[str, str]
    used_browser_fallback: bool = False


async def fetch_html(url: str) -> FetchResult:
    settings = get_settings()
    timeout = httpx.Timeout(settings.request_timeout_seconds)
    headers = {"User-Agent": settings.user_agent}
    async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
        response = await client.get(url)
        ensure_public_target(httpx.URL(str(response.url)).host or "")
        content_type = response.headers.get("content-type", "")
        html = response.text if "html" in content_type else ""
        if len(html.encode("utf-8")) > settings.max_content_length_bytes:
            html = html[: settings.max_content_length_bytes]
        if not html and settings.use_playwright_fallback:
            fallback_html = await fetch_with_playwright(url)
            if fallback_html:
                return FetchResult(
                    final_url=str(response.url),
                    status_code=response.status_code,
                    html=fallback_html,
                    headers=dict(response.headers),
                    used_browser_fallback=True,
                )
        return FetchResult(
            final_url=str(response.url),
            status_code=response.status_code,
            html=html,
            headers=dict(response.headers),
        )


async def fetch_with_playwright(url: str) -> str:
    try:
        from playwright.async_api import async_playwright
    except Exception:  # pragma: no cover
        logger.warning("Playwright indisponible pour le fallback navigateur.")
        return ""

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            page = await browser.new_page(user_agent=get_settings().user_agent)
            await page.goto(url, wait_until="networkidle", timeout=15_000)
            html = await page.content()
            await browser.close()
            return html
    except Exception as exc:  # pragma: no cover
        logger.warning("Fallback Playwright en échec: %s", exc)
        return ""


def parse_html(html: str) -> BeautifulSoup:
    return BeautifulSoup(html or "", "html.parser")
