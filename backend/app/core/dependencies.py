import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.rbac import User
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Khong the xac thuc nguoi dung",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            options={"require": ["sub", "exp"]},
        )

        user_id = int(payload["sub"])

    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise unauthorized from None

    repository = UserRepository(db)
    user = repository.get_by_id(user_id)

    if user is None:
        raise unauthorized

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tai khoan da bi vo hieu hoa",
        )


    return user

def require_role(*allowed_roles: str):
    """Kiểm tra người dùng có ít nhất một vai trò được phép."""

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        user_roles = {
            user_role.role.role_name
            for user_role in current_user.user_roles
        }

        if not user_roles.intersection(allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ban khong co quyen thuc hien thao tac nay",
            )

        return current_user

    return role_checker

def require_branch_access(
    branch_id: int,
    current_user: User = Depends(require_role("ADMIN", "STAFF")),
) -> User:
    """Kiểm tra quyền truy cập chi nhánh của ADMIN hoặc STAFF."""

    user_roles = {
        user_role.role.role_name
        for user_role in current_user.user_roles
    }

    # ADMIN được truy cập tất cả chi nhánh
    if "ADMIN" in user_roles:
        return current_user

    # STAFF chỉ được truy cập chi nhánh được phân công
    allowed_branch_ids = {
        access.branch_id
        for access in current_user.branch_accesses
    }

    if branch_id not in allowed_branch_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ban khong co quyen truy cap chi nhanh nay",
        )

    return current_user
