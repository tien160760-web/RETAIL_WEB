from datetime import datetime
from sqlalchemy import DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    metadata = MetaData(
        naming_convention={
            "pk": "%(table_name)s_pkey",
            "uq": "%(table_name)s_%(column_0_name)s_key",
            "ck": "%(constraint_name)s",
            "fk": "%(table_name)s_%(column_0_name)s_fkey",
            "ix": "ix_%(table_name)s_%(column_0_name)s",
        }
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
