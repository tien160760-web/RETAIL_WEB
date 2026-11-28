"""Idempotently create development-only users and catalog fixtures."""

import getpass
from html import escape
import os
from decimal import Decimal
from urllib.parse import quote

import bcrypt
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    Branch,
    Category,
    InventoryLevel,
    Product,
    ProductImage,
    ProductVariant,
    Role,
    User,
    UserBranchAccess,
    UserRole,
)
from app.services.catalog import create_product_variant, recalculate_product_base_price


PASSWORD_ENV_VARS = {
    "ADMIN": "SEED_ADMIN_PASSWORD",
    "BRANCH_MANAGER": "SEED_MANAGER_PASSWORD",
    "STAFF": "SEED_STAFF_PASSWORD",
    "CUSTOMER": "SEED_CUSTOMER_PASSWORD",
}


def _passwords_from_environment() -> dict[str, str]:
    passwords = {}
    for group, variable in PASSWORD_ENV_VARS.items():
        password = os.environ.get(variable)
        if password:
            _validate_seed_password(variable, password)
        else:
            while True:
                password = getpass.getpass(
                    f"Set {variable} for development seed (at least 12 bytes): "
                )
                try:
                    _validate_seed_password(variable, password)
                except ValueError as error:
                    print(f"{error}. Please try again.")
                    continue
                break
        passwords[group] = password
    return passwords


def _validate_seed_password(variable: str, password: str) -> None:
    encoded = password.encode("utf-8")
    if len(encoded) < 12:
        raise ValueError(f"{variable} must be at least 12 bytes")
    if len(encoded) > 72:
        raise ValueError(f"{variable} must not exceed bcrypt's 72-byte limit")


def _ensure_role(session: Session, role_name: str, description: str) -> Role:
    role = session.scalar(select(Role).where(Role.role_name == role_name))
    if role is None:
        role = Role(role_name=role_name, description=description)
        session.add(role)
        session.flush()
    return role


def _ensure_user(
    session: Session,
    *,
    username: str,
    email: str,
    full_name: str,
    role: Role,
    password: str,
) -> User:
    user = session.scalar(select(User).where(User.username == username))
    if user is not None and user.email != email:
        raise ValueError(f"Seed username {username!r} is already used by another email")
    if user is None:
        existing_email = session.scalar(select(User).where(User.email == email))
        if existing_email is not None:
            raise ValueError(f"Seed email {email!r} is already used by another username")
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("ascii")
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            password_hash=password_hash,
            is_active=True,
        )
        session.add(user)
        session.flush()

    if session.get(UserRole, (user.user_id, role.role_id)) is None:
        session.add(UserRole(user_id=user.user_id, role_id=role.role_id))
    return user


def _ensure_branch(
    session: Session,
    *,
    branch_code: str,
    branch_name: str,
    address: str,
    phone: str,
    manager: User,
) -> Branch:
    branch = session.scalar(select(Branch).where(Branch.branch_code == branch_code))
    if branch is None:
        branch = Branch(
            branch_code=branch_code,
            branch_name=branch_name,
            address=address,
            phone=phone,
            manager_user_id=manager.user_id,
            is_active=True,
        )
        session.add(branch)
        session.flush()
    return branch


def _ensure_category(
    session: Session,
    *,
    category_name: str,
    slug: str,
    description: str,
    parent: Category | None = None,
) -> Category:
    category = session.scalar(select(Category).where(Category.slug == slug))
    if category is None:
        category = Category(
            parent_id=parent.category_id if parent else None,
            category_name=category_name,
            slug=slug,
            description=description,
            is_active=True,
        )
        session.add(category)
        session.flush()
    elif parent is not None:
        if category.parent_id not in (None, parent.category_id):
            raise ValueError(f"Seed category {slug!r} already has a different parent")
        category.parent_id = parent.category_id
    return category


def _placeholder_image_url(label: str) -> str:
    safe_label = escape(label)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" '
        'viewBox="0 0 640 640"><rect width="640" height="640" fill="#eef2f7"/>'
        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" '
        'font-family="sans-serif" font-size="32" fill="#334155">'
        f"{safe_label}</text></svg>"
    )
    return "data:image/svg+xml," + quote(svg, safe="")


def _ensure_image(
    session: Session,
    *,
    product: Product,
    variant: ProductVariant,
    label: str,
    display_order: int,
) -> ProductImage:
    image_url = _placeholder_image_url(label)
    image = session.scalar(
        select(ProductImage).where(
            ProductImage.product_id == product.product_id,
            ProductImage.variant_id == variant.variant_id,
            ProductImage.image_url == image_url,
        )
    )
    if image is None:
        image = ProductImage(
            product_id=product.product_id,
            variant_id=variant.variant_id,
            image_url=image_url,
            is_primary=display_order == 0,
            display_order=display_order,
        )
        session.add(image)
        session.flush()
    return image


