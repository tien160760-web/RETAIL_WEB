"""Add non-negative checks for catalog prices."""

from typing import Sequence, Union

from alembic import op


revision: str = "009"
down_revision: Union[str, None] = "008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "chk_products_base_price_non_negative",
        "products",
        "base_price >= 0",
    )
    op.create_check_constraint(
        "chk_product_variants_price_non_negative",
        "product_variants",
        "price >= 0",
    )
    op.create_check_constraint(
        "chk_product_variants_cost_price_non_negative",
        "product_variants",
        "cost_price >= 0",
    )


def downgrade() -> None:
    op.drop_constraint(
        "chk_product_variants_cost_price_non_negative",
        "product_variants",
        type_="check",
    )
    op.drop_constraint(
        "chk_product_variants_price_non_negative",
        "product_variants",
        type_="check",
    )
    op.drop_constraint(
        "chk_products_base_price_non_negative",
        "products",
        type_="check",
    )
