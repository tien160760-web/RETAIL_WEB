import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ImagePlus,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  bentoItemVariants,
  pageContainerVariants,
} from '../components/ui/MotionPrimitives';
import { SelectField } from '../components/ui/SelectField';
import { useAdminContext } from '../context/AdminContext';
import { ProductVariantItem } from '../types/dashboard';

const COLOR_OPTIONS = ['Đen', 'Trắng', 'Xanh Navy', 'Xanh Rêu', 'Be Sáng', 'Nâu Đất', 'Xám Khói'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', '29', '30', '31', '32', 'FreeSize'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { categories, products, addProduct, updateProduct } = useAdminContext();

  const existingProduct = useMemo(
    () => (id ? products.find((p) => p.id === id) : undefined),
    [id, products]
  );

  const isEditing = Boolean(existingProduct);

  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);

  const [variants, setVariants] = useState<ProductVariantItem[]>([
    { id: `var-${Date.now()}-1`, sku: '', color: 'Đen', size: 'M', price: 0 },
  ]);

  const [errors, setErrors] = useState<{
    name?: string;
    basePrice?: string;
    categoryId?: string;
    skuErrors: Record<string, string>;
    priceErrors: Record<string, string>;
    variantImageErrors: Record<string, string>;
  }>({ skuErrors: {}, priceErrors: {}, variantImageErrors: {} });

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setBasePrice(String(existingProduct.basePrice));
      setDescription(existingProduct.description);
      setCategoryId(existingProduct.categoryId);
      setIsActive(existingProduct.isActive);
      setImageUrl(existingProduct.imageUrl);
      setVariants(
        existingProduct.variants.length > 0
          ? existingProduct.variants
          : [
              {
                id: `var-${Date.now()}`,
                sku: '',
                color: 'Đen',
                size: 'M',
                price: existingProduct.basePrice,
              },
            ]
      );
    }
  }, [existingProduct]);

  const readImageFile = (
    file: File,
    onSuccess: (url: string) => void,
    onError: (msg: string) => void
  ) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError('Chỉ chấp nhận định dạng ảnh .jpg, .png hoặc .webp.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError('Dung lượng ảnh vượt quá giới hạn 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSuccess(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    readImageFile(
      file,
      (url) => setImageUrl(url),
      (msg) => setImageError(msg)
    );
    e.target.value = '';
  };

  const handleVariantImageSelect = (variantId: string, file?: File) => {
    if (!file) return;
    setErrors((prev) => {
      const nextVarImgErr = { ...prev.variantImageErrors };
      delete nextVarImgErr[variantId];
      return { ...prev, variantImageErrors: nextVarImgErr };
    });

    readImageFile(
      file,
      (url) => {
        setVariants((prev) =>
          prev.map((v) => (v.id === variantId ? { ...v, imageUrl: url } : v))
        );
      },
      (msg) => {
        setErrors((prev) => ({
          ...prev,
          variantImageErrors: { ...prev.variantImageErrors, [variantId]: msg },
        }));
      }
    );
  };

  const handleAddVariantRow = () => {
    const parsedBase = Number(basePrice) || 0;
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${prev.length + 1}`,
        sku: '',
        color: COLOR_OPTIONS[prev.length % COLOR_OPTIONS.length],
        size: SIZE_OPTIONS[prev.length % SIZE_OPTIONS.length],
        price: parsedBase,
      },
    ]);
  };

  const handleRemoveVariantRow = (variantId: string) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleUpdateVariant = (
    variantId: string,
    patch: Partial<ProductVariantItem>
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, ...patch } : v))
    );
    if (patch.sku !== undefined) {
      setErrors((prev) => {
        const nextSku = { ...prev.skuErrors };
        delete nextSku[variantId];
        return { ...prev, skuErrors: nextSku };
      });
    }
    if (patch.price !== undefined) {
      setErrors((prev) => {
        const nextPrice = { ...prev.priceErrors };
        delete nextPrice[variantId];
        return { ...prev, priceErrors: nextPrice };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {
      skuErrors: {},
      priceErrors: {},
      variantImageErrors: { ...errors.variantImageErrors },
    };

    if (!name.trim()) {
      nextErrors.name = 'Vui lòng nhập tên sản phẩm.';
    }
    const parsedBasePrice = Number(basePrice);
    if (!basePrice || Number.isNaN(parsedBasePrice) || parsedBasePrice <= 0) {
      nextErrors.basePrice = 'Giá bán cơ sở phải lớn hơn 0.';
    }
    if (!categoryId) {
      nextErrors.categoryId = 'Vui lòng chọn danh mục sản phẩm.';
    }

    const externalSkus = new Set(
      products
        .filter((p) => p.id !== existingProduct?.id)
        .flatMap((p) => p.variants.map((v) => v.sku.trim().toUpperCase()))
    );

    const seenLocalSkus = new Map<string, string>();
    for (const v of variants) {
      const skuUpper = v.sku.trim().toUpperCase();
      if (!skuUpper) {
        nextErrors.skuErrors[v.id] = 'Bắt buộc nhập mã SKU.';
      } else if (externalSkus.has(skuUpper)) {
        nextErrors.skuErrors[v.id] = 'Mã SKU đã tồn tại ở sản phẩm khác.';
      } else if (seenLocalSkus.has(skuUpper)) {
        nextErrors.skuErrors[v.id] = 'Mã SKU bị trùng trong bảng biến thể.';
        const firstId = seenLocalSkus.get(skuUpper)!;
        nextErrors.skuErrors[firstId] = 'Mã SKU bị trùng trong bảng biến thể.';
      } else {
        seenLocalSkus.set(skuUpper, v.id);
      }

      if (!v.price || v.price <= 0) {
        nextErrors.priceErrors[v.id] = 'Giá phải > 0';
      }
    }

    const hasError =
      Boolean(nextErrors.name) ||
      Boolean(nextErrors.basePrice) ||
      Boolean(nextErrors.categoryId) ||
      Boolean(imageError) ||
      Object.keys(nextErrors.skuErrors).length > 0 ||
      Object.keys(nextErrors.priceErrors).length > 0 ||
      Object.keys(nextErrors.variantImageErrors).length > 0;

    setErrors(nextErrors);
    if (hasError) return;

    const payload = {
      name: name.trim(),
      categoryId,
      basePrice: parsedBasePrice,
      description: description.trim(),
      imageUrl,
      colorHex: existingProduct?.colorHex ?? '#2563EB',
      isActive,
      variants: variants.map((v) => ({
        ...v,
        sku: v.sku.trim().toUpperCase(),
      })),
    };

    if (existingProduct) {
      updateProduct(existingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    navigate('/catalog');
  };

  return (
    <motion.form
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={handleSubmit}
      className="w-full space-y-[14px]"
    >
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
            {isEditing ? 'Chỉnh sửa Sản phẩm & Biến thể' : 'Thêm Sản phẩm mới'}
          </h2>
          <p className="text-[12px] text-[#475569] mt-[2px]">
            Nhập thông tin sản phẩm, tải ảnh đại diện và cấu hình ma trận biến thể màu sắc, kích cỡ, mã SKU
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="h-[34px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="h-[34px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
          >
            Xác nhận Lưu SP
          </button>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full">
        <motion.section
          variants={bentoItemVariants}
          className="lg:col-span-7 xl:col-span-8 glass-card glass-card-subtle rounded-[16px] p-4 xl:p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[14.5px] font-bold text-[#0F172A]">
              Thông tin chung của Sản phẩm
            </h3>
            <label className="inline-flex items-center gap-2 text-[12px] font-medium text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#2563EB] rounded"
              />
              <span>Hiển thị bán ngay</span>
            </label>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                Tên sản phẩm <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Nhập tên sản phẩm..."
                className={`w-full h-[38px] px-3 rounded-[10px] border text-[12px] outline-none transition-all ${
                  errors.name
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                    : 'border-[#CBD5E1] bg-white/90 focus:bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-[#DC2626] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="w-[240px]">
              <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                Giá bán cơ sở (VNĐ) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={basePrice}
                onChange={(e) => {
                  setBasePrice(e.target.value);
                  setErrors((prev) => ({ ...prev, basePrice: undefined }));
                }}
                placeholder="VD: 450000"
                className={`w-full h-[38px] px-3 rounded-[10px] border text-[12px] tabular-nums outline-none transition-all ${
                  errors.basePrice
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                    : 'border-[#CBD5E1] bg-white/90 focus:bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                }`}
              />
              {errors.basePrice && (
                <p className="mt-1 text-[11px] text-[#DC2626] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.basePrice}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
              Mô tả sản phẩm
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết, chất liệu, hướng dẫn bảo quản..."
              className="w-full p-3 rounded-[10px] border border-[#CBD5E1] bg-white/90 focus:bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] text-[12px] outline-none resize-none transition-all"
            />
          </div>
        </motion.section>

        <motion.section
          variants={bentoItemVariants}
          className="lg:col-span-5 xl:col-span-4 glass-card glass-card-subtle rounded-[16px] p-4 xl:p-5 space-y-4"
        >
          <h3 className="text-[14.5px] font-bold text-[#0F172A]">
            Danh mục &amp; Hình ảnh
          </h3>

          <div>
            <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
              Danh mục sản phẩm <span className="text-[#DC2626]">*</span>
            </label>
            <SelectField
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                setErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
              placeholder="Chọn danh mục sản phẩm"
              heightClass="h-[38px]"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            {errors.categoryId && (
              <p className="mt-1 text-[11px] text-[#DC2626]">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <input
              ref={mainFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleMainImageSelect}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative h-[106px] rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF]/60 p-2.5 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Ảnh đại diện sản phẩm"
                  className="w-[86px] h-[86px] rounded-[10px] object-cover border border-[#DBEAFE]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#0F172A]">
                    Đã tải ảnh sản phẩm
                  </p>
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    className="mt-1.5 text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Đổi ảnh khác
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(undefined)}
                  className="p-1 text-[#64748B] hover:text-[#DC2626] cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => mainFileInputRef.current?.click()}
                className={`w-full h-[106px] rounded-[12px] border-[1.5px] border-dashed flex flex-col items-center justify-center text-center px-4 transition-all cursor-pointer ${
                  imageError
                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                    : 'border-[#93C5FD] bg-[#EFF6FF]/45 hover:border-[#2563EB] hover:bg-[#EFF6FF]/85'
                }`}
              >
                <UploadCloud className="w-6 h-6 text-[#2563EB] mb-1.5" />
                <span className="text-[12px] font-bold text-[#0F172A]">
                  Bấm để tải hình ảnh sản phẩm
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5">
                  Hỗ trợ .jpg, .png, .webp · Tối đa 5MB
                </span>
              </button>
            )}

            {imageError && (
              <p className="mt-1 text-[11px] font-medium text-[#DC2626] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{imageError}</span>
              </p>
            )}
          </div>
        </motion.section>
      </div>

      <motion.section
        variants={bentoItemVariants}
        className="w-full glass-card glass-card-subtle rounded-[16px] p-4 xl:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <h3 className="text-[14.5px] font-bold text-[#0F172A]">
            Quản lý Biến thể Sản phẩm (Màu sắc × Kích cỡ × Mã SKU × Giá biến thể)
          </h3>

          <button
            type="button"
            onClick={handleAddVariantRow}
            className="h-[34px] px-3.5 rounded-[10px] bg-[#EFF6FF] border border-[#93C5FD] hover:bg-[#DBEAFE] hover:border-[#3B82F6] text-[12px] font-bold text-[#1D4ED8] inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm dòng biến thể</span>
          </button>
        </div>

        <div className="border border-[#DBEAFE] rounded-[12px] overflow-x-auto bg-white/80">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-3 w-[130px]">Ảnh biến thể</th>
                <th className="px-3 w-[170px]">Màu sắc *</th>
                <th className="px-3 w-[160px]">Kích cỡ (Size) *</th>
                <th className="px-3 w-[320px]">Mã SKU *</th>
                <th className="px-3 w-[230px]">Giá bán theo biến thể *</th>
                <th className="px-3 w-[100px] text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px]">
              {variants.map((v) => {
                const skuErr = errors.skuErrors[v.id];
                const priceErr = errors.priceErrors[v.id];
                const varImgErr = errors.variantImageErrors[v.id];
                return (
                  <tr key={v.id} className="hover:bg-[#EFF6FF]/45 align-top transition-colors">
                    <td className="px-3 py-2.5">
                      <label className="inline-flex items-center gap-1.5 h-[34px] px-2.5 rounded-[8px] border border-[#CBD5E1] bg-white hover:border-[#60A5FA] text-[11px] font-semibold text-[#334155] cursor-pointer transition-colors">
                        {v.imageUrl ? (
                          <img
                            src={v.imageUrl}
                            alt={v.sku}
                            className="w-5 h-5 rounded object-cover"
                          />
                        ) : (
                          <ImagePlus className="w-3.5 h-3.5 text-[#2563EB]" />
                        )}
                        <span>{v.imageUrl ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={(e) => {
                            handleVariantImageSelect(v.id, e.target.files?.[0]);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                      {varImgErr && (
                        <p className="mt-1 text-[10px] text-[#DC2626]">{varImgErr}</p>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        list="variant-colors"
                        value={v.color}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, { color: e.target.value })
                        }
                        placeholder="Nhập màu..."
                        className="w-full h-[34px] px-2.5 rounded-[8px] border border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] bg-white text-[12px] outline-none transition-all"
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        list="variant-sizes"
                        value={v.size}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, { size: e.target.value })
                        }
                        placeholder="Nhập size..."
                        className="w-full h-[34px] px-2.5 rounded-[8px] border border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] bg-white text-[12px] outline-none transition-all"
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, { sku: e.target.value })
                        }
                        placeholder="VD: APL-DEN-XL"
                        className={`w-full h-[34px] px-2.5 rounded-[8px] border font-mono text-[12px] uppercase outline-none transition-all ${
                          skuErr
                            ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                            : 'border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] bg-white'
                        }`}
                      />
                      {skuErr && (
                        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                          {skuErr}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={v.price || ''}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, {
                            price: Number(e.target.value),
                          })
                        }
                        placeholder="Nhập giá biến thể..."
                        className={`w-full h-[34px] px-2.5 rounded-[8px] border tabular-nums text-[12px] outline-none transition-all ${
                          priceErr
                            ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                            : 'border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] bg-white'
                        }`}
                      />
                      {priceErr && (
                        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                          {priceErr}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        disabled={variants.length <= 1}
                        onClick={() => handleRemoveVariantRow(v.id)}
                        className="h-[34px] px-2.5 rounded-[8px] border border-[#FECACA] bg-white hover:bg-[#FEF2F2] disabled:opacity-40 disabled:cursor-not-allowed text-[#DC2626] inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Xóa dòng biến thể"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <datalist id="variant-colors">
          {COLOR_OPTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <datalist id="variant-sizes">
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </motion.section>
    </motion.form>
  );
}
