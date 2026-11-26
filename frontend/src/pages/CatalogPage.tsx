import { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FolderPlus,
  ImagePlus,
  LayoutGrid,
  Layers,
  Link2,
  List,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { CatalogCategory, CatalogProduct } from '../types/dashboard';
import { formatVND } from '../utils/format';

const AVATAR_PALETTES = [
  'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  'bg-[#F3E8FF] text-[#6D28D9] border-[#DDD6FE]',
  'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]',
  'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
];

const SAMPLE_IMAGES = [
  {
    label: 'Áo Polo',
    url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Tai nghe',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Giày Sneaker',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Mỹ phẩm',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Đồ gia dụng',
    url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
  },
];

function getBadgeStyle(seed: string) {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_PALETTES[sum % AVATAR_PALETTES.length];
}

function getProductInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return 'SP';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function CatalogPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useAdminContext();

  const [mainView, setMainView] = useState<'products' | 'categories'>('products');
  const [displayMode, setDisplayMode] = useState<'table' | 'grid'>('table');
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);

  // Confirm delete dialog state
  const [confirmDeleteProduct, setConfirmDeleteProduct] =
    useState<CatalogProduct | null>(null);

  // Modal state for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'ao-thun');
  const [isAddingInlineCat, setIsAddingInlineCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');

  const [sku, setSku] = useState('');
  const [color, setColor] = useState('Mặc định');
  const [size, setSize] = useState('Tiêu chuẩn');
  const [price, setPrice] = useState('250000');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'hidden'>('active');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [formErr, setFormErr] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state for Add / Edit Category
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CatalogCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catErr, setCatErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setBannerErr(null);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Summary metrics
  const activeCount = useMemo(
    () => products.filter((p) => p.isActive).length,
    [products]
  );
  const hiddenCount = products.length - activeCount;
  const totalVariantsCount = useMemo(
    () => products.reduce((acc, p) => acc + p.variants.length, 0),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (statusTab === 'active' && !p.isActive) return false;
      if (statusTab === 'hidden' && p.isActive) return false;
      if (filterCategoryId !== 'all' && p.categoryId !== filterCategoryId) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery, filterCategoryId, statusTab]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id ?? 'ao-thun');
    setIsAddingInlineCat(false);
    setInlineCatName('');
    setSku(`SP-${Math.floor(100 + Math.random() * 900)}`);
    setColor('Mặc định');
    setSize('Tiêu chuẩn');
    setPrice('250000');
    setDescription('');
    setStatus('active');
    setImageUrl('');
    setImageInputMode('upload');
    setFormErr(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: CatalogProduct) => {
    const firstVar = product.variants[0];
    setEditingProduct(product);
    setName(product.name);
    setCategoryId(product.categoryId);
    setIsAddingInlineCat(false);
    setInlineCatName('');
    setSku(firstVar?.sku ?? 'SP-001');
    setColor(firstVar?.color ?? 'Mặc định');
    setSize(firstVar?.size ?? 'Tiêu chuẩn');
    setPrice(String(firstVar?.price ?? product.basePrice));
    setDescription(product.description);
    setStatus(product.isActive ? 'active' : 'hidden');
    setImageUrl(product.imageUrl ?? firstVar?.imageUrl ?? '');
    setImageInputMode('upload');
    setFormErr(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormErr('Vui lòng chọn file định dạng hình ảnh (PNG, JPG, WEBP...).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setFormErr('Dung lượng ảnh tối đa là 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setFormErr(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickAddCategoryInModal = () => {
    const clean = inlineCatName.trim();
    if (!clean) {
      setFormErr('Vui lòng nhập tên danh mục mới.');
      return;
    }
    const exists = categories.find(
      (c) => c.name.toLowerCase() === clean.toLowerCase()
    );
    if (exists) {
      setCategoryId(exists.id);
      setIsAddingInlineCat(false);
      setInlineCatName('');
      return;
    }
    const created = addCategory({
      name: clean,
      description: `Danh mục ngành hàng ${clean}`,
    });
    setCategoryId(created.id);
    setIsAddingInlineCat(false);
    setInlineCatName('');
    setFormErr(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);

    let finalCategoryId = categoryId;
    if (isAddingInlineCat && inlineCatName.trim()) {
      const cleanCat = inlineCatName.trim();
      const existing = categories.find(
        (c) => c.name.toLowerCase() === cleanCat.toLowerCase()
      );
      if (existing) {
        finalCategoryId = existing.id;
      } else {
        const created = addCategory({
          name: cleanCat,
          description: `Danh mục ngành hàng ${cleanCat}`,
        });
        finalCategoryId = created.id;
      }
    }

    const cleanName = name.trim();
    const cleanSku = sku.trim().toUpperCase();
    const numPrice = Number(price);

    if (!cleanName || !cleanSku) {
      setFormErr('Vui lòng nhập đầy đủ Tên sản phẩm và Mã SKU.');
      return;
    }

    if (Number.isNaN(numPrice) || numPrice <= 0) {
      setFormErr('Giá bán phải lớn hơn 0.');
      return;
    }

    const skuExists = products.some(
      (p) =>
        p.id !== editingProduct?.id &&
        p.variants.some((v) => v.sku.toUpperCase() === cleanSku)
    );
    if (skuExists) {
      setFormErr(`Mã SKU "${cleanSku}" đã tồn tại. Vui lòng nhập mã khác.`);
      return;
    }

    const cleanImg = imageUrl.trim();

    const payload: Omit<CatalogProduct, 'id'> = {
      name: cleanName,
      categoryId: finalCategoryId,
      basePrice: numPrice,
      description:
        description.trim() || 'Sản phẩm chính hãng phân phối tại hệ thống',
      isActive: status === 'active',
      colorHex: '#2563EB',
      imageUrl: cleanImg,
      variants: [
        {
          id: editingProduct?.variants[0]?.id ?? `var-${Date.now()}`,
          sku: cleanSku,
          color: color.trim() || 'Mặc định',
          size: size.trim() || 'Tiêu chuẩn',
          price: numPrice,
          imageUrl: cleanImg,
        },
      ],
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      showToast(`Đã cập nhật sản phẩm "${cleanName}".`);
    } else {
      addProduct(payload);
      showToast(`Đã thêm sản phẩm mới "${cleanName}".`);
    }

    setIsModalOpen(false);
  };

  // Category CRUD handlers
  const openCreateCatModal = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setCatErr(null);
    setIsCatModalOpen(true);
  };

  const openEditCatModal = (cat: CatalogCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatErr(null);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatErr(null);
    const clean = catName.trim();
    if (!clean) {
      setCatErr('Tên danh mục không được để trống.');
      return;
    }
    const duplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === clean.toLowerCase() &&
        c.id !== editingCat?.id
    );
    if (duplicate) {
      setCatErr(`Danh mục "${clean}" đã tồn tại.`);
      return;
    }

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: clean,
        description: catDesc.trim() || `Nhóm sản phẩm ${clean}`,
      });
      showToast(`Đã cập nhật danh mục "${clean}".`);
    } else {
      addCategory({
        name: clean,
        description: catDesc.trim() || `Nhóm sản phẩm ${clean}`,
      });
      showToast(`Đã thêm danh mục mới "${clean}".`);
    }
    setIsCatModalOpen(false);
  };

  const handleDeleteCategory = (cat: CatalogCategory) => {
    const ok = deleteCategory(cat.id);
    if (!ok) {
      setBannerErr(
        `Không thể xóa danh mục "${cat.name}" vì đang có sản phẩm thuộc danh mục này.`
      );
      return;
    }
    showToast(`Đã xóa danh mục "${cat.name}".`);
  };

  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name ?? 'Chưa phân loại';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-[10px] shadow-lg border border-white/10 flex items-center gap-2.5 text-[13px] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#09090B]">
            Sản phẩm &amp; Danh mục
          </h1>
          <p className="text-[13px] text-[#71717A] mt-0.5">
            Quản lý hình ảnh, danh mục đa ngành hàng, biến thể SKU và trạng thái kinh doanh
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openCreateCatModal}
            className="h-[36px] px-3.5 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#18181B] text-[13px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#2563EB]" />
            <span>Thêm danh mục</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="polaris-card p-4 flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#71717A]">Tổng sản phẩm</p>
            <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1">
              {products.length}
            </p>
            <p className="text-[11.5px] text-[#71717A] mt-0.5">
              {totalVariantsCount} mã SKU đang quản lý
            </p>
          </div>
          <span className="w-9 h-9 rounded-[9px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </span>
        </div>

        <div className="polaris-card p-4 flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#71717A]">Đang kinh doanh</p>
            <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1">
              {activeCount}
            </p>
            <p className="text-[11.5px] text-[#15803D] font-medium mt-0.5">
              Hiển thị trên kệ hàng
            </p>
          </div>
          <span className="w-9 h-9 rounded-[9px] bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>

        <div className="polaris-card p-4 flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#71717A]">Đang tạm ẩn</p>
            <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1">
              {hiddenCount}
            </p>
            <p className="text-[11.5px] text-[#71717A] mt-0.5">
              Ngừng hiển thị tạm thời
            </p>
          </div>
          <span className="w-9 h-9 rounded-[9px] bg-[#F4F4F5] text-[#71717A] flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </span>
        </div>

        <div className="polaris-card p-4 flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#71717A]">Danh mục ngành hàng</p>
            <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1">
              {categories.length}
            </p>
            <p className="text-[11.5px] text-[#6D28D9] font-medium mt-0.5">
              Đa ngành hàng bán lẻ
            </p>
          </div>
          <span className="w-9 h-9 rounded-[9px] bg-[#F3E8FF] text-[#6D28D9] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </span>
        </div>
      </div>

      {bannerErr && (
        <div className="p-3.5 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-[13px] text-[#991B1B]">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{bannerErr}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerErr(null)}
            className="text-[12px] font-semibold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Unified Polaris Card */}
      <div className="polaris-card overflow-hidden">
        {/* Card Header: Top View Switcher + Integrated Filters */}
        <div className="px-4 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]/60 flex flex-wrap items-center justify-between gap-3">
          {/* Left Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMainView('products')}
              className={`h-[32px] px-3 rounded-[7px] text-[12.5px] font-semibold transition-all cursor-pointer ${
                mainView === 'products'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5]'
              }`}
            >
              Sản phẩm ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setMainView('categories')}
              className={`h-[32px] px-3 rounded-[7px] text-[12.5px] font-semibold transition-all cursor-pointer ${
                mainView === 'categories'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5]'
              }`}
            >
              Danh mục ngành hàng ({categories.length})
            </button>

            {mainView === 'products' && (
              <div className="hidden md:flex items-center gap-1 ml-2 pl-2 border-l border-[#E4E4E7]">
                {(
                  [
                    { id: 'all', label: 'Tất cả' },
                    { id: 'active', label: 'Đang bán' },
                    { id: 'hidden', label: 'Tạm ẩn' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStatusTab(t.id)}
                    className={`h-[28px] px-2.5 rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
                      statusTab === t.id
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                        : 'text-[#71717A] hover:text-[#09090B]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Integrated Search, Category Filter & Grid/Table Toggle */}
          {mainView === 'products' && (
            <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="h-[34px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 text-[12.5px] text-[#18181B] outline-none focus:border-[#2563EB]"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="h-[34px] w-full sm:w-[220px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#2563EB] px-2.5 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên SP, mã SKU..."
                  className="w-full bg-transparent text-[12.5px] text-[#09090B] placeholder:text-[#A1A1AA] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[11px] text-[#71717A] hover:text-[#09090B] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Table vs Card Grid Switcher */}
              <div className="inline-flex p-0.5 rounded-[8px] border border-[#E4E4E7] bg-white">
                <button
                  type="button"
                  onClick={() => setDisplayMode('table')}
                  title="Chế độ bảng"
                  className={`w-[30px] h-[28px] rounded-[6px] flex items-center justify-center cursor-pointer ${
                    displayMode === 'table'
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('grid')}
                  title="Chế độ lưới thẻ có ảnh lớn"
                  className={`w-[30px] h-[28px] rounded-[6px] flex items-center justify-center cursor-pointer ${
                    displayMode === 'grid'
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content: Products (Table or Grid) or Categories */}
        {mainView === 'products' ? (
          displayMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[760px]">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#71717A] h-[40px]">
                    <th className="px-5">Hình ảnh &amp; Sản phẩm</th>
                    <th className="px-4">Mã định danh SKU</th>
                    <th className="px-4">Danh mục</th>
                    <th className="px-4">Phân loại / Quy cách</th>
                    <th className="px-4 text-right">Giá niêm yết</th>
                    <th className="px-4 text-center">Trạng thái</th>
                    <th className="px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7]/80 text-[13px]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <p className="text-[13.5px] font-semibold text-[#18181B]">
                          Không tìm thấy sản phẩm nào
                        </p>
                        <p className="text-[12.5px] text-[#71717A] mt-1">
                          Thử thay đổi từ khóa tìm kiếm hoặc bấm &ldquo;Thêm sản phẩm&rdquo; để tạo mới.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const firstVar = product.variants[0];
                      const imgSrc = product.imageUrl || firstVar?.imageUrl;
                      const avatarStyle = getBadgeStyle(product.id + product.name);
                      return (
                        <tr
                          key={product.id}
                          className="group hover:bg-[#FAFAFA] transition-colors h-[68px]"
                        >
                          {/* Product Image Thumbnail + 2-line Name */}
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={product.name}
                                  className="w-11 h-11 rounded-[9px] object-cover border border-[#E4E4E7] bg-[#F4F4F5] shrink-0"
                                />
                              ) : (
                                <div
                                  className={`w-11 h-11 rounded-[9px] border flex items-center justify-center text-[12.5px] font-bold shrink-0 ${avatarStyle}`}
                                >
                                  {getProductInitials(product.name)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-[#09090B] truncate leading-snug">
                                  {product.name}
                                </p>
                                <p className="text-[12px] text-[#71717A] truncate max-w-[260px]">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Monospace SKU Badge */}
                          <td className="px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#F4F4F5] border border-[#E4E4E7] font-mono text-[12px] font-semibold text-[#18181B]">
                              {firstVar?.sku ?? 'N/A'}
                            </span>
                          </td>

                          {/* Category Tag */}
                          <td className="px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[12px] font-medium">
                              <Tag className="w-3 h-3" />
                              <span>{getCategoryName(product.categoryId)}</span>
                            </span>
                          </td>

                          {/* Variant spec */}
                          <td className="px-4 text-[#52525B]">
                            <span className="font-medium text-[#18181B]">
                              {firstVar ? `${firstVar.color} · ${firstVar.size}` : 'Tiêu chuẩn'}
                            </span>
                            {product.variants.length > 1 && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#52525B] text-[11px] font-semibold">
                                +{product.variants.length - 1}
                              </span>
                            )}
                          </td>

                          {/* Tabular Price */}
                          <td className="px-4 text-right font-bold text-[#09090B] tabular-nums">
                            {formatVND(firstVar?.price ?? product.basePrice)}
                          </td>

                          {/* Status Pill */}
                          <td className="px-4 text-center">
                            {product.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[11.5px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                                <span>Đang bán</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-[11.5px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#71717A]" />
                                <span>Tạm ẩn</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(product)}
                                className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-medium text-[#18181B] inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#52525B]" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProduct(product)}
                                className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[12px] font-medium text-[#52525B] hover:text-[#DC2626] inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card Grid View with Large Product Photos */
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const firstVar = product.variants[0];
                const imgSrc = product.imageUrl || firstVar?.imageUrl;
                const avatarStyle = getBadgeStyle(product.id + product.name);
                return (
                  <div
                    key={product.id}
                    className="rounded-[12px] border border-[#E4E4E7] bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-[170px] w-full bg-[#F4F4F5] border-b border-[#E4E4E7] overflow-hidden flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-16 h-16 rounded-[12px] border flex items-center justify-center text-[18px] font-bold ${avatarStyle}`}
                          >
                            {getProductInitials(product.name)}
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[6px] bg-white/90 backdrop-blur-xs border border-[#E4E4E7] font-mono text-[11px] font-semibold text-[#18181B]">
                          {firstVar?.sku ?? 'N/A'}
                        </span>
                        <span
                          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            product.isActive
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#F4F4F5] text-[#52525B]'
                          }`}
                        >
                          {product.isActive ? 'Đang bán' : 'Tạm ẩn'}
                        </span>
                      </div>

                      <div className="p-3.5">
                        <span className="text-[11px] font-semibold text-[#2563EB]">
                          {getCategoryName(product.categoryId)}
                        </span>
                        <h3 className="text-[14px] font-bold text-[#09090B] mt-0.5 truncate">
                          {product.name}
                        </h3>
                        <p className="text-[12px] text-[#71717A] mt-0.5 truncate">
                          {firstVar ? `${firstVar.color} · ${firstVar.size}` : 'Tiêu chuẩn'}
                        </p>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#09090B] tabular-nums">
                        {formatVND(firstVar?.price ?? product.basePrice)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="h-[28px] px-2.5 rounded-[6px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[11.5px] font-medium text-[#18181B] cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteProduct(product)}
                          className="h-[28px] px-2 rounded-[6px] border border-[#E4E4E7] bg-white hover:bg-[#FEF2F2] hover:text-[#DC2626] text-[11.5px] text-[#71717A] cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Categories View */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[600px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#71717A] h-[40px]">
                  <th className="px-5">Tên danh mục ngành hàng</th>
                  <th className="px-4">Mô tả chi tiết</th>
                  <th className="px-4 text-center">Số lượng SP</th>
                  <th className="px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7]/80 text-[13px]">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  const badgeStyle = getBadgeStyle(cat.id);
                  return (
                    <tr key={cat.id} className="hover:bg-[#FAFAFA] transition-colors h-[58px]">
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-[7px] border flex items-center justify-center text-[11.5px] font-bold shrink-0 ${badgeStyle}`}
                          >
                            {getProductInitials(cat.name)}
                          </span>
                          <span className="font-semibold text-[#09090B]">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 text-[#52525B]">{cat.description}</td>
                      <td className="px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#18181B] text-[12px] font-semibold tabular-nums">
                          {count} sản phẩm
                        </span>
                      </td>
                      <td className="px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditCatModal(cat)}
                            className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-medium text-[#18181B] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#52525B]" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[12px] font-medium text-[#52525B] hover:text-[#DC2626] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {mainView === 'products' && (
          <div className="px-5 py-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between text-[12px] text-[#71717A]">
            <span>
              Hiển thị <strong className="text-[#18181B]">{filteredProducts.length}</strong> /{' '}
              <strong className="text-[#18181B]">{products.length}</strong> sản phẩm
            </span>
            <span>Chế độ hiển thị: {displayMode === 'table' ? 'Bảng chi tiết' : 'Lưới thẻ hình ảnh'}</span>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deleting Product */}
      {confirmDeleteProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[400px] rounded-[12px] border border-[#E4E4E7] shadow-xl p-5">
            <h3 className="text-[15px] font-bold text-[#09090B]">
              Xác nhận xóa sản phẩm?
            </h3>
            <p className="text-[13px] text-[#52525B] mt-1.5 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm{' '}
              <strong className="text-[#09090B]">&ldquo;{confirmDeleteProduct.name}&rdquo;</strong> khỏi
              danh mục không?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProduct(null)}
                className="h-[34px] px-3.5 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12.5px] font-medium text-[#18181B] cursor-pointer"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(confirmDeleteProduct.id);
                  showToast(`Đã xóa sản phẩm "${confirmDeleteProduct.name}".`);
                  setConfirmDeleteProduct(null);
                }}
                className="h-[34px] px-3.5 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12.5px] font-semibold cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Product with Image Upload & URL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-[540px] rounded-[12px] border border-[#E4E4E7] shadow-xl overflow-hidden my-auto">
            <div className="px-5 py-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#09090B]">
                  {editingProduct ? 'Chỉnh sửa thông tin Sản phẩm' : 'Thêm Sản phẩm mới'}
                </h3>
                <p className="text-[12px] text-[#71717A]">
                  Tải hình ảnh sản phẩm, điền mã SKU, ngành hàng và giá bán
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto admin-scroll">
              {formErr && (
                <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-[12.5px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}

              {/* IMAGE UPLOAD & PREVIEW SECTION */}
              <div className="p-3.5 rounded-[10px] bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-semibold text-[#18181B] flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-[#2563EB]" />
                    <span>Hình ảnh sản phẩm</span>
                  </label>

                  <div className="inline-flex rounded-[6px] bg-[#E4E4E7]/70 p-0.5 text-[11.5px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-0.5 rounded-[5px] font-medium cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-[#09090B] shadow-2xs'
                          : 'text-[#52525B]'
                      }`}
                    >
                      Chọn file từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-0.5 rounded-[5px] font-medium cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-white text-[#09090B] shadow-2xs'
                          : 'text-[#52525B]'
                      }`}
                    >
                      Dán link URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Live Thumbnail Preview Box */}
                  <div className="relative w-[76px] h-[76px] rounded-[10px] border border-[#CBD5E1] bg-white overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Xem trước"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          title="Xóa ảnh"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 text-white flex items-center justify-center text-[10px] hover:bg-black cursor-pointer"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-[#A1A1AA]">
                        <ImagePlus className="w-6 h-6 mx-auto" />
                        <span className="text-[10px] block mt-0.5">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Trigger or URL Input */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {imageInputMode === 'upload' ? (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-[38px] px-3 rounded-[8px] border border-dashed border-[#93C5FD] bg-[#EFF6FF]/60 hover:bg-[#EFF6FF] text-[#1D4ED8] text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Tải ảnh từ máy tính lên (JPG, PNG, WEBP)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#2563EB] px-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-[#71717A] shrink-0" />
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-transparent text-[12.5px] text-[#09090B] outline-none"
                        />
                      </div>
                    )}

                    {/* Quick Sample Images Picker */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-[#71717A]">Ảnh mẫu nhanh:</span>
                      {SAMPLE_IMAGES.map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => setImageUrl(sample.url)}
                          className="px-2 py-0.5 rounded-[5px] bg-white border border-[#E4E4E7] hover:border-[#2563EB] hover:text-[#2563EB] text-[11px] font-medium text-[#52525B] cursor-pointer"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Tai nghe Bluetooth Sony, Nồi chiên không dầu, Áo Polo..."
                  className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Category selection + quick inline add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12.5px] font-medium text-[#18181B]">
                    Danh mục ngành hàng *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingInlineCat((prev) => !prev)}
                    className="text-[12px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {isAddingInlineCat ? '← Chọn danh mục có sẵn' : '+ Tạo danh mục mới'}
                  </button>
                </div>

                {!isAddingInlineCat ? (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 text-[13px] outline-none focus:border-[#2563EB]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inlineCatName}
                      onChange={(e) => setInlineCatName(e.target.value)}
                      placeholder="Nhập tên ngành hàng mới (VD: Đồ thể thao, Sách...)"
                      className="flex-1 h-[38px] rounded-[8px] border border-[#2563EB] bg-[#EFF6FF]/30 px-3 text-[13px] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategoryInModal}
                      className="h-[38px] px-3.5 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-semibold cursor-pointer shrink-0"
                    >
                      Lưu DM
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Mã SKU *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="VD: SP-101"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Giá bán niêm yết (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250000"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Phân loại / Màu sắc
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="VD: Đen, Bản 256GB, Vị Dâu..."
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Quy cách / Kích cỡ
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="VD: Hộp 500g, 15 inch, Size L..."
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Trạng thái hiển thị
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'hidden')}
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 text-[13px] outline-none focus:border-[#2563EB]"
                  >
                    <option value="active">Đang bán</option>
                    <option value="hidden">Tạm ẩn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Mô tả ngắn
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ghi chú đặc điểm sản phẩm..."
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12.5px] font-medium text-[#18181B] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold cursor-pointer"
                >
                  {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Category */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[420px] rounded-[12px] border border-[#E4E4E7] shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#09090B]">
                {editingCat ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục ngành hàng'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="w-7 h-7 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              {catErr && (
                <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-[12.5px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{catErr}</span>
                </div>
              )}

              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                  Tên danh mục ngành hàng *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="VD: Thiết bị điện tử, Đồ gia dụng, Thực phẩm..."
                  className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                  Mô tả danh mục
                </label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Mô tả ngắn về nhóm hàng hóa này..."
                  className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12.5px] font-medium text-[#18181B] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold cursor-pointer"
                >
                  {editingCat ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
