"""Align existing RBAC defaults and remove an undocumented index."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_customer_addresses_user_id", table_name="customer_addresses")
    op.alter_column(
        "branches",
        "is_active",
        existing_type=sa.Boolean(),
        server_default=sa.text("true"),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "is_active",
        existing_type=sa.Boolean(),
        server_default=sa.text("true"),
        existing_nullable=False,
    )
    op.alter_column(
        "customer_addresses",
        "is_default",
        existing_type=sa.Boolean(),
        server_default=sa.text("false"),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "customer_addresses",
        "is_default",
        existing_type=sa.Boolean(),
        server_default=None,
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "is_active",
        existing_type=sa.Boolean(),
        server_default=None,
        existing_nullable=False,
    )
    op.alter_column(
        "branches",
        "is_active",
        existing_type=sa.Boolean(),
        server_default=None,
        existing_nullable=False,
    )
    op.create_index(
        "ix_customer_addresses_user_id",
        "customer_addresses",
        ["user_id"],
        unique=False,
    )
