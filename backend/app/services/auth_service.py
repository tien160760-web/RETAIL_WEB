
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.rbac import User, Role, UserRole
from app.repositories.user_repository import UserRepository
from app.core.exceptions import AppException


class AuthService:

    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def register_customer(
        self,
        username: str,
        email: str,
        password: str,
        full_name: str,
        phone: str | None,
        password_hash_func,
    ) -> User:

        # 1. Kiểm tra tài khoản đã tồn tại hay chưa
        if self.user_repository.get_by_username(username):
            raise AppException(
                code="USERNAME_ALREADY_EXISTS",
                message="Tên đăng nhập đã được sử dụng",
                status_code=409,
        )   

        if self.user_repository.get_by_email(email):
            raise AppException(
                code="EMAIL_ALREADY_EXISTS",
                message="Email đã được sử dụng",
                status_code=409,
            )

        # 2. Kiểm tra vai trò CUSTOMER
        customer_role = self.db.scalar(
            select(Role).where(Role.role_name == "CUSTOMER")
        )

        if customer_role is None:
            raise AppException(
            code="CUSTOMER_ROLE_NOT_FOUND",
            message="Hệ thống chưa được cấu hình vai trò khách hàng",
            status_code=500,
    )

        # 3. Tạo tài khoản
        user = User(
            username=username,
            email=email,
            password_hash=password_hash_func(password),
            full_name=full_name,
            phone=phone,
            is_active=True,
        )

        try:
            self.user_repository.add(user)

            # 4. Gán vai trò CUSTOMER
            self.db.add(
                UserRole(
                    user_id=user.user_id,
                    role_id=customer_role.role_id,
                )
            )

            # 5. Lưu toàn bộ transaction
            self.db.commit()
            self.db.refresh(user)

            return user

        except IntegrityError:
            self.db.rollback()
            raise AppException(
                code="ACCOUNT_CONFLICT",
                message="Tên đăng nhập hoặc email đã được sử dụng",
                status_code=409,
    )

        except Exception:
            self.db.rollback()
            raise
