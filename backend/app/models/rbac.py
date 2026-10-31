from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Branch(Base, TimestampMixin):
    __tablename__ = "branches"

    branch_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    branch_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    branch_name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user_accesses: Mapped[list["UserBranchAccess"]] = relationship(
        back_populates="branch", cascade="all, delete-orphan"
    )


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    role_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    role_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user_roles: Mapped[list["UserRole"]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )
    role_permissions: Mapped[list["RolePermission"]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )


class Permission(Base):
    __tablename__ = "permissions"

    permission_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    permission_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    permission_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    role_permissions: Mapped[list["RolePermission"]] = relationship(
        back_populates="permission", cascade="all, delete-orphan"
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user_roles: Mapped[list["UserRole"]] = relationship(
        back_populates="user",
        foreign_keys="[UserRole.user_id]",
        cascade="all, delete-orphan",
    )
    branch_accesses: Mapped[list["UserBranchAccess"]] = relationship(
        back_populates="user",
        foreign_keys="[UserBranchAccess.user_id]",
        cascade="all, delete-orphan",
    )


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.role_id", ondelete="CASCADE"), primary_key=True
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    assigned_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="user_roles", foreign_keys=[user_id])
    role: Mapped["Role"] = relationship(back_populates="user_roles")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.role_id", ondelete="CASCADE"), primary_key=True
    )
    permission_id: Mapped[int] = mapped_column(
        ForeignKey("permissions.permission_id", ondelete="CASCADE"), primary_key=True
    )

    role: Mapped["Role"] = relationship(back_populates="role_permissions")
    permission: Mapped["Permission"] = relationship(back_populates="role_permissions")


class UserBranchAccess(Base):
    __tablename__ = "user_branch_access"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True
    )
    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.branch_id", ondelete="CASCADE"), primary_key=True
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    assigned_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="branch_accesses", foreign_keys=[user_id])
    branch: Mapped["Branch"] = relationship(back_populates="user_accesses")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
