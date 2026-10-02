import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from db.database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate
from services.token_services import get_current_user, refresh_access_token
from services.user_services import (
    create_user,
    delete_user,
    get_user_by_id,
    get_users,
    login_user,
    logout_user,
    update_user,
)

router = APIRouter()


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_endpoint(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(user, db)


@router.get(
    "/users",
    response_model=list[UserResponse],
)
def get_users_endpoint(
    limit: int = 10,
    skip: int = 0,
    db: Session = Depends(get_db),
):
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip cannot be negative",
        )

    return get_users(limit, db, skip)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
)
def get_user_by_id_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
):
    return get_user_by_id(user_id, db)


@router.patch(
    "/users/{user_id}",
    response_model=UserResponse,
)
def update_user_endpoint(
    user: UserUpdate,
    user_id: int,
    db: Session = Depends(get_db),
):
    return update_user(user_id, user, db)


def set_auth_cookies(response: Response, tokens: dict):
    is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=15 * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )


@router.post("/users/login")
def login_user_endpoint(
    response: Response,
    user: UserLogin,
    db: Session = Depends(get_db),
):
    tokens = login_user(user, db)
    set_auth_cookies(response, tokens)
    return {"message": "Login successful"}


@router.post("/users/refresh")
def refresh_token_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    access_token, refresh_token = refresh_access_token(request=request, db=db)
    set_auth_cookies(
        response,
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
        },
    )
    return {"message": "Access token refreshed"}


@router.post("/users/logout")
def logout_user_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    logout_user(request, response, db)
    return {"message": "Logout successful"}


@router.get("/test-auth")
def test_auth(current_user=Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user_id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
    }


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
):
    delete_user(user_id, db)
