import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
  SPRING_PILL,
} from '../components/ui/MotionPrimitives';
import { SelectField } from '../components/ui/SelectField';
import { useAdminContext } from '../context/AdminContext';
import { CatalogCategory } from '../types/dashboard';
import { formatVND } from '../utils/format';

export function CatalogPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    deleteProduct,
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [categoryDeleteError, setCategoryDeleteError] = useState<string | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CatalogCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catNameError, setCatNameError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const openCreateCategory = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setCatNameError(null);
    setIsCatModalOpen(true);
  };

  const openEditCategory = (cat: CatalogCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatNameError(null);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = catName.trim();
    if (!trimmed) {
      setCatNameError('Tên danh mục không được để trống.');
      return;
    }
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmed.toLowerCase() &&
        c.id !== editingCat?.id
    );
    if (isDuplicate) {
      setCatNameError('Tên danh mục đã tồn tại trong hệ thống.');
      return;
    }

    if (editingCat) {
      updateCategory(editingCat.id, { name: trimmed, description: catDesc.trim() });
      showToast(`Đã cập nhật danh mục "${trimmed}".`);
    } else {
      addCategory({ name: trimmed, description: catDesc.trim() });
      showToast(`Đã thêm danh mục mới "${trimmed}".`);
    }
    setIsCatModalOpen(false);
  };

  const handleDeleteCategory = (cat: CatalogCategory) => {
    setCategoryDeleteError(null);
    const ok = deleteCategory(cat.id);
    if (!ok) {
      setCategoryDeleteError(
        `Không thể xóa danh mục "${cat.name}" vì đang có sản phẩm thuộc danh mục này.`
      );
      return;
    }
    showToast(`Đã xóa danh mục "${cat.name}".`);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (filterCategoryId !== 'all' && p.categoryId !== filterCategoryId) return false;
      if (filterStatus === 'active' && !p.isActive) return false;
      if (filterStatus === 'hidden' && p.isActive) return false;
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.variants.some((v) => v.sku.toLowerCase().includes(q));
        if (!matchName && !matchSku) return false;
      }
      return true;
    });
  }, [products, searchQuery, filterCategoryId, filterStatus]);

  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name ?? 'Chưa phân loại';

  const getPriceDisplay = (p: (typeof products)[number]) => {
    if (p.variants.length === 0) return formatVND(p.basePrice);
    const prices = p.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
  };

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full space-y-[14px] relative"
    >
      {toastMsg && (
        <div className="fixed bottom-5 right-6 z-50 bg-[#0B1736]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-[12px] shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)] border border-[#60A5FA]/35 flex items-center gap-2 text-[12px] font-medium animate-fade-up">
          <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
            Quản lý Danh mục &amp; Sản phẩm
          </h2>
          <p className="text-[12px] text-[#475569] mt-[2px]">
            Quản lý danh sách sản phẩm, biến thể theo màu sắc / kích cỡ và nhóm danh mục
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openCreateCategory}
            className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Thêm Danh mục</span>
          </button>

          <Link
            to="/catalog/new"
            className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Sản phẩm mới</span>
          </Link>
        </div>
      </motion.section>

      {/* Tabs */}
      <motion.div
        variants={bentoItemVariants}
        className="inline-flex items-center gap-1 p-1 rounded-[12px] glass-card"
      >
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold transition-colors duration-200 cursor-pointer ${
            activeTab === 'products'
              ? 'text-white'
              : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'products' && (
            <motion.div
              layoutId="catalog-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <span className="relative z-10">
            Danh sách Sản phẩm &amp; Biến thể ({products.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('categories');
            setCategoryDeleteError(null);
          }}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold transition-colors duration-200 cursor-pointer ${
            activeTab === 'categories'
              ? 'text-white'
              : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'categories' && (
            <motion.div
              layoutId="catalog-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <span className="relative z-10">
            Danh mục sản phẩm ({categories.length})
          </span>
        </button>
      </motion.div>

      {activeTab === 'products' ? (
        <>
          <section className="w-full min-h-[54px] glass-card rounded-[14px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 relative z-20">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              <div className="w-full sm:w-[280px] xl:w-[320px] h-[34px] rounded-[10px] border border-[#CBD5E1] hover:border-[#60A5FA] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] px-3 flex items-center gap-2 bg-white/90 transition-all">
                <Search className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo Tên sản phẩm hoặc Mã SKU..."
                  className="w-full bg-transparent text-[12px] text-[#0F172A] placeholder:text-[#64748B] outline-none"
                />
              </div>

              <SelectField
                value={filterCategoryId}
                onChange={setFilterCategoryId}
                className="w-[180px]"
                heightClass="h-[34px]"
                options={[
                  { value: 'all', label: 'Tất cả danh mục' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <SelectField
                value={filterStatus}
                onChange={(val) =>
                  setFilterStatus(val as 'all' | 'active' | 'hidden')
                }
                className="w-[162px]"
                heightClass="h-[34px]"
                options={[
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'active', label: 'Đang bán' },
                  { value: 'hidden', label: 'Đang ẩn' },
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterCategoryId('all');
                setFilterStatus('all');
              }}
              className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer shrink-0"
            >
              Xóa bộ lọc
            </button>
          </section>

          <section className="w-full glass-card rounded-[16px] overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-[14px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-[14px] font-bold text-[#0F172A]">
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <p className="text-[12px] text-[#64748B] mt-1">
                  Thử thay đổi từ khóa tìm kiếm hoặc bấm Xóa bộ lọc để xem toàn bộ danh sách.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategoryId('all');
                    setFilterStatus('all');
                  }}
                  className="mt-4 h-[34px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[44px]">
                    <th className="px-3.5 w-[70px]">Ảnh</th>
                    <th className="px-3.5">Tên sản phẩm</th>
                    <th className="px-3.5 w-[15%]">Danh mục</th>
                    <th className="px-3.5 w-[18%]">Giá gốc / Khoảng giá</th>
                    <th className="px-3.5 w-[21%]">Biến thể (Màu × Size)</th>
                    <th className="px-3.5 w-[154px] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[66px]">
                      <td className="px-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-[10px] object-cover border border-[#DBEAFE] shadow-xs"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white shadow-[0_4px_10px_rgba(37,99,235,0.2)]"
                            style={{ backgroundColor: product.colorHex }}
                          >
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="px-4">
                        <p className="font-bold text-[#0F172A]">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                              product.isActive
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {product.isActive ? 'Đang bán' : 'Đang ẩn'}
                          </span>
                          <span className="text-[11px] text-[#64748B] truncate max-w-[175px]">
                            {product.description || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 text-[#334155] font-medium">
                        {getCategoryName(product.categoryId)}
                      </td>

                      <td className="px-4 font-semibold text-[#0F172A] tabular-nums">
                        {getPriceDisplay(product)}
                      </td>

                      <td className="px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-bold">
                          {product.variants.length} biến thể SKU
                        </span>
                        <p className="text-[11px] font-mono text-[#64748B] truncate mt-1">
                          {product.variants.map((v) => v.sku).join(', ')}
                        </p>
                      </td>

                      <td className="px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/catalog/${product.id}/edit`}
                            className="h-[32px] px-3 rounded-[8px] btn-glass text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#2563EB]" />
                            <span>Chỉnh sửa</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProduct(product.id);
                              showToast(`Đã xóa sản phẩm "${product.name}".`);
                            }}
                            title="Xóa sản phẩm"
                            className="h-[32px] px-2.5 rounded-[8px] bg-white/90 border border-[#FECACA] hover:bg-[#FEF2F2] hover:border-[#F87171] text-[#DC2626] inline-flex items-center cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      ) : (
        <section className="space-y-3">
          {categoryDeleteError && (
            <div className="w-full rounded-[12px] bg-[#FEF2F2]/95 border border-[#FCA5A5] px-4 py-2.5 flex items-center justify-between text-[12px] text-[#991B1B]">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>{categoryDeleteError}</span>
              </div>
              <button
                type="button"
                onClick={() => setCategoryDeleteError(null)}
                className="text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="w-full glass-card rounded-[16px] overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[44px]">
                  <th className="px-4 w-[24%]">Tên danh mục</th>
                  <th className="px-4">Mô tả danh mục</th>
                  <th className="px-4 w-[13%] text-right">Số sản phẩm</th>
                  <th className="px-4 w-[165px] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[58px]">
                      <td className="px-4 font-bold text-[#0F172A]">
                        {cat.name}
                      </td>
                      <td className="px-4 text-[#475569]">
                        {cat.description || '—'}
                      </td>
                      <td className="px-4 text-right font-bold tabular-nums text-[#2563EB]">
                        {count}
                      </td>
                      <td className="px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditCategory(cat)}
                            className="h-[32px] px-3 rounded-[8px] btn-glass text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#2563EB]" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="h-[32px] px-3 rounded-[8px] bg-white/90 border border-[#FECACA] hover:bg-[#FEF2F2] text-[11px] font-bold text-[#DC2626] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
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
        </section>
      )}

      <AnimatePresence>
        {isCatModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-[#0B1736]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EXPO_EASE } }}
              exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.16 } }}
              className="w-full max-w-[540px] glass-popover rounded-[16px] overflow-hidden"
            >
            <div className="px-5 py-4 bg-[#EFF6FF]/80 border-b border-[#DBEAFE] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {editingCat ? 'Chỉnh sửa Danh mục sản phẩm' : 'Thêm mới Danh mục sản phẩm'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 bg-white/90">
              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                  Tên danh mục <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatNameError(null);
                  }}
                  placeholder="Nhập tên danh mục sản phẩm..."
                  className={`w-full h-[38px] px-3 rounded-[10px] border text-[12px] outline-none transition-all ${
                    catNameError
                      ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                      : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                  }`}
                />
                {catNameError && (
                  <p className="mt-1 text-[11px] font-medium text-[#DC2626] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{catNameError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                  Mô tả danh mục
                </label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Nhập mô tả ngắn cho danh mục..."
                  className="w-full p-3 rounded-[10px] border border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] text-[12px] outline-none resize-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                >
                  Lưu danh mục
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
