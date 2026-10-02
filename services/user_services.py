from fastapi import HTTPException, status, Request, Response
from sqlalchemy.orm import Session
import jwt
from models.refresh_token import RefreshToken
from models.user import  User as UserModel
from schemas.user import UserCreate, UserUpdate, UserLogin
from .auth_services import hash_password, verify_password
from .token_services import create_access_token, create_refresh_token



def create_user(user: UserCreate, db: Session):
    hashed_password = hash_password(user.password)

    db_user = UserModel(
        name=user.name,
        email=user.email,
        age=user.age,
        password_hash=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def get_users(limit: int, db: Session, skip: int = 0):

    users = (
        db.query(UserModel)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return users


def get_user_by_id(user_id: int, db: Session):

    user = (
        db.query(UserModel)
        .filter(UserModel.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )

    return user


def update_user(user_id: int, user: UserUpdate, db: Session):

    db_user = (
        db.query(UserModel)
        .filter(UserModel.id == user_id)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )

    update_data = user.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(user_id: int, db: Session):

    db_user = (
        db.query(UserModel)
        .filter(UserModel.id == user_id)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )

    db.delete(db_user)
    db.commit()

    return True

def login_user(user: UserLogin, db: Session):
 
    db_user = (
        db.query(UserModel)
        .filter(UserModel.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token = create_access_token(db_user.id)
    refresh_token = create_refresh_token(db, db_user.id)
    return {
    "access_token": access_token,
    "refresh_token": refresh_token,
    "token_type": "bearer"
    }
    
def logout_user(
    request: Request,
    response: Response,
    db: Session
):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        refresh_tokens = (
            db.query(RefreshToken)
            .filter(RefreshToken.revoked == False)
            .all()
        )

        for stored_token in refresh_tokens:
            if verify_password(
                refresh_token,
                stored_token.token_hash
            ):
                stored_token.revoked = True
                break

        db.commit()

    response.delete_cookie(
        key="access_token"
    )

    response.delete_cookie(
        key="refresh_token"
    )


