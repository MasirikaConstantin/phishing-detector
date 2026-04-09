import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    salt_hex, digest_hex = stored_hash.split(":")
    candidate = hash_password(password, bytes.fromhex(salt_hex))
    return hmac.compare_digest(candidate, stored_hash)


def create_token(user: User) -> tuple[str, int]:
    settings = get_settings()
    expires_in = settings.jwt_exp_minutes * 60
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role.value,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=expires_in),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, expires_in


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def authenticate(session: Session, username: str, password: str, ip_address: str | None) -> User | None:
    statement = select(User).where(User.username == username, User.is_active.is_(True))
    user = session.scalar(statement)
    if user is None or not verify_password(password, user.password_hash):
        return None

    user.last_login_at = datetime.utcnow()
    session.add(
        AuditLog(
            actor_id=user.id,
            action="auth.login",
            target_type="user",
            target_id=str(user.id),
            ip_address=ip_address,
            metadata_json={"role": user.role.value},
        )
    )
    session.commit()
    return user


def ensure_default_users(session: Session) -> None:
    for username, email, role in [
        ("admin", "admin@phishing-detector.local", UserRole.ADMIN),
        ("analyst", "analyst@phishing-detector.local", UserRole.USER),
    ]:
        existing = session.scalar(select(User).where(User.username == username))
        if existing:
            continue
        session.add(
            User(
                username=username,
                email=email,
                role=role,
                password_hash=hash_password("Admin123!"),
            )
        )
    session.commit()
