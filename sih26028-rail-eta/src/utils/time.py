from datetime import datetime, timezone
import pytz
from src.config import settings

IST = pytz.timezone(settings.APP_TIMEZONE)


def utc_now() -> datetime:
    """Always use aware UTC timestamps for database insertions."""
    return datetime.now(timezone.utc)


def utc_to_ist(dt: datetime) -> datetime:
    """Converts a UTC datetime object to Indian Standard Time (IST)."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST)


def ist_to_utc(dt: datetime) -> datetime:
    """Converts an IST datetime object to UTC for storage."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = IST.localize(dt)
    return dt.astimezone(timezone.utc)