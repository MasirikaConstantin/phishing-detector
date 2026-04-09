from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        env_prefix="APP_",
    )

    app_name: str = "Phishing Detector API"
    environment: Literal["development", "test", "production"] = "development"
    debug: bool = True
    django_secret_key: str = "change-me-in-production"
    jwt_secret_key: str = "change-me-too"
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 120
    time_zone: str = "UTC"
    allowed_hosts: list[str] = Field(default_factory=lambda: ["*"])
    frontend_origin: str = "http://localhost:3000"

    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_database: str = "phishing_detector"
    mysql_user: str = "phishing_user"
    mysql_password: str = "phishing_pass"

    sqlalchemy_database_url: str = (
        "mysql+pymysql://phishing_user:phishing_pass@localhost:3306/phishing_detector"
    )

    request_timeout_seconds: float = 8.0
    max_content_length_bytes: int = 500_000
    user_agent: str = "PhishingDetectorBot/1.0 (+academic-project)"
    rate_limit_analyze_per_minute: int = 12
    rate_limit_login_per_minute: int = 30
    use_playwright_fallback: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
