from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, Session as UserSession
from app.auth import hash_password, verify_password, generate_session_token, get_session_expiry

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: str

# Dependency to get current user from session token
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    # Find session
    session = db.query(UserSession).filter(
        UserSession.session_token == token,
        UserSession.expires_at > datetime.utcnow()
    ).first()

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    # Get user
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create session
    session_token = generate_session_token()
    session = UserSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=get_session_expiry(30)  # 30 days
    )
    db.add(session)
    db.commit()

    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "created_at": user.created_at.isoformat()
        },
        "session_token": session_token,
        "expires_at": session.expires_at.isoformat()
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user and create session"""
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is inactive")

    # Update last login
    user.last_login = datetime.utcnow()

    # Create new session
    session_token = generate_session_token()
    session = UserSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=get_session_expiry(30)  # 30 days
    )
    db.add(session)
    db.commit()

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "created_at": user.created_at.isoformat()
        },
        "session_token": session_token,
        "expires_at": session.expires_at.isoformat()
    }

@router.post("/logout")
def logout(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Logout user by deleting session"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    # Delete session
    session = db.query(UserSession).filter(UserSession.session_token == token).first()
    if session:
        db.delete(session)
        db.commit()

    return {
        "success": True,
        "message": "Logged out successfully"
    }

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at.isoformat(),
            "last_login": current_user.last_login.isoformat() if current_user.last_login else None
        }
    }

@router.post("/refresh")
def refresh_session(current_user: User = Depends(get_current_user), authorization: str = Header(None), db: Session = Depends(get_db)):
    """Refresh session token (extend expiry)"""
    token = authorization.replace("Bearer ", "")

    session = db.query(UserSession).filter(UserSession.session_token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Session not found")

    # Extend session
    session.expires_at = get_session_expiry(30)
    db.commit()

    return {
        "success": True,
        "message": "Session refreshed",
        "expires_at": session.expires_at.isoformat()
    }
