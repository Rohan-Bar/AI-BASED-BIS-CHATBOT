from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
import os
from database import get_db
import models
from schemas import SignupRequest, LoginRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"])
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-fallback")


@router.post("/signup", response_model=AuthResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    exists = db.query(models.User).filter(models.User.email == body.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=body.name,
        email=body.email,
        hashed_password=pwd_context.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = jwt.encode({"user_id": user.id}, SECRET_KEY, algorithm="HS256")
    return AuthResponse(token=token, user={"id": user.id, "name": user.name, "email": user.email})


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not pwd_context.verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = jwt.encode({"user_id": user.id}, SECRET_KEY, algorithm="HS256")
    return AuthResponse(token=token, user={"id": user.id, "name": user.name, "email": user.email})
