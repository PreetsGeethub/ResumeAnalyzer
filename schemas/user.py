from pydantic import BaseModel, ConfigDict, Field


class User(BaseModel):
    name: str
    email: str
    age: int = Field(..., ge=18, le=100)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int | None = Field(None, ge=18, le=100)

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    age: int | None = Field(None, ge=18, le=100)
class UserCreate(BaseModel):
    name: str
    email: str
    age: int | None = Field(None, ge=18, le=100)
    password: str
    
class UserLogin(BaseModel):
    email: str
    password: str
    
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str