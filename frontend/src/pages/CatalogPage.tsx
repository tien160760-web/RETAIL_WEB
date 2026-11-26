import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FolderPlus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { CatalogCategory, CatalogProduct } from '../types/dashboard';
import { formatVND } from '../utils/format';

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

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);

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
  const [formErr, setFormErr] = useState<string | null>(null);

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

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (filterCategoryId !== 'all' && p.categoryId !== filterCategoryId) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery, filterCategoryId]);

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
    setFormErr(null);
    setIsModalOpen(true);
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
      description: `Danh mục ${clean}`,
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
          description: `Danh mục ${cleanCat}`,
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

    const payload: Omit<CatalogProduct, 'id'> = {
      name: cleanName,
      categoryId: finalCategoryId,
      basePrice: numPrice,
      description: description.trim() || 'Sản phẩm bán lẻ',
      isActive: status === 'active',
      colorHex: '#2563EB',
      imageUrl: '',
      variants: [
        {
          id: editingProduct?.variants[0]?.id ?? `var-${Date.now()}`,
          sku: cleanSku,
          color: color.trim() || 'Mặc định',
          size: size.trim() || 'Tiêu chuẩn',
          price: numPrice,
          imageUrl: '',
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
        description: catDesc.trim() || `Danh mục ${clean}`,
      });
      showToast(`Đã cập nhật danh mục "${clean}".`);
    } else {
      addCategory({
        name: clean,
        description: catDesc.trim() || `Danh mục ${clean}`,
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
    <div className="space-y-4">
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-[8px] shadow-md flex items-center gap-2 text-[12.5px]">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {bannerErr && (
        <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-between text-[12.5px] text-[#991B1B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{bannerErr}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerErr(null)}
            className="text-[11px] font-bold underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header + Action Buttons */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">
            Quản lý Sản phẩm &amp; Danh mục
          </h2>
          <p className="text-[12.5px] text-[#64748B]">
            Hỗ trợ mọi ngành hàng (Điện tử, Gia dụng, Thực phẩm, Mỹ phẩm, Thời trang...) — tự do tạo thêm danh mục mới
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateCatModal}
            className="h-[36px] px-3 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#0F172A] text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#2563EB]" />
            <span>+ Thêm danh mục</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-[36px] px-3.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Tabs: Sản phẩm / Danh mục */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-[8px] bg-white border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`h-[32px] px-3.5 rounded-[6px] text-[12.5px] font-semibold cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#2563EB] text-white'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Danh sách Sản phẩm ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`h-[32px] px-3.5 rounded-[6px] text-[12.5px] font-semibold cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#2563EB] text-white'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Danh mục ngành hàng ({categories.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-[520px] justify-end">
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="h-[36px] rounded-[8px] border border-[#E2E8F0] bg-white px-3 text-[12.5px] text-[#0F172A] outline-none focus:border-[#2563EB]"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="bg-white rounded-[8px] border border-[#E2E8F0] px-3 h-[36px] flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#64748B] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên sản phẩm, SKU..."
                className="w-full text-[12.5px] text-[#0F172A] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Product Table */}
      {activeTab === 'products' ? (
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[680px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11.5px] font-bold text-[#475569] h-[40px]">
                <th className="px-4">Mã SKU</th>
                <th className="px-4">Tên sản phẩm</th>
                <th className="px-4">Danh mục</th>
                <th className="px-4">Phân loại / Quy cách</th>
                <th className="px-4 text-right">Giá bán</th>
                <th className="px-4 text-center">Trạng thái</th>
                <th className="px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#64748B]">
                    Chưa có sản phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const firstVar = product.variants[0];
                  return (
                    <tr key={product.id} className="hover:bg-[#F8FAFC] h-[52px]">
                      <td className="px-4 font-mono text-[12px] font-semibold text-[#2563EB]">
                        {firstVar?.sku ?? 'N/A'}
                      </td>
                      <td className="px-4 font-semibold text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#64748B] shrink-0" />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[11.5px] font-medium">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>
                      <td className="px-4 text-[#475569]">
                        {firstVar ? `${firstVar.color} / ${firstVar.size}` : 'Mặc định'}
                      </td>
                      <td className="px-4 text-right font-bold text-[#0F172A] tabular-nums">
                        {formatVND(firstVar?.price ?? product.basePrice)}
                      </td>
                      <td className="px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            product.isActive
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          {product.isActive ? 'Đang bán' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="h-[28px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-medium text-[#334155] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProduct(product.id);
                              showToast(`Đã xóa sản phẩm "${product.name}".`);
                            }}
                            className="h-[28px] px-2.5 rounded-[6px] border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[12px] font-medium text-[#DC2626] inline-flex items-center gap-1 cursor-pointer"
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
        /* Tab 2: Categories Management Table */
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[560px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11.5px] font-bold text-[#475569] h-[40px]">
                <th className="px-4">Tên danh mục</th>
                <th className="px-4">Mô tả ngành hàng</th>
                <th className="px-4 text-center">Số sản phẩm</th>
                <th className="px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-[#F8FAFC] h-[52px]">
                    <td className="px-4 font-semibold text-[#0F172A]">
                      {cat.name}
                    </td>
                    <td className="px-4 text-[#475569]">{cat.description}</td>
                    <td className="px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[11.5px] font-bold">
                        {count} SP
                      </span>
                    </td>
                    <td className="px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditCatModal(cat)}
                          className="h-[28px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-medium text-[#334155] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="h-[28px] px-2.5 rounded-[6px] border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[12px] font-medium text-[#DC2626] inline-flex items-center gap-1 cursor-pointer"
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

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-[10px] border border-[#CBD5E1] shadow-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {editingProduct ? 'Sửa thông tin Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5">
              {formErr && (
                <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Tai nghe Bluetooth, Nồi chiên không dầu, Áo Polo..."
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Category selection + quick inline add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-semibold text-[#0F172A]">
                    Danh mục ngành hàng *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingInlineCat((prev) => !prev)}
                    className="text-[11.5px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {isAddingInlineCat ? '← Chọn danh mục có sẵn' : '+ Tạo danh mục mới'}
                  </button>
                </div>

                {!isAddingInlineCat ? (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-2.5 text-[13px] outline-none focus:border-[#2563EB]"
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
                      placeholder="Nhập tên danh mục mới (VD: Đồ thể thao, Sách...)"
                      className="flex-1 h-[36px] rounded-[8px] border border-[#2563EB] bg-[#EFF6FF]/40 px-3 text-[13px] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategoryInModal}
                      className="h-[36px] px-3 rounded-[8px] bg-[#2563EB] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                    >
                      Lưu DM
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Mã SKU *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="VD: SP-101"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250000"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Phân loại / Màu sắc
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="VD: Đen, Bản 256GB, Vị Dâu..."
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Quy cách / Kích cỡ
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="VD: Hộp 500g, 15 inch, Size L..."
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'hidden')}
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-2.5 text-[13px] outline-none focus:border-[#2563EB]"
                  >
                    <option value="active">Đang bán</option>
                    <option value="hidden">Tạm ẩn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Mô tả ngắn
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ghi chú sản phẩm..."
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[12.5px] font-semibold text-[#334155] cursor-pointer"
                >
                  Hủy
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
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[420px] rounded-[10px] border border-[#CBD5E1] shadow-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {editingCat ? 'Sửa Danh mục' : 'Thêm Danh mục ngành hàng mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-3.5">
              {catErr && (
                <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{catErr}</span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="VD: Điện thoại & Phụ kiện, Đồ gia dụng, Thực phẩm..."
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Mô tả danh mục
                </label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[12.5px] font-semibold text-[#334155] cursor-pointer"
                >
                  Hủy
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
