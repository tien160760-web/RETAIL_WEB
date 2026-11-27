import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  FolderPlus,
  ImagePlus,
  LayoutGrid,
  Layers,
  Link2,
  List,
  Loader2,
  Package,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import {
  CatalogCategory,
  CatalogProduct,
  ProductVariantItem,
} from '../types/dashboard';
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
    label: 'Áo Sơ mi',
    url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
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
    label: 'Gia dụng',
    url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
  },
];

const QUICK_COLORS = ['Đen', 'Trắng', 'Xanh Navy', 'Xám', 'Đỏ', 'Be', 'Hồng'];
const QUICK_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'FreeSize', '128GB', '256GB'];

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

function toSkuSlug(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase();
}

export function CatalogPage({
  routeAction,
}: {
  routeAction?: 'create' | 'edit';
} = {}) {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const {
    currentUser,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    createProductAsync,
    updateProductAsync,
    deleteProductAsync,
    fetchAdminProductById,
  } = useAdminContext();

  // UC06 Actor: Quản trị viên (Admin). Các vai trò khác chỉ được Xem & Tìm kiếm sản phẩm (UC05)
  const canManageCatalog = currentUser?.role === 'ADMIN';

  const [mainView, setMainView] = useState<'products' | 'categories'>('products');
  const [displayMode, setDisplayMode] = useState<'table' | 'grid'>('table');
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  // Expanded product row to view full Shopee-style variant matrix
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] =
    useState<CatalogProduct | null>(null);

  // Shopee Seller Center Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'ao-thun');
  const [isAddingInlineCat, setIsAddingInlineCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'hidden'>('active');

  // Multi-image Album state (up to 9 images like Shopee)
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shopee 2-tier Classification State (Nhóm Màu sắc & Nhóm Kích cỡ)
  const [colorList, setColorList] = useState<string[]>(['Đen', 'Trắng']);
  const [colorInput, setColorInput] = useState('');
  const [sizeList, setSizeList] = useState<string[]>(['M', 'L']);
  const [sizeInput, setSizeInput] = useState('');

  // Variant matrix rows (Color x Size -> Price, Stock, SKU)
  const [variantRows, setVariantRows] = useState<ProductVariantItem[]>([]);
  const [bulkPrice, setBulkPrice] = useState('450000');
  const [bulkStock, setBulkStock] = useState('30');
  const [bulkSkuPrefix, setBulkSkuPrefix] = useState('SP');

  const [formErr, setFormErr] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isLoadingEditProduct, setIsLoadingEditProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Category Modal State
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

  // Rebuild variant matrix whenever colors or sizes change
  const syncVariantMatrix = (
    nextColors: string[],
    nextSizes: string[],
    currentVariants: ProductVariantItem[],
    defaultPrice: number,
    prefix: string
  ) => {
    const effectiveColors = nextColors.length > 0 ? nextColors : ['Mặc định'];
    const effectiveSizes = nextSizes.length > 0 ? nextSizes : ['FreeSize'];

    const nextMatrix: ProductVariantItem[] = [];
    effectiveColors.forEach((c, cIdx) => {
      effectiveSizes.forEach((s, sIdx) => {
        const existing = currentVariants.find(
          (v) =>
            v.color.toLowerCase() === c.toLowerCase() &&
            v.size.toLowerCase() === s.toLowerCase()
        );
        if (existing) {
          nextMatrix.push(existing);
        } else {
          const autoSku = `${prefix || 'SP'}-${toSkuSlug(c) || cIdx + 1}-${toSkuSlug(s) || sIdx + 1}`;
          nextMatrix.push({
            id: `var-${Date.now()}-${cIdx}-${sIdx}`,
            color: c,
            size: s,
            price: defaultPrice > 0 ? defaultPrice : 250000,
            stock: 25,
            sku: autoSku,
          });
        }
      });
    });
    setVariantRows(nextMatrix);
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
        p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(q) ||
            v.color.toLowerCase().includes(q) ||
            v.size.toLowerCase().includes(q)
        )
      );
    });
  }, [products, searchQuery, filterCategoryId, statusTab]);

  const openCreateModal = () => {
    const initialColors = ['Đen', 'Trắng'];
    const initialSizes = ['M', 'L'];
    const prefix = `SP${Math.floor(10 + Math.random() * 89)}`;

    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id ?? 'ao-thun');
    setIsAddingInlineCat(false);
    setInlineCatName('');
    setDescription('');
    setStatus('active');
    setImages([]);
    setUrlInput('');
    setColorList(initialColors);
    setColorInput('');
    setSizeList(initialSizes);
    setSizeInput('');
    setBulkPrice('350000');
    setBulkStock('30');
    setBulkSkuPrefix(prefix);
    syncVariantMatrix(initialColors, initialSizes, [], 350000, prefix);
    setFormErr(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: CatalogProduct) => {
    const existingImages =
      product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
          ? [product.imageUrl]
          : [];

    const uniqueColors = Array.from(
      new Set(product.variants.map((v) => v.color))
    );
    const uniqueSizes = Array.from(
      new Set(product.variants.map((v) => v.size))
    );

    setEditingProduct(product);
    setName(product.name);
    setCategoryId(product.categoryId);
    setIsAddingInlineCat(false);
    setInlineCatName('');
    setDescription(product.description);
    setStatus(product.isActive ? 'active' : 'hidden');
    setImages(existingImages);
    setUrlInput('');
    setColorList(uniqueColors.length > 0 ? uniqueColors : ['Mặc định']);
    setColorInput('');
    setSizeList(uniqueSizes.length > 0 ? uniqueSizes : ['FreeSize']);
    setSizeInput('');
    setBulkPrice(String(product.basePrice));
    setBulkStock('30');
    setBulkSkuPrefix(toSkuSlug(product.name) || 'SP');
    setVariantRows(
      product.variants.map((v) => ({
        ...v,
        stock: v.stock ?? 25,
      }))
    );
    setFormErr(null);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    if (routeAction) {
      navigate('/products', { replace: true });
    }
  };

  // Mở form Thêm hoặc Sửa tự động khi người dùng nhập trực tiếp URL /products/new hoặc /products/:id/edit
  // Mục 2.2: Khi mở theo ID, nạp trực tiếp thông tin hiện có của sản phẩm và biến thể từ Backend API
  useEffect(() => {
    if (!canManageCatalog) return;
    if (routeAction === 'create') {
      openCreateModal();
    } else if (routeAction === 'edit' && params.id) {
      let cancelled = false;
      const loadById = async () => {
        setIsLoadingEditProduct(true);
        setBannerErr(null);
        const res = await fetchAdminProductById(params.id!);
        if (cancelled) return;
        setIsLoadingEditProduct(false);
        if (!res.ok) {
          setBannerErr(res.error);
          navigate('/products', { replace: true });
          return;
        }
        openEditModal(res.data);
      };
      void loadById();
      return () => {
        cancelled = true;
      };
    }
  }, [routeAction, params.id, canManageCatalog]);

  // Multi-file upload handler
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    if (images.length + files.length > 9) {
      setFormErr('Tối đa 9 hình ảnh cho một sản phẩm (chuẩn Shopee).');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) =>
            prev.length < 9 ? [...prev, reader.result as string] : prev
          );
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
    setFormErr(null);
  };

  const handleAddImageUrl = () => {
    const clean = urlInput.trim();
    if (!clean) return;
    if (images.length >= 9) {
      setFormErr('Đã đạt tối đa 9 hình ảnh.');
      return;
    }
    setImages((prev) => [...prev, clean]);
    setUrlInput('');
    setFormErr(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  };

  // Add / Remove Color Tag
  const handleAddColor = (val?: string) => {
    const clean = (val ?? colorInput).trim();
    if (!clean) return;
    if (colorList.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setColorInput('');
      return;
    }
    const nextColors = [...colorList, clean];
    setColorList(nextColors);
    setColorInput('');
    syncVariantMatrix(
      nextColors,
      sizeList,
      variantRows,
      Number(bulkPrice) || 350000,
      bulkSkuPrefix
    );
  };

  const handleRemoveColor = (colorToRemove: string) => {
    if (colorList.length <= 1) {
      setFormErr('Sản phẩm cần ít nhất 1 phân loại màu sắc.');
      return;
    }
    const nextColors = colorList.filter((c) => c !== colorToRemove);
    setColorList(nextColors);
    syncVariantMatrix(
      nextColors,
      sizeList,
      variantRows,
      Number(bulkPrice) || 350000,
      bulkSkuPrefix
    );
  };

  // Add / Remove Size Tag
  const handleAddSize = (val?: string) => {
    const clean = (val ?? sizeInput).trim();
    if (!clean) return;
    if (sizeList.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSizeInput('');
      return;
    }
    const nextSizes = [...sizeList, clean];
    setSizeList(nextSizes);
    setSizeInput('');
    syncVariantMatrix(
      colorList,
      nextSizes,
      variantRows,
      Number(bulkPrice) || 350000,
      bulkSkuPrefix
    );
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (sizeList.length <= 1) {
      setFormErr('Sản phẩm cần ít nhất 1 phân loại kích cỡ (Size).');
      return;
    }
    const nextSizes = sizeList.filter((s) => s !== sizeToRemove);
    setSizeList(nextSizes);
    syncVariantMatrix(
      colorList,
      nextSizes,
      variantRows,
      Number(bulkPrice) || 350000,
      bulkSkuPrefix
    );
  };

  // Bulk apply price, stock, SKU to all variants (like Shopee "Áp dụng cho tất cả phân loại")
  const handleApplyBulkToAllVariants = () => {
    const numPrice = Number(bulkPrice);
    const numStock = Number(bulkStock);
    const prefix = bulkSkuPrefix.trim().toUpperCase() || 'SP';

    setVariantRows((prev) =>
      prev.map((row, idx) => ({
        ...row,
        price: !Number.isNaN(numPrice) && numPrice > 0 ? numPrice : row.price,
        stock: !Number.isNaN(numStock) && numStock >= 0 ? numStock : row.stock ?? 20,
        sku: `${prefix}-${toSkuSlug(row.color) || 'C'}-${toSkuSlug(row.size) || idx + 1}`,
      }))
    );
  };

  const handleUpdateVariantRow = (
    index: number,
    field: 'price' | 'stock' | 'sku',
    val: string
  ) => {
    setVariantRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        if (field === 'price') return { ...row, price: Number(val) || 0 };
        if (field === 'stock') return { ...row, stock: Number(val) || 0 };
        return { ...row, sku: val.toUpperCase() };
      })
    );
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setFormErr('Vui lòng nhập Tên sản phẩm.');
      return;
    }

    if (variantRows.length === 0) {
      setFormErr('Sản phẩm phải có ít nhất 1 biến thể phân loại (Màu / Size).');
      return;
    }

    const seenSkus = new Set<string>();
    for (const v of variantRows) {
      const cleanSku = v.sku.trim().toUpperCase();
      if (!cleanSku) {
        setFormErr(`Vui lòng nhập Mã SKU cho phân loại "${v.color} - ${v.size}".`);
        return;
      }
      if (seenSkus.has(cleanSku)) {
        setFormErr(`Mã SKU "${cleanSku}" đang bị trùng giữa các phân loại trong form. Vui lòng sửa lại.`);
        return;
      }
      seenSkus.add(cleanSku);
      if (v.price <= 0) {
        setFormErr(`Giá bán của phân loại "${v.color} - ${v.size}" phải lớn hơn 0.`);
        return;
      }
    }

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

    const coverImage = images[0] ?? '';
    const minPrice = Math.min(...variantRows.map((v) => v.price));

    const payload: Omit<CatalogProduct, 'id'> = {
      name: cleanName,
      categoryId: finalCategoryId,
      basePrice: minPrice,
      description:
        description.trim() || 'Sản phẩm chính hãng phân phối tại hệ thống',
      isActive: status === 'active',
      colorHex: '#2563EB',
      imageUrl: coverImage,
      images,
      variants: variantRows.map((v) => ({
        ...v,
        sku: v.sku.trim().toUpperCase(),
        imageUrl: coverImage,
      })),
    };

    // Mục 2.2: Chờ Backend xác nhận HTTP 200/201; nếu lỗi (trùng SKU, 403, 422...)
    // giữ nguyên toàn bộ dữ liệu đang nhập trên form và hiển thị thông báo lỗi.
    setIsSavingProduct(true);
    const result = editingProduct
      ? await updateProductAsync(editingProduct.id, payload)
      : await createProductAsync(payload);
    setIsSavingProduct(false);

    if (!result.ok) {
      setFormErr(result.error);
      return;
    }

    if (editingProduct) {
      showToast(
        `Đã lưu cập nhật "${result.data.name}" thành công (${result.data.variants.length} phân loại).`
      );
    } else {
      showToast(
        `Đã tạo sản phẩm "${result.data.name}" (ID: #${result.data.id}) thành công.`
      );
    }

    closeProductModal();
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
            {canManageCatalog
              ? 'Quản lý Danh mục, Sản phẩm, Biến thể & Hình ảnh'
              : 'Danh mục & Tra cứu Sản phẩm'}
          </h1>
          <p className="text-[13px] text-[#71717A] mt-0.5">
            {canManageCatalog
              ? 'Đăng sản phẩm chuẩn Shopee: Album nhiều hình ảnh, tự động tạo bảng phân loại nhiều Màu sắc × nhiều Kích cỡ (Size)'
              : 'Chỉ Quản trị viên (Admin) có quyền thêm, sửa, xóa danh mục và sản phẩm'}
          </p>
        </div>

        {canManageCatalog && (
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
              onClick={() => navigate('/products/new')}
              className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm mới</span>
            </button>
          </div>
        )}
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
              {totalVariantsCount} phân loại SKU (Màu/Size)
            </p>
          </div>
          <span className="w-9 h-9 rounded-[9px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </span>
        </div>

        <div className="polaris-card p-4 flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#71717A]">Đang hiển thị bán</p>
            <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1">
              {activeCount}
            </p>
            <p className="text-[11.5px] text-[#15803D] font-medium mt-0.5">
              Đủ ảnh &amp; biến thể
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
                  placeholder="Tìm tên SP, SKU, màu, size..."
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
                  title="Chế độ lưới thẻ Shopee"
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

        {/* Content: Products or Categories */}
        {mainView === 'products' ? (
          displayMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[820px]">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#71717A] h-[40px]">
                    <th className="px-5">Album Ảnh &amp; Sản phẩm</th>
                    <th className="px-4">Danh mục</th>
                    <th className="px-4">Màu sắc &amp; Kích cỡ (Size)</th>
                    <th className="px-4 text-right">Khoảng giá</th>
                    <th className="px-4 text-center">Trạng thái</th>
                    <th className="px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7]/80 text-[13px]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <p className="text-[13.5px] font-semibold text-[#18181B]">
                          Không tìm thấy sản phẩm nào
                        </p>
                        <p className="text-[12.5px] text-[#71717A] mt-1">
                          Thử thay đổi từ khóa tìm kiếm hoặc bấm &ldquo;Thêm sản phẩm mới&rdquo;.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const album =
                        product.images && product.images.length > 0
                          ? product.images
                          : product.imageUrl
                            ? [product.imageUrl]
                            : [];
                      const coverSrc = album[0];
                      const avatarStyle = getBadgeStyle(product.id + product.name);

                      const uniqueColors = Array.from(
                        new Set(product.variants.map((v) => v.color))
                      );
                      const uniqueSizes = Array.from(
                        new Set(product.variants.map((v) => v.size))
                      );
                      const prices = product.variants.map((v) => v.price);
                      const minPrice =
                        prices.length > 0 ? Math.min(...prices) : product.basePrice;
                      const maxPrice =
                        prices.length > 0 ? Math.max(...prices) : product.basePrice;

                      const isExpanded = expandedProductId === product.id;

                      return (
                        <>
                          <tr
                            key={product.id}
                            className="group hover:bg-[#FAFAFA] transition-colors h-[74px]"
                          >
                            {/* Album Thumbnail Stack + Title */}
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="relative w-12 h-12 shrink-0">
                                  {coverSrc ? (
                                    <img
                                      src={coverSrc}
                                      alt={product.name}
                                      className="w-12 h-12 rounded-[9px] object-cover border border-[#E4E4E7] bg-[#F4F4F5]"
                                    />
                                  ) : (
                                    <div
                                      className={`w-12 h-12 rounded-[9px] border flex items-center justify-center text-[12.5px] font-bold ${avatarStyle}`}
                                    >
                                      {getProductInitials(product.name)}
                                    </div>
                                  )}
                                  {album.length > 1 && (
                                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#18181B] text-white text-[10px] font-bold border border-white">
                                      {album.length} ảnh
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-[#09090B] truncate leading-snug">
                                    {product.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedProductId(
                                          isExpanded ? null : product.id
                                        )
                                      }
                                      className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                                    >
                                      <span>
                                        {product.variants.length} phân loại SKU
                                      </span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[12px] font-medium">
                                <Tag className="w-3 h-3" />
                                <span>{getCategoryName(product.categoryId)}</span>
                              </span>
                            </td>

                            {/* Colors & Sizes Pills */}
                            <td className="px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-[11px] font-medium text-[#71717A] w-9">
                                    Màu:
                                  </span>
                                  {uniqueColors.map((c) => (
                                    <span
                                      key={c}
                                      className="px-2 py-0.5 rounded-[5px] bg-[#F4F4F5] border border-[#E4E4E7] text-[11.5px] font-medium text-[#18181B]"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-[11px] font-medium text-[#71717A] w-9">
                                    Size:
                                  </span>
                                  {uniqueSizes.map((s) => (
                                    <span
                                      key={s}
                                      className="px-2 py-0.5 rounded-[5px] bg-[#EFF6FF] border border-[#BFDBFE] text-[11.5px] font-semibold text-[#1D4ED8]"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Price range */}
                            <td className="px-4 text-right font-bold text-[#09090B] tabular-nums">
                              {minPrice === maxPrice ? (
                                formatVND(minPrice)
                              ) : (
                                <div>
                                  <p>{formatVND(minPrice)}</p>
                                  <p className="text-[11.5px] font-medium text-[#71717A]">
                                    ~ {formatVND(maxPrice)}
                                  </p>
                                </div>
                              )}
                            </td>

                            {/* Status */}
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
                              {canManageCatalog ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/products/${product.id}/edit`)}
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
                              ) : (
                                <span className="text-[11.5px] text-[#71717A] italic">
                                  Chỉ xem
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* Expandable Shopee Variant Sub-table & Photo Strip */}
                          {isExpanded && (
                            <tr className="bg-[#F8FAFC]">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-4 space-y-3">
                                  {album.length > 0 && (
                                    <div>
                                      <p className="text-[11.5px] font-semibold text-[#64748B] mb-2">
                                        Album hình ảnh sản phẩm ({album.length} ảnh):
                                      </p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {album.map((imgUrl, idx) => (
                                          <div
                                            key={idx}
                                            className="relative w-14 h-14 rounded-[8px] border border-[#CBD5E1] overflow-hidden"
                                          >
                                            <img
                                              src={imgUrl}
                                              alt={`${product.name} ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                            {idx === 0 && (
                                              <span className="absolute bottom-0 inset-x-0 bg-[#2563EB] text-white text-[9px] font-bold text-center">
                                                Ảnh bìa
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <p className="text-[11.5px] font-semibold text-[#64748B] mb-2">
                                      Chi tiết các phân loại hàng (Màu sắc × Kích cỡ):
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                      {product.variants.map((v) => (
                                        <div
                                          key={v.id}
                                          className="p-2.5 rounded-[8px] border border-[#E2E8F0] bg-[#FAFAFA] flex items-center justify-between text-[12px]"
                                        >
                                          <div>
                                            <p className="font-bold text-[#09090B]">
                                              {v.color} · Size {v.size}
                                            </p>
                                            <p className="text-[11px] font-mono text-[#64748B]">
                                              SKU: {v.sku}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-bold text-[#2563EB] tabular-nums">
                                              {formatVND(v.price)}
                                            </p>
                                            <p className="text-[11px] text-[#64748B]">
                                              Kho: {v.stock ?? 25}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card Grid View with Mini Thumbnail Strip + Color/Size Chips */
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const album =
                  product.images && product.images.length > 0
                    ? product.images
                    : product.imageUrl
                      ? [product.imageUrl]
                      : [];
                const coverSrc = album[0];
                const avatarStyle = getBadgeStyle(product.id + product.name);
                const uniqueColors = Array.from(
                  new Set(product.variants.map((v) => v.color))
                );
                const uniqueSizes = Array.from(
                  new Set(product.variants.map((v) => v.size))
                );
                const minPrice = Math.min(
                  ...product.variants.map((v) => v.price)
                );

                return (
                  <div
                    key={product.id}
                    className="rounded-[12px] border border-[#E4E4E7] bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-[180px] w-full bg-[#F4F4F5] border-b border-[#E4E4E7] overflow-hidden flex items-center justify-center">
                        {coverSrc ? (
                          <img
                            src={coverSrc}
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
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[6px] bg-black/70 text-white text-[11px] font-semibold">
                          {album.length} ảnh · {product.variants.length} loại
                        </span>
                      </div>

                      {/* Mini Photo Strip */}
                      {album.length > 1 && (
                        <div className="px-3 pt-2 flex items-center gap-1.5 overflow-x-auto">
                          {album.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="w-8 h-8 rounded-[5px] object-cover border border-[#E4E4E7] shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      <div className="p-3.5 space-y-2">
                        <div>
                          <span className="text-[11px] font-semibold text-[#2563EB]">
                            {getCategoryName(product.categoryId)}
                          </span>
                          <h3 className="text-[14px] font-bold text-[#09090B] mt-0.5 truncate">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {uniqueColors.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[10.5px] font-medium text-[#18181B]"
                            >
                              {c}
                            </span>
                          ))}
                          {uniqueSizes.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[10.5px] font-semibold text-[#1D4ED8]"
                            >
                              Size {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#09090B] tabular-nums">
                        {formatVND(minPrice)}
                      </span>
                      {canManageCatalog ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/products/${product.id}/edit`)}
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
                      ) : (
                        <span className="text-[11px] text-[#71717A] italic">
                          Chỉ xem
                        </span>
                      )}
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
                        {canManageCatalog ? (
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
                        ) : (
                          <span className="text-[11.5px] text-[#71717A] italic">
                            Chỉ xem
                          </span>
                        )}
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
            <span>Bấm vào &ldquo;phân loại SKU&rdquo; dưới tên sản phẩm để xem toàn bộ ảnh &amp; bảng Màu/Size</span>
          </div>
        )}
      </div>

      {isLoadingEditProduct && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] border border-[#E4E4E7] shadow-xl px-6 py-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
            <span className="text-[13px] font-semibold text-[#09090B]">
              Đang nạp thông tin sản phẩm &amp; biến thể theo ID từ Backend...
            </span>
          </div>
        </div>
      )}

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
                disabled={isDeletingProduct}
                onClick={async () => {
                  setIsDeletingProduct(true);
                  const res = await deleteProductAsync(confirmDeleteProduct.id);
                  setIsDeletingProduct(false);
                  if (!res.ok) {
                    setBannerErr(res.error ?? 'Không thể xóa sản phẩm.');
                  } else {
                    showToast(`Đã xóa sản phẩm "${confirmDeleteProduct.name}".`);
                  }
                  setConfirmDeleteProduct(null);
                }}
                className="h-[34px] px-3.5 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white text-[12.5px] font-semibold cursor-pointer"
              >
                {isDeletingProduct ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SHOPEE SELLER CENTER MODAL: MULTI-IMAGE ALBUM & COLOR x SIZE MATRIX
         ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-[780px] rounded-[14px] border border-[#E4E4E7] shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#09090B]">
                  {editingProduct
                    ? 'Chỉnh sửa Sản phẩm & Phân loại (Chuẩn Shopee)'
                    : 'Thêm Sản phẩm mới (Nhiều hình ảnh · Nhiều Màu · Nhiều Size)'}
                </h3>
                <p className="text-[12px] text-[#71717A]">
                  Tải tối đa 9 ảnh sản phẩm và tự động sinh bảng giá/kho theo từng cặp Màu sắc × Kích cỡ
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                className="w-8 h-8 rounded-[8px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="p-6 space-y-5 max-h-[82vh] overflow-y-auto admin-scroll"
            >
              {formErr && (
                <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-[12.5px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}

              {/* PHẦN 1: ALBUM NHIỀU HÌNH ẢNH SẢN PHẨM (TỐI ĐA 9 ẢNH) */}
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E4E4E7] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-[13px] font-bold text-[#09090B] flex items-center gap-1.5">
                      <ImagePlus className="w-4 h-4 text-[#2563EB]" />
                      <span>1. Hình ảnh sản phẩm ({images.length}/9 ảnh)</span>
                    </label>
                    <p className="text-[11.5px] text-[#71717A]">
                      Ảnh đầu tiên là Ảnh bìa. Bạn có thể chọn nhiều file ảnh cùng lúc hoặc bấm vào ảnh phụ để đặt làm Ảnh bìa.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-[34px] px-3 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải nhiều ảnh từ máy</span>
                  </button>
                </div>

                {/* Grid of Uploaded Images + Add More Slot */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`group relative w-[84px] h-[84px] rounded-[10px] border overflow-hidden bg-white ${
                        idx === 0
                          ? 'border-2 border-[#2563EB] ring-2 ring-[#2563EB]/15'
                          : 'border-[#CBD5E1]'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh ${idx + 1}`}
                        onClick={() => handleSetCoverImage(idx)}
                        title={
                          idx === 0
                            ? 'Ảnh bìa chính'
                            : 'Bấm để đặt làm Ảnh bìa'
                        }
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      {idx === 0 ? (
                        <span className="absolute bottom-0 inset-x-0 bg-[#2563EB] text-white text-[10px] font-bold text-center py-0.5">
                          ★ Ảnh bìa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          className="opacity-0 group-hover:opacity-100 absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9.5px] font-semibold text-center py-0.5 transition-opacity cursor-pointer"
                        >
                          Đặt làm bìa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Xóa ảnh này"
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/65 hover:bg-[#DC2626] text-white flex items-center justify-center text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {images.length < 9 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-[84px] h-[84px] rounded-[10px] border-2 border-dashed border-[#93C5FD] bg-[#EFF6FF]/40 hover:bg-[#EFF6FF] text-[#2563EB] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10.5px] font-semibold">
                        Thêm ảnh ({images.length}/9)
                      </span>
                    </button>
                  )}
                </div>

                {/* Add Image via URL or Sample Gallery */}
                <div className="pt-2 border-t border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 h-[34px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Hoặc dán link ảnh URL rồi bấm Thêm..."
                      className="w-full bg-transparent text-[12px] text-[#09090B] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-2.5 py-1 rounded-[5px] bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[11px] font-semibold text-[#18181B] shrink-0 cursor-pointer"
                    >
                      + Thêm URL
                    </button>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] text-[#71717A]">Mẫu nhanh:</span>
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => {
                          if (images.length < 9) {
                            setImages((prev) => [...prev, sample.url]);
                          }
                        }}
                        className="px-2 py-0.5 rounded-[5px] bg-white border border-[#E4E4E7] hover:border-[#2563EB] hover:text-[#2563EB] text-[11px] font-medium text-[#52525B] cursor-pointer"
                      >
                        +{sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PHẦN 2: THÔNG TIN CƠ BẢN */}
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E4E4E7] space-y-3.5">
                <label className="text-[13px] font-bold text-[#09090B] block">
                  2. Thông tin cơ bản
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Áo Polo Nam Coolmate, Giày Nike Air..."
                      className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white px-3 text-[13px] outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[12px] font-semibold text-[#18181B]">
                        Danh mục ngành hàng *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingInlineCat((prev) => !prev)}
                        className="text-[11.5px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        {isAddingInlineCat ? '← Chọn có sẵn' : '+ Tạo danh mục mới'}
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
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={inlineCatName}
                          onChange={(e) => setInlineCatName(e.target.value)}
                          placeholder="Tên ngành hàng mới..."
                          className="flex-1 h-[38px] rounded-[8px] border border-[#2563EB] bg-white px-2.5 text-[12.5px] outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleQuickAddCategoryInModal}
                          className="h-[38px] px-3 rounded-[8px] bg-[#2563EB] text-white text-[12px] font-semibold cursor-pointer"
                        >
                          Lưu
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                      Mô tả sản phẩm
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Chất liệu, thông số kỹ thuật, chính sách bảo hành..."
                      className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white px-3 text-[13px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                      Trạng thái
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
                </div>
              </div>

              {/* PHẦN 3: PHÂN LOẠI HÀNG SHOPEE (NHIỀU MÀU SẮC x NHIỀU SIZE) */}
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E4E4E7] space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-[#09090B] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <span>
                      3. Phân loại hàng hóa (Nhiều Màu sắc × Nhiều Size — Tự động tạo{' '}
                      {variantRows.length} biến thể)
                    </span>
                  </label>
                  <p className="text-[11.5px] text-[#71717A]">
                    Thêm các Màu sắc ở Nhóm 1 và các Kích cỡ (Size) ở Nhóm 2. Hệ thống sẽ tự động kết hợp thành bảng phân loại bên dưới giống Shopee.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nhóm phân loại 1: Màu sắc */}
                  <div className="p-3 rounded-[10px] bg-white border border-[#E4E4E7] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#09090B]">
                        Nhóm phân loại 1: Màu sắc ({colorList.length})
                      </span>
                    </div>

                    {/* Active Color Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {colorList.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[12px] font-semibold"
                        >
                          <span>{c}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(c)}
                            className="text-[#1D4ED8] hover:text-[#DC2626] cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Input to add new color */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddColor();
                          }
                        }}
                        placeholder="Nhập màu (VD: Xanh Rêu, Kem...) rồi bấm +"
                        className="flex-1 h-[34px] rounded-[7px] border border-[#E4E4E7] px-2.5 text-[12px] outline-none focus:border-[#2563EB]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddColor()}
                        className="h-[34px] px-3 rounded-[7px] bg-[#18181B] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                      >
                        + Thêm màu
                      </button>
                    </div>

                    {/* Quick color suggestions */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10.5px] text-[#71717A]">Chọn nhanh:</span>
                      {QUICK_COLORS.map((qc) => (
                        <button
                          key={qc}
                          type="button"
                          onClick={() => handleAddColor(qc)}
                          className="px-1.5 py-0.5 rounded bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[10.5px] font-medium text-[#3F3F46] cursor-pointer"
                        >
                          +{qc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm phân loại 2: Kích cỡ (Size / Dung lượng) */}
                  <div className="p-3 rounded-[10px] bg-white border border-[#E4E4E7] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#09090B]">
                        Nhóm phân loại 2: Size / Quy cách ({sizeList.length})
                      </span>
                    </div>

                    {/* Active Size Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sizeList.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[12px] font-semibold"
                        >
                          <span>Size {s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(s)}
                            className="text-[#15803D] hover:text-[#DC2626] cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Input to add new size */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={sizeInput}
                        onChange={(e) => setSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSize();
                          }
                        }}
                        placeholder="Nhập size (VD: S, XL, 39, 40...) rồi bấm +"
                        className="flex-1 h-[34px] rounded-[7px] border border-[#E4E4E7] px-2.5 text-[12px] outline-none focus:border-[#2563EB]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSize()}
                        className="h-[34px] px-3 rounded-[7px] bg-[#18181B] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                      >
                        + Thêm size
                      </button>
                    </div>

                    {/* Quick size suggestions */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10.5px] text-[#71717A]">Chọn nhanh:</span>
                      {QUICK_SIZES.map((qs) => (
                        <button
                          key={qs}
                          type="button"
                          onClick={() => handleAddSize(qs)}
                          className="px-1.5 py-0.5 rounded bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[10.5px] font-medium text-[#3F3F46] cursor-pointer"
                        >
                          +{qs}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shopee Bulk Apply Bar: Thiết lập đồng loạt cho tất cả phân loại */}
                <div className="p-3 rounded-[10px] bg-[#EFF6FF]/70 border border-[#BFDBFE] flex flex-wrap items-end justify-between gap-2.5">
                  <div className="grid grid-cols-3 gap-2 flex-1 min-w-[260px]">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E40AF] mb-0.5">
                        Giá đồng loạt (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border border-[#93C5FD] bg-white px-2.5 text-[12px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E40AF] mb-0.5">
                        Kho hàng đồng loạt
                      </label>
                      <input
                        type="number"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border border-[#93C5FD] bg-white px-2.5 text-[12px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E40AF] mb-0.5">
                        Tiền tố SKU
                      </label>
                      <input
                        type="text"
                        value={bulkSkuPrefix}
                        onChange={(e) => setBulkSkuPrefix(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border border-[#93C5FD] bg-white px-2.5 text-[12px] font-mono outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyBulkToAllVariants}
                    className="h-[32px] px-3.5 rounded-[7px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                  >
                    Áp dụng cho tất cả ({variantRows.length} loại)
                  </button>
                </div>

                {/* Variant Matrix Table (Color x Size) */}
                <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7] text-[11px] font-bold uppercase text-[#52525B] h-[36px]">
                        <th className="px-3.5">Màu sắc</th>
                        <th className="px-3.5">Size / Quy cách</th>
                        <th className="px-3.5">Giá bán (VNĐ) *</th>
                        <th className="px-3.5">Tồn kho</th>
                        <th className="px-3.5">Mã SKU phân loại *</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7] text-[12.5px]">
                      {variantRows.map((row, idx) => (
                        <tr key={`${row.color}-${row.size}-${idx}`} className="h-[46px]">
                          <td className="px-3.5 font-semibold text-[#09090B]">
                            {row.color}
                          </td>
                          <td className="px-3.5">
                            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-semibold text-[11.5px]">
                              {row.size}
                            </span>
                          </td>
                          <td className="px-3.5">
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) =>
                                handleUpdateVariantRow(idx, 'price', e.target.value)
                              }
                              className="w-[120px] h-[30px] rounded-[6px] border border-[#CBD5E1] px-2 text-[12.5px] font-semibold tabular-nums outline-none focus:border-[#2563EB]"
                            />
                          </td>
                          <td className="px-3.5">
                            <input
                              type="number"
                              value={row.stock ?? 25}
                              onChange={(e) =>
                                handleUpdateVariantRow(idx, 'stock', e.target.value)
                              }
                              className="w-[80px] h-[30px] rounded-[6px] border border-[#CBD5E1] px-2 text-[12.5px] tabular-nums outline-none focus:border-[#2563EB]"
                            />
                          </td>
                          <td className="px-3.5">
                            <input
                              type="text"
                              value={row.sku}
                              onChange={(e) =>
                                handleUpdateVariantRow(idx, 'sku', e.target.value)
                              }
                              className="w-[145px] h-[30px] rounded-[6px] border border-[#CBD5E1] px-2 text-[12px] font-mono outline-none focus:border-[#2563EB]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-between gap-2">
                <span className="text-[12px] text-[#71717A]">
                  Tổng cộng: <strong className="text-[#09090B]">{images.length} ảnh</strong> ·{' '}
                  <strong className="text-[#09090B]">{variantRows.length} biến thể Màu/Size</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="h-[38px] px-4 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[13px] font-medium text-[#18181B] cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="h-[38px] px-5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-[13px] font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>
                      {isSavingProduct
                        ? 'Đang lưu lên Backend...'
                        : editingProduct
                          ? 'Lưu cập nhật sản phẩm'
                          : 'Lưu & Hiển thị sản phẩm'}
                    </span>
                  </button>
                </div>
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
