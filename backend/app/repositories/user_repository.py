
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.models.rbac import User


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.user_id == user_id)
        return self.db.scalar(stmt)

    def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return self.db.scalar(stmt)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.scalar(stmt)

    def get_by_login(self, login: str) -> User | None:
        stmt = select(User).where(
            or_(
                User.username == login,
                User.email == login
            )
        )
        return self.db.scalar(stmt)

    def add(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user
