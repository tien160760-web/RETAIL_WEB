import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { CatalogProduct } from '../types/dashboard';
import { formatVND } from '../utils/format';

export function CatalogPage() {
  const {
    categories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useAdminContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Simple modal state for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'cat-ao');
  const [sku, setSku] = useState('');
  const [color, setColor] = useState('Đen');
  const [size, setSize] = useState('L');
  const [price, setPrice] = useState('250000');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'hidden'>('active');
  const [formErr, setFormErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id ?? 'cat-ao');
    setSku(`SP-${Math.floor(100 + Math.random() * 900)}`);
    setColor('Đen');
    setSize('L');
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
    setSku(firstVar?.sku ?? 'SP-001');
    setColor(firstVar?.color ?? 'Đen');
    setSize(firstVar?.size ?? 'L');
    setPrice(String(firstVar?.price ?? product.basePrice));
    setDescription(product.description);
    setStatus(product.isActive ? 'active' : 'hidden');
    setFormErr(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);

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

    // Check duplicate SKU
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
      categoryId,
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
          size: size.trim() || 'Free',
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

      {/* Header + Add Button */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">
            Danh sách Sản phẩm ({products.length})
          </h2>
          <p className="text-[12.5px] text-[#64748B]">
            Thêm mới, chỉnh sửa hoặc xóa sản phẩm trong hệ thống
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-[36px] px-3.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-[#64748B] shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
          className="w-full text-[13px] text-[#0F172A] outline-none"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[680px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11.5px] font-bold text-[#475569] h-[40px]">
              <th className="px-4">Mã SKU</th>
              <th className="px-4">Tên sản phẩm</th>
              <th className="px-4">Danh mục</th>
              <th className="px-4">Phân loại (Màu / Size)</th>
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
                    <td className="px-4 text-[#475569]">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-4 text-[#475569]">
                      {firstVar ? `${firstVar.color} / ${firstVar.size}` : 'Mặc định'}
                      {product.variants.length > 1 && (
                        <span className="ml-1 text-[11px] text-[#64748B]">
                          (+{product.variants.length - 1} biến thể)
                        </span>
                      )}
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

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[480px] rounded-[10px] border border-[#CBD5E1] shadow-lg overflow-hidden">
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
                  placeholder="VD: Áo Polo Nam Basic"
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
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
                    Danh mục
                  </label>
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
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Màu sắc
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Đen, Trắng..."
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Kích cỡ (Size)
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="S, M, L, XL..."
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
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
    </div>
  );
}
