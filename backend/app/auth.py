from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def get_session_expiry(days: int = 30) -> datetime:
    """Generate session expiry date (default 30 days)"""
    return datetime.utcnow() + timedelta(days=days)
