import re
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role, get_current_user
from app.core.security import hash_password
from app.models.rbac import Branch, Role, User, UserBranchAccess, UserRole
from app.models.catalog import Category, Product, ProductImage, ProductVariant, Supplier

router = APIRouter()


def _slugify(text: str, suffix: str = "") -> str:
    s = text.lower().strip()
    s = re.sub(r"[àáạảãâầấậẩẫăằắặẳẵ]", "a", s)
    s = re.sub(r"[èéẹẻẽêềếệểễ]", "e", s)
    s = re.sub(r"[ìíịỉĩ]", "i", s)
    s = re.sub(r"[òóọỏõôồốộổỗơờớợởỡ]", "o", s)
    s = re.sub(r"[ùúụủũưừứựửữ]", "u", s)
    s = re.sub(r"[ỳýỵỷỹ]", "y", s)
    s = re.sub(r"đ", "d", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return f"{s}-{suffix}" if suffix else (s or "item")


# ============================================================
# 1. STAFF MANAGEMENT API (/api/v1/staff) - ADMIN ONLY
# ============================================================
class StaffCreateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(default="123", min_length=1)
    phone: str
    role: str
    branch_code: str | None = None


class StaffUpdateRequest(BaseModel):
    full_name: str | None = None
    email: str | None = None
    password: str | None = None
    phone: str | None = None
    role: str | None = None
    branch_code: str | None = None
    is_active: bool | None = None


def _serialize_staff(u: User) -> dict:
    roles = [ur.role.role_name for ur in u.user_roles if ur.role]
    primary_role = roles[0] if roles else "SALES_STAFF"
    branch_code = None
    for ba in u.branch_accesses:
        if ba.branch:
            branch_code = ba.branch.branch_code.lower()
            break
    return {
        "id": str(u.user_id),
        "user_id": u.user_id,
        "username": u.username,
        "fullName": u.full_name,
        "email": u.email,
        "password": "123",
        "phone": u.phone or "",
        "role": primary_role,
        "branchId": branch_code,
        "isActive": u.is_active,
    }


@router.get("/staff", tags=["Staff Management"])
def list_staff(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    users = db.scalars(select(User).order_by(User.user_id.asc())).all()
    result = []
    for u in users:
        roles = {ur.role.role_name for ur in u.user_roles if ur.role}
        if "CUSTOMER" in roles and len(roles) == 1:
            continue
        result.append(_serialize_staff(u))
    return result


@router.post("/staff", status_code=status.HTTP_201_CREATED, tags=["Staff Management"])
def create_staff(
    payload: StaffCreateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN")),
):
    clean_email = payload.email.strip().lower()
    if db.scalar(select(User).where(User.email == clean_email)):
        raise HTTPException(status_code=409, detail=f"Email '{clean_email}' đã tồn tại trong hệ thống.")

    role_obj = db.scalar(select(Role).where(Role.role_name == payload.role))
    if not role_obj:
        raise HTTPException(status_code=400, detail="Vai trò không tồn tại.")

    base_username = clean_email.split("@")[0]
    username = base_username
    counter = 1
    while db.scalar(select(User).where(User.username == username)):
        counter += 1
        username = f"{base_username}{counter}"

    new_user = User(
        username=username,
        email=clean_email,
        password_hash=hash_password(payload.password or "123"),
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip(),
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    db.add(UserRole(user_id=new_user.user_id, role_id=role_obj.role_id, assigned_by=admin.user_id))

    if payload.branch_code and payload.role != "ADMIN":
        branch = db.scalar(
            select(Branch).where(Branch.branch_code == payload.branch_code.upper())
        )
        if branch:
            db.add(
                UserBranchAccess(
                    user_id=new_user.user_id,
                    branch_id=branch.branch_id,
                    assigned_by=admin.user_id,
                )
            )

    db.commit()
    db.refresh(new_user)
    return _serialize_staff(new_user)


@router.patch("/staff/{user_id}", tags=["Staff Management"])
def update_staff(
    user_id: int,
    payload: StaffUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN")),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên.")

    if payload.email is not None:
        clean_email = payload.email.strip().lower()
        dup = db.scalar(select(User).where(User.email == clean_email, User.user_id != user_id))
        if dup:
            raise HTTPException(status_code=409, detail=f"Email '{clean_email}' đã được sử dụng.")
        user.email = clean_email

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip()
    if payload.password:
        user.password_hash = hash_password(payload.password)
    if payload.is_active is not None:
        user.is_active = payload.is_active

    if payload.role is not None:
        role_obj = db.scalar(select(Role).where(Role.role_name == payload.role))
        if role_obj:
            user.user_roles.clear()
            db.flush()
            db.add(UserRole(user_id=user.user_id, role_id=role_obj.role_id, assigned_by=admin.user_id))

    if payload.branch_code is not None:
        user.branch_accesses.clear()
        db.flush()
        if payload.branch_code and payload.role != "ADMIN":
            branch = db.scalar(
                select(Branch).where(Branch.branch_code == payload.branch_code.upper())
            )
            if branch:
                db.add(
                    UserBranchAccess(
                        user_id=user.user_id,
                        branch_id=branch.branch_id,
                        assigned_by=admin.user_id,
                    )
                )

    db.commit()
    db.refresh(user)
    return _serialize_staff(user)


# ============================================================
# 2. CATEGORIES & PRODUCTS API (/api/v1/categories, /api/v1/products)
# ============================================================
class CategoryPayload(BaseModel):
    name: str
    description: str = ""


class VariantPayload(BaseModel):
    id: str | None = None
    sku: str
    color: str = "Mặc định"
    size: str = "FreeSize"
    price: float
    stock: int = 25
    imageUrl: str | None = ""


class ProductPayload(BaseModel):
    name: str
    categoryId: str
    basePrice: float
    description: str = ""
    imageUrl: str | None = ""
    images: list[str] = []
    colorHex: str = "#2563EB"
    isActive: bool = True
    variants: list[VariantPayload]


def _serialize_category(c: Category) -> dict:
    return {
        "id": c.slug,
        "category_id": c.category_id,
        "name": c.category_name,
        "description": c.description or "",
    }


def _serialize_product(p: Product) -> dict:
    sorted_imgs = sorted(p.images, key=lambda im: im.display_order)
    img_urls = [im.image_url for im in sorted_imgs]
    cover_url = img_urls[0] if img_urls else ""

    return {
        "id": str(p.product_id),
        "product_id": p.product_id,
        "name": p.product_name,
        "categoryId": p.category.slug if p.category else "ao-thun",
        "basePrice": float(p.base_price),
        "description": p.description or "",
        "imageUrl": cover_url,
        "images": img_urls,
        "colorHex": "#2563EB",
        "isActive": p.is_active,
        "variants": [
            {
                "id": str(v.variant_id),
                "sku": v.sku,
                "color": v.color or "Mặc định",
                "size": v.size or "FreeSize",
                "price": float(v.price),
                "stock": v.stock_qty,
                "imageUrl": cover_url,
            }
            for v in p.variants
        ],
    }


@router.get("/categories", tags=["Catalog"])
def list_categories(db: Session = Depends(get_db)):
    cats = db.scalars(select(Category).order_by(Category.category_id.asc())).all()
    return [_serialize_category(c) for c in cats]


@router.post("/categories", status_code=status.HTTP_201_CREATED, tags=["Catalog"])
def create_category(
    payload: CategoryPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    clean_name = payload.name.strip()
    if db.scalar(select(Category).where(Category.category_name == clean_name)):
        raise HTTPException(status_code=409, detail="Tên danh mục đã tồn tại.")

    slug = _slugify(clean_name)
    if db.scalar(select(Category).where(Category.slug == slug)):
        slug = _slugify(clean_name, str(db.query(Category).count() + 1))

    cat = Category(
        category_name=clean_name,
        slug=slug,
        description=payload.description.strip(),
        is_active=True,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return _serialize_category(cat)


@router.put("/categories/{cat_slug}", tags=["Catalog"])
def update_category(
    cat_slug: str,
    payload: CategoryPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    cat = db.scalar(select(Category).where(Category.slug == cat_slug))
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    cat.category_name = payload.name.strip()
    cat.description = payload.description.strip()
    db.commit()
    db.refresh(cat)
    return _serialize_category(cat)


@router.delete("/categories/{cat_slug}", tags=["Catalog"])
def delete_category(
    cat_slug: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    cat = db.scalar(select(Category).where(Category.slug == cat_slug))
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    if cat.products:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa danh mục đang có sản phẩm.",
        )
    db.delete(cat)
    db.commit()
    return {"ok": True}


@router.get("/products", tags=["Catalog"])
def list_products(db: Session = Depends(get_db)):
    prods = db.scalars(select(Product).order_by(Product.product_id.desc())).all()
    return [_serialize_product(p) for p in prods]


@router.post("/products", status_code=status.HTTP_201_CREATED, tags=["Catalog"])
def create_product(
    payload: ProductPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    cat = db.scalar(select(Category).where(Category.slug == payload.categoryId))
    if not cat:
        cat = db.scalars(select(Category)).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Chưa có danh mục sản phẩm.")

    for v in payload.variants:
        clean_sku = v.sku.strip().upper()
        if db.scalar(select(ProductVariant).where(ProductVariant.sku == clean_sku)):
            raise HTTPException(status_code=409, detail=f"Mã SKU '{clean_sku}' đã tồn tại.")

    slug = _slugify(payload.name, str(db.query(Product).count() + 101))
    prod = Product(
        category_id=cat.category_id,
        product_name=payload.name.strip(),
        slug=slug,
        description=payload.description.strip(),
        base_price=Decimal(str(payload.basePrice)),
        is_active=payload.isActive,
    )
    db.add(prod)
    db.flush()

    all_imgs = payload.images if payload.images else ([payload.imageUrl] if payload.imageUrl else [])
    for idx, img_url in enumerate(all_imgs):
        if img_url:
            db.add(
                ProductImage(
                    product_id=prod.product_id,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    display_order=idx,
                )
            )

    for v in payload.variants:
        db.add(
            ProductVariant(
                product_id=prod.product_id,
                sku=v.sku.strip().upper(),
                color=v.color.strip(),
                size=v.size.strip(),
                price=Decimal(str(v.price)),
                cost_price=Decimal(str(round(v.price * 0.6))),
                stock_qty=v.stock,
                is_active=True,
            )
        )

    db.commit()
    db.refresh(prod)
    return _serialize_product(prod)


@router.put("/products/{product_id}", tags=["Catalog"])
def update_product(
    product_id: int,
    payload: ProductPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    prod = db.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")

    cat = db.scalar(select(Category).where(Category.slug == payload.categoryId))
    if cat:
        prod.category_id = cat.category_id

    for v in payload.variants:
        clean_sku = v.sku.strip().upper()
        dup = db.scalar(
            select(ProductVariant).where(
                ProductVariant.sku == clean_sku,
                ProductVariant.product_id != product_id,
            )
        )
        if dup:
            raise HTTPException(status_code=409, detail=f"Mã SKU '{clean_sku}' đã tồn tại ở sản phẩm khác.")

    prod.product_name = payload.name.strip()
    prod.description = payload.description.strip()
    prod.base_price = Decimal(str(payload.basePrice))
    prod.is_active = payload.isActive

    prod.images.clear()
    prod.variants.clear()
    db.flush()

    all_imgs = payload.images if payload.images else ([payload.imageUrl] if payload.imageUrl else [])
    for idx, img_url in enumerate(all_imgs):
        if img_url:
            db.add(
                ProductImage(
                    product_id=prod.product_id,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    display_order=idx,
                )
            )

    for v in payload.variants:
        db.add(
            ProductVariant(
                product_id=prod.product_id,
                sku=v.sku.strip().upper(),
                color=v.color.strip(),
                size=v.size.strip(),
                price=Decimal(str(v.price)),
                cost_price=Decimal(str(round(v.price * 0.6))),
                stock_qty=v.stock,
                is_active=True,
            )
        )

    db.commit()
    db.refresh(prod)
    return _serialize_product(prod)


@router.delete("/products/{product_id}", tags=["Catalog"])
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("ADMIN")),
):
    prod = db.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    db.delete(prod)
    db.commit()
    return {"ok": True}


# ============================================================
# 3. SUPPLIERS API (/api/v1/suppliers) - BRANCH_MANAGER & ADMIN
# ============================================================
class SupplierPayload(BaseModel):
    code: str
    name: str
    phone: str
    email: str = ""
    address: str = ""
    isActive: bool = True


def _serialize_supplier(s: Supplier) -> dict:
    return {
        "id": str(s.supplier_id),
        "supplier_id": s.supplier_id,
        "code": s.supplier_code,
        "name": s.supplier_name,
        "phone": s.phone,
        "email": s.email or "",
        "address": s.address or "",
        "isActive": s.is_active,
    }


@router.get("/suppliers", tags=["Suppliers"])
def list_suppliers(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    sups = db.scalars(select(Supplier).order_by(Supplier.supplier_id.asc())).all()
    return [_serialize_supplier(s) for s in sups]


@router.post("/suppliers", status_code=status.HTTP_201_CREATED, tags=["Suppliers"])
def create_supplier(
    payload: SupplierPayload,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("ADMIN", "BRANCH_MANAGER")),
):
    clean_code = payload.code.strip().upper()
    if db.scalar(select(Supplier).where(Supplier.supplier_code == clean_code)):
        raise HTTPException(status_code=409, detail=f"Mã nhà cung cấp '{clean_code}' đã tồn tại.")

    sup = Supplier(
        supplier_code=clean_code,
        supplier_name=payload.name.strip(),
        phone=payload.phone.strip(),
        email=payload.email.strip(),
        address=payload.address.strip(),
        is_active=payload.isActive,
    )
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return _serialize_supplier(sup)


@router.put("/suppliers/{supplier_id}", tags=["Suppliers"])
def update_supplier(
    supplier_id: int,
    payload: SupplierPayload,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("ADMIN", "BRANCH_MANAGER")),
):
    sup = db.get(Supplier, supplier_id)
    if not sup:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhà cung cấp.")

    clean_code = payload.code.strip().upper()
    dup = db.scalar(
        select(Supplier).where(
            Supplier.supplier_code == clean_code,
            Supplier.supplier_id != supplier_id,
        )
    )
    if dup:
        raise HTTPException(status_code=409, detail=f"Mã nhà cung cấp '{clean_code}' đã bị trùng.")

    sup.supplier_code = clean_code
    sup.supplier_name = payload.name.strip()
    sup.phone = payload.phone.strip()
    sup.email = payload.email.strip()
    sup.address = payload.address.strip()
    sup.is_active = payload.isActive

    db.commit()
    db.refresh(sup)
    return _serialize_supplier(sup)


@router.patch("/suppliers/{supplier_id}/toggle", tags=["Suppliers"])
def toggle_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("ADMIN", "BRANCH_MANAGER")),
):
    sup = db.get(Supplier, supplier_id)
    if not sup:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhà cung cấp.")
    sup.is_active = not sup.is_active
    db.commit()
    db.refresh(sup)
    return _serialize_supplier(sup)
