from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.catalog import Product, ProductVariant


def _lock_product(session: Session, product_id: int) -> Product:
    product = session.scalar(
        select(Product)
        .where(Product.product_id == product_id)
        .with_for_update()
    )
    if product is None:
        raise LookupError(f"Product {product_id} does not exist")
    return product


def _sync_base_price(session: Session, product: Product) -> None:
    # base_price is the minimum across all variants, including inactive ones.
    lowest_price = session.scalar(
        select(func.min(ProductVariant.price)).where(
            ProductVariant.product_id == product.product_id
        )
    )
    if lowest_price is None:
        raise ValueError(f"Product {product.product_id} must have at least one variant")
    product.base_price = lowest_price
    session.flush()


def recalculate_product_base_price(session: Session, *, product_id: int) -> Decimal:
    product = _lock_product(session, product_id)
    _sync_base_price(session, product)
    return product.base_price


def create_product_variant(
    session: Session,
    *,
    product_id: int,
    sku: str,
    price: Decimal,
    cost_price: Decimal = Decimal("0"),
    color: str | None = None,
    size: str | None = None,
    is_active: bool = True,
) -> ProductVariant:
    if price < 0:
        raise ValueError("Variant sale price must not be negative")
    if cost_price < 0:
        raise ValueError("Variant cost price must not be negative")

    product = _lock_product(session, product_id)
    variant = ProductVariant(
        product_id=product.product_id,
        sku=sku,
        price=price,
        cost_price=cost_price,
        color=color,
        size=size,
        is_active=is_active,
    )
    session.add(variant)
    session.flush()
    _sync_base_price(session, product)
    return variant


def _lock_variant_and_product(
    session: Session, variant_id: int
) -> tuple[Product, ProductVariant]:
    product_id = session.scalar(
        select(ProductVariant.product_id).where(
            ProductVariant.variant_id == variant_id
        )
    )
    if product_id is None:
        raise LookupError(f"Product variant {variant_id} does not exist")

    product = _lock_product(session, product_id)
    variant = session.scalar(
        select(ProductVariant)
        .where(
            ProductVariant.variant_id == variant_id,
            ProductVariant.product_id == product.product_id,
        )
        .with_for_update()
    )
    if variant is None:
        raise LookupError(f"Product variant {variant_id} no longer exists")
    return product, variant


def update_product_variant_price(
    session: Session, *, variant_id: int, price: Decimal
) -> ProductVariant:
    if price < 0:
        raise ValueError("Variant sale price must not be negative")

    product, variant = _lock_variant_and_product(session, variant_id)
    variant.price = price
    session.flush()
    _sync_base_price(session, product)
    return variant


def update_product_variant_active(
    session: Session, *, variant_id: int, is_active: bool
) -> ProductVariant:
    product, variant = _lock_variant_and_product(session, variant_id)
    variant.is_active = is_active
    session.flush()
    _sync_base_price(session, product)
    return variant
