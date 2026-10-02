from fastapi import APIRouter, Depends, HTTPException, status,  Response, Request
from sqlalchemy.orm import Session

from db.database import get_db
from schemas.user import User, UserResponse, UserUpdate, UserCreate, UserLogin, Token
from services.user_services import (
    create_user,
    delete_user,
    get_user_by_id,
    get_users,
    update_user,
    login_user,
    logout_user,
    
)
from services.token_services import get_current_user, refresh_access_token
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
router = APIRouter()


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_endpoint(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(user, db)


@router.get(
    "/users",
    response_model=list[UserResponse]
)
def get_users_endpoint(
    limit: int,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    return get_users(limit, db, skip)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse
)
def get_user_by_id_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_user_by_id(user_id, db)


@router.patch(
    "/users/{user_id}",
    response_model=UserResponse
)
def update_user_endpoint(
    user: UserUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    return update_user(user_id, user, db)



@router.post("/users/login", status_code=status.HTTP_200_OK)
def login_user_endpoint(
    response: Response,
    user: UserLogin,
    db: Session = Depends(get_db)
):
    tokens = login_user(user, db)

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=15 * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )

    return {"message": "Login successful"}
@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    delete_user(user_id, db)

@router.get("/test-auth")
@router.get("/test-auth")
def test_auth(current_user=Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user_id": current_user.id,
        "email": current_user.email,
        "name": current_user.name
    }
    
@router.post("/users/refresh")
@router.post("/users/refresh")
def refresh_token_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    access_token, refresh_token = refresh_access_token(
        request=request,
        db=db
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=15 * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )

    return {
        "message": "Access token refreshed"
    }
    
@router.post("/users/logout")
def logout_user_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    logout_user(request, response, db)
    return {"message": "Logout successful"}