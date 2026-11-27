from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import engine, SessionLocal
from app.core.security import hash_password
from app.models.base import Base
from app.models.rbac import Branch, Role, User, UserBranchAccess, UserRole
from app.models.catalog import Category, Product, ProductImage, ProductVariant, Supplier


def init_and_seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Seed Roles
        role_defs = [
            ("ADMIN", "Quản trị viên hệ thống"),
            ("BRANCH_MANAGER", "Quản lý chi nhánh"),
            ("WAREHOUSE_STAFF", "Nhân viên kho"),
            ("SALES_STAFF", "Nhân viên bán hàng"),
            ("CUSTOMER", "Khách hàng mua sắm"),
        ]
        role_map: dict[str, Role] = {}
        for r_name, r_desc in role_defs:
            r = db.scalar(select(Role).where(Role.role_name == r_name))
            if not r:
                r = Role(role_name=r_name, description=r_desc)
                db.add(r)
                db.flush()
            role_map[r_name] = r

        # 2. Seed Branches
        branch_defs = [
            ("CN-HN", "Chi nhánh A (Hà Nội)", "128 Phố Huế, Hai Bà Trưng, Hà Nội", "02438221100"),
            ("CN-DN", "Chi nhánh B (Đà Nẵng)", "45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", "02363882299"),
            ("CN-HCM", "Chi nhánh C (TP.HCM)", "214 Nguyễn Trãi, Quận 1, TP.HCM", "02839251188"),
        ]
        branch_map: dict[str, Branch] = {}
        for b_code, b_name, b_addr, b_phone in branch_defs:
            b = db.scalar(select(Branch).where(Branch.branch_code == b_code))
            if not b:
                b = Branch(
                    branch_code=b_code,
                    branch_name=b_name,
                    address=b_addr,
                    phone=b_phone,
                    is_active=True,
                )
                db.add(b)
                db.flush()
            branch_map[b_code] = b

        # 3. Seed Initial Staff Accounts
        if not db.scalar(select(User).limit(1)):
            default_pw_hash = hash_password("123")
            staff_seeds = [
                ("admin", "admin@retail.vn", "Dương Đức Tiến", "0901000111", "ADMIN", None, True),
                ("manager_hn", "manager.hn@retail.vn", "Phạm Ngọc Tài", "0902000222", "BRANCH_MANAGER", "CN-HN", True),
                ("warehouse_dn", "warehouse.dn@retail.vn", "Phạm Đức Thắng", "0903000333", "WAREHOUSE_STAFF", "CN-DN", True),
                ("sales_hcm", "sales.hcm@retail.vn", "Vũ Mạnh Hiếu", "0904000444", "SALES_STAFF", "CN-HCM", True),
                ("locked_user", "locked@retail.vn", "Trần Văn Khóa", "0905000555", "SALES_STAFF", "CN-HN", False),
            ]
            for uname, email, fname, phone, r_name, b_code, active in staff_seeds:
                u = User(
                    username=uname,
                    email=email,
                    password_hash=default_pw_hash,
                    full_name=fname,
                    phone=phone,
                    is_active=active,
                )
                db.add(u)
                db.flush()
                db.add(UserRole(user_id=u.user_id, role_id=role_map[r_name].role_id))
                if b_code and b_code in branch_map:
                    db.add(UserBranchAccess(user_id=u.user_id, branch_id=branch_map[b_code].branch_id))

        # 4. Seed Categories
        cat_defs = [
            ("ao-thun", "Thời trang & May mặc", "Quần áo, trang phục và phụ kiện thời trang"),
            ("dien-tu", "Điện tử & Công nghệ", "Điện thoại, laptop, tai nghe và thiết bị công nghệ"),
            ("gia-dung", "Đồ gia dụng & Đời sống", "Thiết bị nhà bếp, đồ dùng gia đình và tiện ích"),
            ("thuc-pham", "Thực phẩm & Đồ uống", "Đồ ăn đóng gói, nước giải khát và nhu yếu phẩm"),
            ("my-pham", "Mỹ phẩm & Chăm sóc cá nhân", "Sản phẩm chăm sóc da, nước hoa và làm đẹp"),
            ("quan-denim", "Quần & Denim", "Quần jeans, kaki và quần short"),
            ("ao-khoac", "Áo khoác", "Áo khoác gió, cardigan và áo khoác thu đông"),
            ("phu-kien", "Phụ kiện & Túi xách", "Balo, túi đeo chéo, giày dép và phụ kiện"),
        ]
        cat_map: dict[str, Category] = {}
        for slug, cname, cdesc in cat_defs:
            c = db.scalar(select(Category).where(Category.slug == slug))
            if not c:
                c = Category(category_name=cname, slug=slug, description=cdesc, is_active=True)
                db.add(c)
                db.flush()
            cat_map[slug] = c

        # 5. Seed Products
        if not db.scalar(select(Product).limit(1)):
            prod_seeds = [
                (
                    "Áo Polo Pima Cao Cấp",
                    "ao-thun",
                    450000,
                    "Chất liệu cotton Pima mềm mịn, thoáng khí, giữ form tốt sau nhiều lần giặt.",
                    [
                        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
                    ],
                    [
                        ("APL-DEN-M", "Đen", "M", 450000, 35),
                        ("APL-DEN-L", "Đen", "L", 450000, 42),
                        ("APL-XNH-M", "Xanh Navy", "M", 470000, 28),
                        ("APL-XNH-L", "Xanh Navy", "L", 470000, 50),
                    ],
                ),
                (
                    "Quần Jeans Slimfit Co Giãn",
                    "quan-denim",
                    650000,
                    "Denim co giãn 2% spandex, form slimfit trẻ trung phù hợp đi làm và đi chơi.",
                    [
                        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
                    ],
                    [
                        ("QJN-XNH-30", "Xanh Navy", "30", 650000, 20),
                        ("QJN-XNH-31", "Xanh Navy", "31", 650000, 25),
                        ("QJN-DEN-30", "Đen", "30", 670000, 18),
                        ("QJN-DEN-31", "Đen", "31", 670000, 30),
                    ],
                ),
                (
                    "Áo Khoác Gió 2 Lớp Chống Nước",
                    "ao-khoac",
                    800000,
                    "Vải dù trượt nước kết hợp lớp lót lưới thoáng khí, có mũ tháo rời.",
                    [
                        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
                    ],
                    [
                        ("AKG-REU-L", "Xanh Rêu", "L", 800000, 15),
                        ("AKG-REU-XL", "Xanh Rêu", "XL", 820000, 12),
                    ],
                ),
                (
                    "Túi Đeo Chéo Canvas Phối Da",
                    "phu-kien",
                    490000,
                    "Vải canvas dày dặn chống thấm nhẹ, ngăn đựng phụ kiện tiện lợi.",
                    [
                        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
                    ],
                    [
                        ("TDC-NAU-F", "Nâu Đất", "FreeSize", 490000, 40),
                    ],
                ),
            ]
            for idx, (pname, cslug, bprice, pdesc, imgs, vars_list) in enumerate(prod_seeds):
                p = Product(
                    category_id=cat_map[cslug].category_id,
                    product_name=pname,
                    slug=f"prod-seed-{idx+1}",
                    description=pdesc,
                    base_price=Decimal(str(bprice)),
                    is_active=True,
                )
                db.add(p)
                db.flush()
                for i_idx, i_url in enumerate(imgs):
                    db.add(
                        ProductImage(
                            product_id=p.product_id,
                            image_url=i_url,
                            is_primary=(i_idx == 0),
                            display_order=i_idx,
                        )
                    )
                for sku, color, size, vprice, vstock in vars_list:
                    db.add(
                        ProductVariant(
                            product_id=p.product_id,
                            sku=sku,
                            color=color,
                            size=size,
                            price=Decimal(str(vprice)),
                            cost_price=Decimal(str(round(vprice * 0.6))),
                            stock_qty=vstock,
                            is_active=True,
                        )
                    )

        # 6. Seed Suppliers
        if not db.scalar(select(Supplier).limit(1)):
            sup_seeds = [
                ("NCC-VT01", "Công ty CP Dệt May Việt Tiến", "02838640800", "kinhdoanh@viettien.vn", "7 Lê Minh Xuân, Tân Bình, TP.HCM", True),
                ("NCC-NB02", "Tổng Công ty May Nhà Bè (NBC)", "02838720077", "contact@nhabe.com.vn", "4 Bến Nghé, Quận 7, TP.HCM", True),
                ("NCC-DN03", "Công ty TNHH Phụ Kiện Da Hòa Thọ", "02363846290", "sales@hoatho.com.vn", "36 Ông Ích Đường, Cẩm Lệ, Đà Nẵng", True),
                ("NCC-HN04", "Xưởng Denim Gia Lâm", "02438276512", "denim.gialam@gmail.com", "KCN Ninh Hiệp, Gia Lâm, Hà Nội", False),
            ]
            for scode, sname, sphone, semail, saddr, sactive in sup_seeds:
                db.add(
                    Supplier(
                        supplier_code=scode,
                        supplier_name=sname,
                        phone=sphone,
                        email=semail,
                        address=saddr,
                        is_active=sactive,
                    )
                )

        db.commit()
    finally:
        db.close()
