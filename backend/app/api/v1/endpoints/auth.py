from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.auth_service import AuthService

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.rbac import User, Role, UserRole
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserProfileResponse,
    UpdateProfileRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication (UC01, UC02, UC03)"])


def _build_user_profile(user: User) -> UserProfileResponse:
    roles = [ur.role.role_name for ur in user.user_roles]
    branch_ids = [ba.branch_id for ba in user.branch_accesses]
    return UserProfileResponse(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        roles=roles,
        branch_ids=branch_ids,
        created_at=user.created_at,
    )

@router.post(
    "/register", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED
)
def register_customer(payload: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)

    user = service.register_customer(
        username=payload.username,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        phone=payload.phone,
        password_hash_func=hash_password,
    )

    return _build_user_profile(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter((User.username == payload.username) | (User.email == payload.username))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai ten dang nhap hoac mat khau",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tai khoan da bi vo hieu hoa",
        )

    roles = [ur.role.role_name for ur in user.user_roles]
    branch_ids = [ba.branch_id for ba in user.branch_accesses]

    token = create_access_token(
        data={
            "sub": str(user.user_id),
            "username": user.username,
            "roles": roles,
            "branch_ids": branch_ids,
        }
    )

    return TokenResponse(
        access_token=token,
        user_id=user.user_id,
        username=user.username,
        roles=roles,
        branch_ids=branch_ids,
    )


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return _build_user_profile(current_user)


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone

    db.commit()
    db.refresh(current_user)
    return _build_user_profile(current_user)
