import unittest
from decimal import Decimal

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models.catalog import Category, Product, ProductVariant
from app.services.catalog import (
    create_product_variant,
    update_product_variant_active,
    update_product_variant_price,
)


class CatalogServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite+pysqlite:///:memory:")
        Category.__table__.create(self.engine)
        Product.__table__.create(self.engine)
        ProductVariant.__table__.create(self.engine)
        self.session = Session(self.engine)

        category = Category(category_name="Test", slug="test")
        self.session.add(category)
        self.session.flush()
        product = Product(
            category_id=category.category_id,
            product_name="Test product",
            slug="test-product",
            base_price=Decimal("100.00"),
        )
        self.session.add(product)
        self.session.flush()
        self.product = product

    def tearDown(self) -> None:
        self.session.close()
        self.engine.dispose()

    def test_base_price_includes_inactive_variants(self) -> None:
        hidden_variant = create_product_variant(
            self.session,
            product_id=self.product.product_id,
            sku="TEST-HIDDEN",
            price=Decimal("10.00"),
            is_active=False,
        )
        create_product_variant(
            self.session,
            product_id=self.product.product_id,
            sku="TEST-ACTIVE",
            price=Decimal("12.00"),
        )

        self.assertEqual(self.product.base_price, Decimal("10.00"))

        update_product_variant_active(
            self.session, variant_id=hidden_variant.variant_id, is_active=True
        )
        update_product_variant_active(
            self.session, variant_id=hidden_variant.variant_id, is_active=False
        )
        self.assertEqual(self.product.base_price, Decimal("10.00"))

    def test_price_updates_recalculate_base_price(self) -> None:
        cheapest = create_product_variant(
            self.session,
            product_id=self.product.product_id,
            sku="TEST-CHEAP",
            price=Decimal("10.00"),
        )
        other = create_product_variant(
            self.session,
            product_id=self.product.product_id,
            sku="TEST-OTHER",
            price=Decimal("12.00"),
        )

        update_product_variant_price(
            self.session, variant_id=cheapest.variant_id, price=Decimal("15.00")
        )
        self.assertEqual(self.product.base_price, Decimal("12.00"))

        update_product_variant_price(
            self.session, variant_id=other.variant_id, price=Decimal("18.00")
        )
        self.assertEqual(self.product.base_price, Decimal("15.00"))


if __name__ == "__main__":
    unittest.main()