def _ensure_product(
    session: Session,
    *,
    category: Category,
    product_name: str,
    slug: str,
    description: str,
    base_price: Decimal,
    is_active: bool,
) -> Product:
    product = session.scalar(select(Product).where(Product.slug == slug))
    if product is not None:
        if product.category_id != category.category_id:
            raise ValueError(f"Seed product {slug!r} exists in a different category")
        return product

    product = Product(
        category_id=category.category_id,
        product_name=product_name,
        slug=slug,
        description=description,
        base_price=base_price,
        is_active=is_active,
    )
    session.add(product)
    session.flush()
    return product


def _ensure_variant(
    session: Session,
    *,
    product: Product,
    sku: str,
    color: str,
    size: str,
    price: Decimal,
    cost_price: Decimal,
) -> ProductVariant:
    variant = session.scalar(select(ProductVariant).where(ProductVariant.sku == sku))
    if variant is not None:
        if variant.product_id != product.product_id:
            raise ValueError(f"Seed SKU {sku!r} belongs to a different product")
        return variant

    return create_product_variant(
        session,
        product_id=product.product_id,
        sku=sku,
        price=price,
        cost_price=cost_price,
        color=color,
        size=size,
    )


def seed_development_data(database_url: str, passwords: dict[str, str]) -> None:
    engine = create_engine(database_url)
    try:
        with Session(engine) as session, session.begin():
            role_data = {
                "ADMIN": "Quản trị hệ thống",
                "BRANCH_MANAGER": "Quản lý chi nhánh",
                "WAREHOUSE_STAFF": "Nhân viên kho",
                "SALES_STAFF": "Nhân viên bán hàng",
                "CUSTOMER": "Khách hàng",
            }
            roles = {
                name: _ensure_role(session, name, description)
                for name, description in role_data.items()
            }

            users = {
                "admin": _ensure_user(
                    session,
                    username="dev-admin",
                    email="dev-admin@example.test",
                    full_name="Demo Administrator",
                    role=roles["ADMIN"],
                    password=passwords["ADMIN"],
                ),
                "manager_hanoi": _ensure_user(
                    session,
                    username="dev-manager-hanoi",
                    email="dev-manager-hanoi@example.test",
                    full_name="Demo Hanoi Manager",
                    role=roles["BRANCH_MANAGER"],
                    password=passwords["BRANCH_MANAGER"],
                ),
                "manager_hcm": _ensure_user(
                    session,
                    username="dev-manager-hcm",
                    email="dev-manager-hcm@example.test",
                    full_name="Demo HCMC Manager",
                    role=roles["BRANCH_MANAGER"],
                    password=passwords["BRANCH_MANAGER"],
                ),
                "warehouse": _ensure_user(
                    session,
                    username="dev-warehouse",
                    email="dev-warehouse@example.test",
                    full_name="Demo Warehouse Staff",
                    role=roles["WAREHOUSE_STAFF"],
                    password=passwords["STAFF"],
                ),
                "sales": _ensure_user(
                    session,
                    username="dev-sales",
                    email="dev-sales@example.test",
                    full_name="Demo Sales Staff",
                    role=roles["SALES_STAFF"],
                    password=passwords["STAFF"],
                ),
                "customer": _ensure_user(
                    session,
                    username="dev-customer",
                    email="dev-customer@example.test",
                    full_name="Demo Customer",
                    role=roles["CUSTOMER"],
                    password=passwords["CUSTOMER"],
                ),
            }

            branches = {
                "hanoi": _ensure_branch(
                    session,
                    branch_code="DEMO-HN",
                    branch_name="Chi nhánh Hà Nội (Demo)",
                    address="1 Demo Street, Hanoi",
                    phone="0900000001",
                    manager=users["manager_hanoi"],
                ),
                "hcm": _ensure_branch(
                    session,
                    branch_code="DEMO-HCM",
                    branch_name="Chi nhánh TP. Hồ Chí Minh (Demo)",
                    address="2 Demo Street, Ho Chi Minh City",
                    phone="0900000002",
                    manager=users["manager_hcm"],
                ),
            }

            for username in ("manager_hanoi", "warehouse", "sales"):
                key = (users[username].user_id, branches["hanoi"].branch_id)
                if session.get(UserBranchAccess, key) is None:
                    session.add(UserBranchAccess(user_id=key[0], branch_id=key[1]))
            key = (users["manager_hcm"].user_id, branches["hcm"].branch_id)
            if session.get(UserBranchAccess, key) is None:
                session.add(UserBranchAccess(user_id=key[0], branch_id=key[1]))

            root_category = _ensure_category(
                session,
                category_name="Sản phẩm demo",
                slug="demo-products",
                description="Danh mục gốc cho dữ liệu phát triển",
            )
            categories = {
                "phones": _ensure_category(
                    session,
                    category_name="Điện thoại demo",
                    slug="demo-dien-thoai",
                    description="Danh mục dữ liệu phát triển",
                    parent=root_category,
                ),
                "accessories": _ensure_category(
                    session,
                    category_name="Phụ kiện demo",
                    slug="demo-phu-kien",
                    description="Danh mục dữ liệu phát triển",
                    parent=root_category,
                ),
            }
            products = {
                "phone": _ensure_product(
                    session,
                    category=categories["phones"],
                    product_name="Điện thoại demo công khai",
                    slug="demo-smartphone",
                    description="Sản phẩm mẫu công khai, có nhiều biến thể.",
                    base_price=Decimal("14990000.00"),
                    is_active=True,
                ),
                "case": _ensure_product(
                    session,
                    category=categories["accessories"],
                    product_name="Ốp lưng demo công khai",
                    slug="demo-phone-case",
                    description="Sản phẩm mẫu công khai.",
                    base_price=Decimal("199000.00"),
                    is_active=True,
                ),
                "hidden": _ensure_product(
                    session,
                    category=categories["phones"],
                    product_name="Điện thoại demo đang ẩn",
                    slug="demo-hidden-phone",
                    description="Dùng để kiểm tra sản phẩm không công khai.",
                    base_price=Decimal("7990000.00"),
                    is_active=False,
                ),
            }
            variants = {
                "phone_black": _ensure_variant(
                    session,
                    product=products["phone"],
                    sku="DEMO-PHONE-BLK-128",
                    color="Đen",
                    size="128GB",
                    price=Decimal("14990000.00"),
                    cost_price=Decimal("12000000.00"),
                ),
                "phone_blue": _ensure_variant(
                    session,
                    product=products["phone"],
                    sku="DEMO-PHONE-BLU-256",
                    color="Xanh",
                    size="256GB",
                    price=Decimal("16990000.00"),
                    cost_price=Decimal("13800000.00"),
                ),
                "case_clear": _ensure_variant(
                    session,
                    product=products["case"],
                    sku="DEMO-CASE-CLR-STD",
                    color="Trong suốt",
                    size="Tiêu chuẩn",
                    price=Decimal("199000.00"),
                    cost_price=Decimal("70000.00"),
                ),
                "hidden_gray": _ensure_variant(
                    session,
                    product=products["hidden"],
                    sku="DEMO-HIDDEN-GRY-64",
                    color="Xám",
                    size="64GB",
                    price=Decimal("7990000.00"),
                    cost_price=Decimal("6500000.00"),
                ),
            }
            for product in products.values():
                recalculate_product_base_price(
                    session, product_id=product.product_id
                )

            images = [
                _ensure_image(
                    session,
                    product=products["phone"],
                    variant=variants["phone_black"],
                    label="Demo phone - black 128GB",
                    display_order=0,
                ),
                _ensure_image(
                    session,
                    product=products["phone"],
                    variant=variants["phone_blue"],
                    label="Demo phone - blue 256GB",
                    display_order=1,
                ),
                _ensure_image(
                    session,
                    product=products["case"],
                    variant=variants["case_clear"],
                    label="Demo clear phone case",
                    display_order=0,
                ),
                _ensure_image(
                    session,
                    product=products["hidden"],
                    variant=variants["hidden_gray"],
                    label="Hidden demo phone - gray 64GB",
                    display_order=0,
                ),
            ]

            stock_by_branch = {
                "hanoi": {
                    "phone_black": 8,
                    "phone_blue": 4,
                    "case_clear": 20,
                    "hidden_gray": 2,
                },
                "hcm": {
                    "phone_black": 5,
                    "phone_blue": 3,
                    "case_clear": 12,
                    "hidden_gray": 1,
                },
            }
            for branch_key, stock in stock_by_branch.items():
                branch = branches[branch_key]
                for variant_key, quantity in stock.items():
                    variant = variants[variant_key]
                    level = session.scalar(
                        select(InventoryLevel).where(
                            InventoryLevel.branch_id == branch.branch_id,
                            InventoryLevel.variant_id == variant.variant_id,
                        )
                    )
                    if level is None:
                        session.add(
                            InventoryLevel(
                                branch_id=branch.branch_id,
                                variant_id=variant.variant_id,
                                on_hand_qty=quantity,
                                reserved_qty=0,
                                reorder_level=5,
                            )
                        )

            session.flush()
            output = {
                "users": {key: value.user_id for key, value in users.items()},
                "branches": {
                    key: value.branch_id for key, value in branches.items()
                },
                "products": {
                    key: {
                        "product_id": product.product_id,
                        "category_id": product.category_id,
                        "is_active": product.is_active,
                    }
                    for key, product in products.items()
                },
                "variants": {
                    key: {"variant_id": value.variant_id, "sku": value.sku}
                    for key, value in variants.items()
                },
                "images": [image.image_id for image in images],
            }
    finally:
        engine.dispose()

    print("Development seed complete (passwords were not printed).")
    for group, records in output.items():
        print(f"{group}: {records}")


def main() -> None:
    passwords = _passwords_from_environment()
    seed_development_data(settings.DATABASE_URL, passwords)


if __name__ == "__main__":
    main()
