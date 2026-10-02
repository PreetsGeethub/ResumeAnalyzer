import jwt
import os
import secrets

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from models.refresh_token import RefreshToken

from .auth_services import hash_password,verify_password


def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    token = jwt.encode(
        payload,
        os.getenv("SECRET_KEY"),
        algorithm=os.getenv("ALGORITHM")
    )

    return token


def create_refresh_token(db: Session, user_id: int):
    token = secrets.token_urlsafe(32)

    refresh_token_hash = hash_password(token)

    db_refresh_token = RefreshToken(
        user_id=user_id,
        token_hash=refresh_token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )

    db.add(db_refresh_token)
    db.commit()

    return token


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        token = jwt.decode(
            access_token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    try:
        user_id = int(token["sub"])
    except (KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user



def refresh_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )

    # Find a non-revoked refresh token
    refresh_tokens = (
        db.query(RefreshToken)
        .filter(RefreshToken.revoked == False)
        .all()
    )

    db_refresh_token = None

    for stored_token in refresh_tokens:
        if verify_password(
            refresh_token,
            stored_token.token_hash
        ):
            db_refresh_token = stored_token
            break

    if not db_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Check expiration
    expires_at = db_refresh_token.expires_at.replace(
        tzinfo=timezone.utc
    )

    if expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )

    # Revoke the old refresh token
    db_refresh_token.revoked = True

    # Create a new refresh token
    new_refresh_token = secrets.token_urlsafe(32)

    new_refresh_token_hash = hash_password(
        new_refresh_token
    )

    new_db_refresh_token = RefreshToken(
        user_id=db_refresh_token.user_id,
        token_hash=new_refresh_token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )

    db.add(new_db_refresh_token)

    # Create a new access token
    new_access_token = create_access_token(
        db_refresh_token.user_id
    )

    db.commit()

    return new_access_token, new_refresh_token