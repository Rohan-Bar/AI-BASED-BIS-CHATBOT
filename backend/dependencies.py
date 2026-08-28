from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from database import get_db
import models
from routers.auth import SECRET_KEY

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> models.User | None:
    """Returns the logged-in user, or None if no/wrong token.
    Use where login is OPTIONAL."""
    if credentials is None:
        return None
    return _decode(credentials.credentials, db)


def require_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: Session = Depends(get_db),
) -> models.User:
    """Returns the logged-in user or 401. Use where login is MANDATORY."""
    return _decode(credentials.credentials, db)


def _decode(token: str, db: Session) -> models.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
