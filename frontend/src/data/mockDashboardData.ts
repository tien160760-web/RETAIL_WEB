import {
  BranchInventoryRow,
  BranchOption,
  CatalogCategory,
  CatalogProduct,
  CategoryId,
  ChartGranularity,
  DashboardFilters,
  KpiSummary,
  PaymentMethod,
  ProductSalesRow,
  QuickSearchItem,
  RevenueShareItem,
  RevenueTimePoint,
  RoleConfig,
  SidebarGroup,
  SkuBranchMatrixRow,
  SupplierItem,
  UserRole,
} from '../types/dashboard';

export const ROLES: RoleConfig[] = [
  {
    id: 'ADMIN',
    label: 'Vai trò: Quản lý / Admin',
    shortLabel: 'Quản lý / Admin',
    userName: 'Dương Đức Tiến',
    userTitle: 'Quản trị hệ thống',
    assignedBranchId: null,
    allowedMenuIds: [
      'dashboard',
      'catalog',
      'vouchers',
      'suppliers',
      'procurement',
      'inventory',
      'warehouse-tickets',
      'orders',
      'organization',
    ],
  },
  {
    id: 'BRANCH_MANAGER',
    label: 'Vai trò: Quản lý chi nhánh',
    shortLabel: 'Quản lý chi nhánh',
    userName: 'Phạm Ngọc Tài',
    userTitle: 'Quản lý Chi nhánh A (Hà Nội)',
    assignedBranchId: 'cn-hn',
    allowedMenuIds: ['dashboard', 'suppliers', 'procurement', 'inventory', 'warehouse-tickets'],
  },
  {
    id: 'WAREHOUSE_STAFF',
    label: 'Vai trò: Nhân viên kho',
    shortLabel: 'Nhân viên kho',
    userName: 'Phạm Đức Thắng',
    userTitle: 'Nhân viên kho CN B (Đà Nẵng)',
    assignedBranchId: 'cn-dn',
    allowedMenuIds: ['procurement', 'inventory', 'warehouse-tickets'],
  },
  {
    id: 'SALES_STAFF',
    label: 'Vai trò: Nhân viên bán hàng',
    shortLabel: 'Nhân viên bán hàng',
    userName: 'Vũ Mạnh Hiếu',
    userTitle: 'NV Bán hàng CN C (TP.HCM)',
    assignedBranchId: 'cn-hcm',
    allowedMenuIds: ['orders'],
  },
];

export const BRANCHES: BranchOption[] = [
  {
    id: 'cn-hn',
    code: 'CN-HN',
    name: 'Chi nhánh A (Hà Nội)',
    shortName: 'CN Hà Nội',
    address: '128 Phố Huế, Hai Bà Trưng, Hà Nội',
    phone: '02438221100',
    managerName: 'Phạm Ngọc Tài',
    isActive: true,
  },
  {
    id: 'cn-dn',
    code: 'CN-DN',
    name: 'Chi nhánh B (Đà Nẵng)',
    shortName: 'CN Đà Nẵng',
    address: '45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    phone: '02363882299',
    managerName: 'Trần Văn Nam',
    isActive: true,
  },
  {
    id: 'cn-hcm',
    code: 'CN-HCM',
    name: 'Chi nhánh C (TP.HCM)',
    shortName: 'CN TP.HCM',
    address: '214 Nguyễn Trãi, Quận 1, TP.HCM',
    phone: '02839251188',
    managerName: 'Lê Hoàng Minh',
    isActive: true,
  },
];

export const CATEGORIES: { id: CategoryId; label: string; color: string }[] = [
  { id: 'all', label: 'Danh mục SP: Tất cả', color: '#64748B' },
  { id: 'ao-thun', label: 'Áo thun & Polo', color: '#1D4ED8' },
  { id: 'quan-denim', label: 'Quần & Denim', color: '#3B82F6' },
  { id: 'ao-khoac', label: 'Áo khoác', color: '#0EA5E9' },
  { id: 'phu-kien', label: 'Phụ kiện', color: '#6366F1' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'all', label: 'PT Thanh toán: Tất cả' },
  { id: 'ONLINE', label: 'Thanh toán Online' },
  { id: 'COD', label: 'Thanh toán COD' },
];

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'overview',
    title: 'TỔNG QUAN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard & Báo cáo',
        path: '/',
        pageTitle: 'Dashboard & Báo cáo kinh doanh',
        description:
          'Tổng quan doanh thu, số đơn hàng, sản phẩm bán chạy và tồn kho theo chi nhánh',
      },
    ],
  },
  {
    id: 'catalog-group',
    title: 'DANH MỤC & KHUYẾN MÃI',
    items: [
      {
        id: 'catalog',
        label: 'Danh mục & Sản phẩm',
        path: '/catalog',
        pageTitle: 'Quản lý Danh mục & Sản phẩm',
        description:
          'Quản lý danh mục, sản phẩm, ma trận biến thể màu sắc, kích cỡ và mã SKU',
      },
      {
        id: 'vouchers',
        label: 'Mã giảm giá',
        path: '/vouchers',
        pageTitle: 'Quản lý Mã giảm giá & Khuyến mãi',
        description:
          'Tạo mới, cập nhật điều kiện áp dụng và quản lý thời hạn các mã giảm giá',
      },
    ],
  },
  {
    id: 'wms-group',
    title: 'KHO & CUNG ỨNG',
    items: [
      {
        id: 'suppliers',
        label: 'Nhà cung cấp',
        path: '/suppliers',
        pageTitle: 'Quản lý Nhà cung cấp',
        description:
          'Quản lý danh sách nhà cung cấp, thông tin liên hệ và trạng thái hợp tác',
      },
      {
        id: 'procurement',
        label: 'Nhập hàng PO / GRN',
        path: '/procurement',
        pageTitle: 'Quản lý Nhập hàng (PO & GRN)',
        description:
          'Lập đơn đặt hàng nhập từ nhà cung cấp và tiếp nhận hàng vào kho chi nhánh',
      },
      {
        id: 'inventory',
        label: 'Kiểm tra tồn kho',
        path: '/inventory',
        pageTitle: 'Kiểm tra Tồn kho tại Chi nhánh',
        description:
          'Tra cứu số lượng thực tế, đang giữ và khả dụng của từng biến thể SKU',
      },
      {
        id: 'warehouse-tickets',
        label: 'Điều chuyển & Kiểm kê',
        path: '/warehouse-tickets',
        pageTitle: 'Điều chuyển & Kiểm kê kho',
        description:
          'Tạo phiếu điều chuyển hàng liên chi nhánh và phiếu kiểm kê điều chỉnh tồn kho',
      },
    ],
  },
  {
    id: 'oms-group',
    title: 'BÁN HÀNG',
    items: [
      {
        id: 'orders',
        label: 'Xử lý & Giao đơn',
        path: '/orders',
        pageTitle: 'Quản lý & Xử lý Đơn hàng',
        description:
          'Xác nhận đơn hàng, cập nhật thông tin vận chuyển và xử lý hủy đơn',
      },
    ],
  },
  {
    id: 'system-group',
    title: 'HỆ THỐNG',
    items: [
      {
        id: 'organization',
        label: 'Chi nhánh & Nhân viên',
        path: '/organization',
        pageTitle: 'Quản lý Chi nhánh & Nhân viên',
        description:
          'Quản lý tài khoản nhân viên, phân quyền vai trò và thông tin các chi nhánh',
      },
    ],
  },
];

export const INITIAL_CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    id: 'ao-thun',
    name: 'Thời trang & May mặc',
    description: 'Quần áo, trang phục và phụ kiện thời trang',
  },
  {
    id: 'dien-tu',
    name: 'Điện tử & Công nghệ',
    description: 'Điện thoại, laptop, tai nghe và thiết bị công nghệ',
  },
  {
    id: 'gia-dung',
    name: 'Đồ gia dụng & Đời sống',
    description: 'Thiết bị nhà bếp, đồ dùng gia đình và tiện ích',
  },
  {
    id: 'thuc-pham',
    name: 'Thực phẩm & Đồ uống',
    description: 'Đồ ăn đóng gói, nước giải khát và nhu yếu phẩm',
  },
  {
    id: 'my-pham',
    name: 'Mỹ phẩm & Chăm sóc cá nhân',
    description: 'Sản phẩm chăm sóc da, nước hoa và làm đẹp',
  },
  {
    id: 'quan-denim',
    name: 'Quần & Denim',
    description: 'Quần jeans, kaki và quần short',
  },
  {
    id: 'ao-khoac',
    name: 'Áo khoác',
    description: 'Áo khoác gió, cardigan và áo khoác thu đông',
  },
  {
    id: 'phu-kien',
    name: 'Phụ kiện & Túi xách',
    description: 'balo, túi đeo chéo, giày dép và phụ kiện',
  },
];

export const INITIAL_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-1',
    name: 'Áo Polo Pima Cao Cấp',
    categoryId: 'ao-thun',
    basePrice: 450_000,
    description: 'Chất liệu cotton Pima mềm mịn, thoáng khí, giữ form tốt sau nhiều lần giặt.',
    colorHex: '#1E293B',
    isActive: true,
    variants: [
      { id: 'v-1', sku: 'APL-DEN-M', color: 'Đen', size: 'M', price: 450_000 },
      { id: 'v-2', sku: 'APL-DEN-L', color: 'Đen', size: 'L', price: 450_000 },
      { id: 'v-3', sku: 'APL-XNH-L', color: 'Xanh Navy', size: 'L', price: 470_000 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Quần Jeans Slimfit Co Giãn',
    categoryId: 'quan-denim',
    basePrice: 650_000,
    description: 'Denim co giãn 2% spandex, form slimfit trẻ trung phù hợp đi làm và đi chơi.',
    colorHex: '#1D4ED8',
    isActive: true,
    variants: [
      { id: 'v-4', sku: 'QJN-XNH-30', color: 'Xanh Navy', size: '30', price: 650_000 },
      { id: 'v-5', sku: 'QJN-XNH-31', color: 'Xanh Navy', size: '31', price: 650_000 },
      { id: 'v-6', sku: 'QJN-DEN-32', color: 'Đen', size: '32', price: 670_000 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Áo Khoác Gió 2 Lớp Chống Nước',
    categoryId: 'ao-khoac',
    basePrice: 800_000,
    description: 'Vải dù trượt nước kết hợp lớp lót lưới thoáng khí, có mũ tháo rời.',
    colorHex: '#0F766E',
    isActive: true,
    variants: [
      { id: 'v-7', sku: 'AKG-REU-L', color: 'Xanh Rêu', size: 'L', price: 800_000 },
      { id: 'v-8', sku: 'AKG-REU-XL', color: 'Xanh Rêu', size: 'XL', price: 820_000 },
    ],
  },
  {
    id: 'prod-4',
    name: 'Túi Đeo Chéo Canvas Phối Da',
    categoryId: 'phu-kien',
    basePrice: 490_000,
    description: 'Vải canvas dày dặn chống thấm nhẹ, ngăn đựng phụ kiện tiện lợi.',
    colorHex: '#B45309',
    isActive: true,
    variants: [
      { id: 'v-9', sku: 'TDC-NAU-F', color: 'Nâu Đất', size: 'FreeSize', price: 490_000 },
    ],
  },
];

export const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: 'sup-1',
    code: 'NCC-VT01',
    name: 'Công ty CP Dệt May Việt Tiến',
    phone: '02838640800',
    email: 'kinhdoanh@viettien.vn',
    address: '7 Lê Minh Xuân, Tân Bình, TP.HCM',
    isActive: true,
  },
  {
    id: 'sup-2',
    code: 'NCC-HD02',
    name: 'Xưởng May Denim Hải Dương',
    phone: '0912456789',
    email: 'lienhe@denimhaiduong.vn',
    address: 'KCN Đại An, TP. Hải Dương',
    isActive: true,
  },
  {
    id: 'sup-3',
    code: 'NCC-PK03',
    name: 'Công ty Phụ Kiện Thời Trang An Phát',
    phone: '0905334882',
    email: 'sales@anphatleather.vn',
    address: '89 Nguyễn Hữu Thọ, Hải Châu, Đà Nẵng',
    isActive: false,
  },
];

export const QUICK_SEARCH_ITEMS: QuickSearchItem[] = [
  {
    id: 'qs-1',
    type: 'SKU',
    code: 'APL-DEN-L',
    title: 'Áo Polo Pima Cao Cấp — Đen / Size L',
    meta: 'Tồn khả dụng: 84 · 450.000 ₫',
    targetPath: '/inventory',
  },
  {
    id: 'qs-2',
    type: 'SKU',
    code: 'QJN-XNH-31',
    title: 'Quần Jeans Slimfit Co Giãn — Xanh Navy / 31',
    meta: 'Tồn khả dụng: 9 · Sắp hết hàng',
    targetPath: '/inventory',
  },
  {
    id: 'qs-3',
    type: 'Đơn hàng',
    code: 'ORD-2026-0842',
    title: 'Đơn hàng Nguyễn Minh Anh · CN Hà Nội',
    meta: 'Chờ xác nhận · Online đã thanh toán · 1.380.000 ₫',
    targetPath: '/orders',
  },
  {
    id: 'qs-4',
    type: 'Phiếu kho',
    code: 'TRF-HN-DN-019',
    title: 'Phiếu điều chuyển CN Hà Nội → CN Đà Nẵng',
    meta: 'Đang vận chuyển · 45 sản phẩm',
    targetPath: '/warehouse-tickets',
  },
  {
    id: 'qs-5',
    type: 'Phiếu kho',
    code: 'PO-2026-0114',
    title: 'Đơn đặt hàng NCC Dệt May Việt Tiến',
    meta: 'Chờ nhận hàng · 68.500.000 ₫',
    targetPath: '/procurement',
  },
];

export const SYSTEM_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Cảnh báo hết hàng tại Chi nhánh B (Đà Nẵng)',
    detail: '2 biến thể SKU (AKG-REU-XL, TDD-NAU-F) có tồn khả dụng = 0.',
    time: '8 phút trước',
    level: 'danger' as const,
  },
  {
    id: 'n2',
    title: 'Cảnh báo sắp hết hàng tại Chi nhánh A (Hà Nội)',
    detail: '3 biến thể SKU dưới ngưỡng an toàn (< 15 sản phẩm).',
    time: '32 phút trước',
    level: 'warning' as const,
  },
  {
    id: 'n3',
    title: 'Đơn nhập PO-2026-0114 sẵn sàng tiếp nhận',
    detail: 'NCC Việt Tiến dự kiến giao hàng hôm nay tại kho CN Hà Nội.',
    time: '2 giờ trước',
    level: 'info' as const,
  },
];

const TIME_FACTORS: Record<DashboardFilters['timePreset'], { revScale: number; ordScale: number; growth: number; aovDelta: number }> = {
  today: { revScale: 0.055, ordScale: 0.052, growth: -3.4, aovDelta: 1.8 },
  '7d': { revScale: 0.28, ordScale: 0.27, growth: 8.6, aovDelta: 3.1 },
  '30d': { revScale: 1.0, ordScale: 1.0, growth: 12.4, aovDelta: 4.8 },
  month: { revScale: 0.68, ordScale: 0.66, growth: 9.7, aovDelta: 4.2 },
  custom: { revScale: 0.52, ordScale: 0.51, growth: 6.3, aovDelta: 2.5 },
};

const BRANCH_WEIGHTS: Record<string, { share: number; growthAdj: number }> = {
  'cn-hn': { share: 0.38, growthAdj: 2.1 },
  'cn-dn': { share: 0.24, growthAdj: -4.6 },
  'cn-hcm': { share: 0.38, growthAdj: 3.4 },
};

const CATEGORY_WEIGHTS: Record<Exclude<CategoryId, 'all'>, { share: number; aovMult: number; growthAdj: number }> = {
  'ao-thun': { share: 0.35, aovMult: 0.86, growthAdj: 4.2 },
  'quan-denim': { share: 0.28, aovMult: 1.12, growthAdj: 1.5 },
  'ao-khoac': { share: 0.24, aovMult: 1.34, growthAdj: -5.1 },
  'phu-kien': { share: 0.13, aovMult: 0.64, growthAdj: 6.8 },
};

const PAYMENT_WEIGHTS: Record<PaymentMethod, { share: number; cancelRate: number }> = {
  all: { share: 1.0, cancelRate: 0.06 },
  ONLINE: { share: 0.58, cancelRate: 0.038 },
  COD: { share: 0.42, cancelRate: 0.091 },
};

const BASE_PRODUCTS: Omit<ProductSalesRow, 'revenueSharePct'>[] = [
  {
    sku: 'APL-DEN-L',
    name: 'Áo Polo Pima Cao Cấp',
    variantLabel: 'Đen · Size L',
    categoryId: 'ao-thun',
    categoryName: 'Áo thun & Polo',
    colorHex: '#1E293B',
    soldQty: 618,
    revenue: 278_100_000,
    availableStock: 12,
    stockStatus: 'low_stock',
  },
  {
    sku: 'QJN-XNH-31',
    name: 'Quần Jeans Slimfit Co Giãn',
    variantLabel: 'Xanh Navy · Size 31',
    categoryId: 'quan-denim',
    categoryName: 'Quần & Denim',
    colorHex: '#1D4ED8',
    soldQty: 392,
    revenue: 254_800_000,
    availableStock: 86,
    stockStatus: 'in_stock',
  },
  {
    sku: 'AKG-REU-XL',
    name: 'Áo Khoác Gió 2 Lớp Chống Nước',
    variantLabel: 'Xanh Rêu · Size XL',
    categoryId: 'ao-khoac',
    categoryName: 'Áo khoác',
    colorHex: '#0F766E',
    soldQty: 264,
    revenue: 211_200_000,
    availableStock: 0,
    stockStatus: 'out_of_stock',
  },
  {
    sku: 'ATN-TRG-M',
    name: 'Áo Thun Cotton Organic Basic',
    variantLabel: 'Trắng Kem · Size M',
    categoryId: 'ao-thun',
    categoryName: 'Áo thun & Polo',
    colorHex: '#64748B',
    soldQty: 510,
    revenue: 163_200_000,
    availableStock: 142,
    stockStatus: 'in_stock',
  },
  {
    sku: 'TDC-NAU-F',
    name: 'Túi Đeo Chéo Canvas Phối Da',
    variantLabel: 'Nâu Đất · FreeSize',
    categoryId: 'phu-kien',
    categoryName: 'Phụ kiện',
    colorHex: '#B45309',
    soldQty: 148,
    revenue: 72_520_000,
    availableStock: 58,
    stockStatus: 'in_stock',
  },
  {
    sku: 'QKK-KHM-32',
    name: 'Quần Kaki Chinos Công Sở',
    variantLabel: 'Xám Khói · Size 32',
    categoryId: 'quan-denim',
    categoryName: 'Quần & Denim',
    colorHex: '#475569',
    soldQty: 64,
    revenue: 37_760_000,
    availableStock: 19,
    stockStatus: 'in_stock',
  },
  {
    sku: 'AKN-BE-M',
    name: 'Áo Khoác Cardigan Len Mỏng',
    variantLabel: 'Be Sáng · Size M',
    categoryId: 'ao-khoac',
    categoryName: 'Áo khoác',
    colorHex: '#D97706',
    soldQty: 42,
    revenue: 28_560_000,
    availableStock: 7,
    stockStatus: 'low_stock',
  },
  {
    sku: 'NON-DEN-F',
    name: 'Mũ Lưỡi Trai Kaki Thêu Logo',
    variantLabel: 'Đen · FreeSize',
    categoryId: 'phu-kien',
    categoryName: 'Phụ kiện',
    colorHex: '#334155',
    soldQty: 38,
    revenue: 9_120_000,
    availableStock: 0,
    stockStatus: 'out_of_stock',
  },
  {
    sku: 'TLU-NAU-F',
    name: 'Thắt Lưng Da Bò Khóa Kim',
    variantLabel: 'Nâu Cà Phê · FreeSize',
    categoryId: 'phu-kien',
    categoryName: 'Phụ kiện',
    colorHex: '#78350F',
    soldQty: 29,
    revenue: 13_050_000,
    availableStock: 64,
    stockStatus: 'in_stock',
  },
];

export const BASE_BRANCH_INVENTORY: BranchInventoryRow[] = [
  {
    branchId: 'cn-hn',
    branchName: 'Chi nhánh A (Hà Nội)',
    onHand: 7_240,
    reserved: 480,
    available: 6_760,
    lowStockSkus: 3,
    outOfStockSkus: 0,
    warningType: 'low',
    warningLabel: '3 SKU sắp hết',
  },
  {
    branchId: 'cn-dn',
    branchName: 'Chi nhánh B (Đà Nẵng)',
    onHand: 4_190,
    reserved: 270,
    available: 3_920,
    lowStockSkus: 2,
    outOfStockSkus: 2,
    warningType: 'out',
    warningLabel: '2 SKU hết hàng',
  },
  {
    branchId: 'cn-hcm',
    branchName: 'Chi nhánh C (TP.HCM)',
    onHand: 8_310,
    reserved: 570,
    available: 7_740,
    lowStockSkus: 0,
    outOfStockSkus: 0,
    warningType: 'normal',
    warningLabel: 'Bình thường',
  },
];

export const BASE_SKU_MATRIX: SkuBranchMatrixRow[] = [
  {
    sku: 'APL-DEN-L',
    productName: 'Áo Polo Pima Cao Cấp',
    variantLabel: 'Đen · Size L',
    stockByBranch: { 'cn-hn': 8, 'cn-dn': 4, 'cn-hcm': 52 },
    totalAvailable: 64,
  },
  {
    sku: 'QJN-XNH-31',
    productName: 'Quần Jeans Slimfit Co Giãn',
    variantLabel: 'Xanh Navy · Size 31',
    stockByBranch: { 'cn-hn': 34, 'cn-dn': 14, 'cn-hcm': 38 },
    totalAvailable: 86,
  },
  {
    sku: 'AKG-REU-XL',
    productName: 'Áo Khoác Gió 2 Lớp',
    variantLabel: 'Xanh Rêu · Size XL',
    stockByBranch: { 'cn-hn': 18, 'cn-dn': 0, 'cn-hcm': 26 },
    totalAvailable: 44,
  },
  {
    sku: 'ATN-TRG-M',
    productName: 'Áo Thun Cotton Organic',
    variantLabel: 'Trắng Kem · Size M',
    stockByBranch: { 'cn-hn': 54, 'cn-dn': 32, 'cn-hcm': 56 },
    totalAvailable: 142,
  },
  {
    sku: 'NON-DEN-F',
    productName: 'Mũ Lưỡi Trai Kaki',
    variantLabel: 'Đen · FreeSize',
    stockByBranch: { 'cn-hn': 11, 'cn-dn': 0, 'cn-hcm': 24 },
    totalAvailable: 35,
  },
];

function getDateSpanDays(startDate: string, endDate: string): number {
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 15;
  const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(60, diff));
}

export function getDashboardSnapshot(
  filters: DashboardFilters,
  role: UserRole,
  granularity: ChartGranularity
): {
  kpi: KpiSummary;
  timeSeries: RevenueTimePoint[];
  shareTitle: string;
  shareSubtitle: string;
  revenueShares: RevenueShareItem[];
  topProducts: ProductSalesRow[];
  slowProducts: ProductSalesRow[];
  branchInventory: BranchInventoryRow[];
  skuMatrix: SkuBranchMatrixRow[];
} {
  let timeFactor = TIME_FACTORS[filters.timePreset];
  if (filters.timePreset === 'custom') {
    const days = getDateSpanDays(filters.startDate, filters.endDate);
    timeFactor = {
      revScale: Math.max(0.05, Math.min(1.6, days / 30)),
      ordScale: Math.max(0.05, Math.min(1.6, days / 30)),
      growth: days >= 14 ? 7.9 : -1.8,
      aovDelta: 2.9,
    };
  }

  const branchWeight = BRANCH_WEIGHTS[filters.branchId] ?? { share: 0.22, growthAdj: 1.2 };
  const branchScale = filters.branchId === 'all' ? 1.0 : branchWeight.share;
  const branchGrowthAdj = filters.branchId === 'all' ? 0 : branchWeight.growthAdj;

  const categoryScale =
    filters.categoryId === 'all' ? 1.0 : CATEGORY_WEIGHTS[filters.categoryId].share;
  const categoryAovMult =
    filters.categoryId === 'all' ? 1.0 : CATEGORY_WEIGHTS[filters.categoryId].aovMult;
  const categoryGrowthAdj =
    filters.categoryId === 'all' ? 0 : CATEGORY_WEIGHTS[filters.categoryId].growthAdj;

  const paymentWeight = PAYMENT_WEIGHTS[filters.paymentMethod];

  const combinedRevScale =
    timeFactor.revScale * branchScale * categoryScale * paymentWeight.share;
  const combinedOrdScale =
    (timeFactor.ordScale * branchScale * categoryScale * paymentWeight.share) /
    categoryAovMult;

  const baseRevenue = 1_284_500_000;
  const baseOrders = 1_428;

  const totalRevenue = Math.round(baseRevenue * combinedRevScale);
  const totalOrders = Math.max(12, Math.round(baseOrders * combinedOrdScale));
  const cancelledOrders = Math.max(
    1,
    Math.round(totalOrders * paymentWeight.cancelRate)
  );
  const completedOrders = Math.max(1, totalOrders - cancelledOrders);
  const aov = Math.round(totalRevenue / completedOrders);

  const revenueDeltaPct = Number(
    (timeFactor.growth + branchGrowthAdj + categoryGrowthAdj).toFixed(1)
  );
  const aovDeltaPct = Number(
    (timeFactor.aovDelta + categoryGrowthAdj * 0.4).toFixed(1)
  );

  const visibleBranchRows =
    filters.branchId === 'all'
      ? BASE_BRANCH_INVENTORY
      : BASE_BRANCH_INVENTORY.filter((b) => b.branchId === filters.branchId);

  const categoryInventoryRatio =
    filters.categoryId === 'all' ? 1.0 : CATEGORY_WEIGHTS[filters.categoryId].share;

  const branchInventory: BranchInventoryRow[] = visibleBranchRows.map((row) => {
    const onHand = Math.round(row.onHand * categoryInventoryRatio);
    const reserved = Math.round(row.reserved * categoryInventoryRatio);
    return {
      ...row,
      onHand,
      reserved,
      available: Math.max(0, onHand - reserved),
    };
  });

  const totalAvailableStock = branchInventory.reduce(
    (acc, item) => acc + item.available,
    0
  );
  const lowStockSkuCount = branchInventory.reduce(
    (acc, item) => acc + item.lowStockSkus,
    0
  );
  const outOfStockSkuCount = branchInventory.reduce(
    (acc, item) => acc + item.outOfStockSkus,
    0
  );

  const timeSeries = buildTimeSeries(
    granularity,
    filters.timePreset,
    totalRevenue,
    totalOrders
  );

  const isCategoryBreakdown =
    role !== 'ADMIN' || filters.branchId !== 'all';

  let revenueShares: RevenueShareItem[];
  let shareTitle: string;
  let shareSubtitle: string;

  if (!isCategoryBreakdown) {
    shareTitle = 'Doanh thu theo Chi nhánh';
    shareSubtitle = 'Tỷ trọng doanh thu toàn hệ thống';
    revenueShares = [
      {
        id: 'cn-hcm',
        name: 'CN C (TP.HCM)',
        revenue: Math.round(totalRevenue * 0.39),
        percentage: 39,
        color: '#1D4ED8',
      },
      {
        id: 'cn-hn',
        name: 'CN A (Hà Nội)',
        revenue: Math.round(totalRevenue * 0.37),
        percentage: 37,
        color: '#3B82F6',
      },
      {
        id: 'cn-dn',
        name: 'CN B (Đà Nẵng)',
        revenue:
          totalRevenue -
          Math.round(totalRevenue * 0.39) -
          Math.round(totalRevenue * 0.37),
        percentage: 24,
        color: '#38BDF8',
      },
    ];
  } else {
    shareTitle = 'Doanh thu theo Danh mục SP';
    shareSubtitle = 'Tỷ trọng theo nhóm sản phẩm';
    const catDefs = CATEGORIES.filter((c) => c.id !== 'all');
    revenueShares = catDefs.map((cat) => {
      const w = CATEGORY_WEIGHTS[cat.id as Exclude<CategoryId, 'all'>].share;
      const pct = Math.round(w * 100);
      return {
        id: cat.id,
        name: cat.label,
        revenue: Math.round(totalRevenue * w),
        percentage: pct,
        color: cat.color,
      };
    });
  }

  const filteredProducts = BASE_PRODUCTS.filter((p) =>
    filters.categoryId === 'all' ? true : p.categoryId === filters.categoryId
  ).map((p) => {
    const scale = timeFactor.revScale * branchScale * paymentWeight.share;
    const scaledQty = Math.max(1, Math.round(p.soldQty * scale));
    const scaledRev = Math.round(p.revenue * scale);
    const branchStockScale =
      filters.branchId === 'all' ? 1 : (BRANCH_WEIGHTS[filters.branchId]?.share ?? 0.25);
    const avail =
      p.availableStock === 0
        ? 0
        : Math.max(1, Math.round(p.availableStock * branchStockScale));
    return {
      ...p,
      soldQty: scaledQty,
      revenue: scaledRev,
      availableStock: avail,
      stockStatus:
        avail === 0
          ? ('out_of_stock' as const)
          : avail <= 15
            ? ('low_stock' as const)
            : ('in_stock' as const),
    };
  });

  const maxProdRevenue = Math.max(
    1,
    filteredProducts.reduce((sum, p) => sum + p.revenue, 0)
  );

  const withShares: ProductSalesRow[] = filteredProducts.map((p) => ({
    ...p,
    revenueSharePct: Math.max(
      2,
      Math.round((p.revenue / maxProdRevenue) * 100)
    ),
  }));

  const topProducts = [...withShares]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const slowProducts = [...withShares]
    .sort((a, b) => a.soldQty - b.soldQty)
    .slice(0, 4);

  const skuMatrix = BASE_SKU_MATRIX.map((row) => {
    if (filters.branchId === 'all') return row;
    return {
      ...row,
      totalAvailable: row.stockByBranch[filters.branchId],
    };
  });

  return {
    kpi: {
      totalRevenue,
      revenueDeltaPct,
      totalOrders,
      completedOrders,
      cancelledOrders,
      aov,
      aovDeltaPct,
      totalAvailableStock,
      lowStockSkuCount,
      outOfStockSkuCount,
    },
    timeSeries,
    shareTitle,
    shareSubtitle,
    revenueShares,
    topProducts,
    slowProducts,
    branchInventory,
    skuMatrix,
  };
}

function buildTimeSeries(
  granularity: ChartGranularity,
  timePreset: DashboardFilters['timePreset'],
  totalRevenue: number,
  totalOrders: number
): RevenueTimePoint[] {
  if (granularity === 'week') {
    const weights = [0.21, 0.24, 0.26, 0.29];
    const labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
    return labels.map((label, idx) => ({
      label,
      revenue: Math.round(totalRevenue * weights[idx]),
      orders: Math.max(3, Math.round(totalOrders * weights[idx])),
    }));
  }

  if (granularity === 'month') {
    const weights = [0.14, 0.16, 0.15, 0.17, 0.18, 0.2];
    const labels = ['T06/26', 'T07/26', 'T08/26', 'T09/26', 'T10/26', 'T11/26'];
    return labels.map((label, idx) => ({
      label,
      revenue: Math.round(totalRevenue * weights[idx]),
      orders: Math.max(4, Math.round(totalOrders * weights[idx])),
    }));
  }

  if (timePreset === 'today') {
    const labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const weights = [0.08, 0.12, 0.14, 0.11, 0.13, 0.17, 0.16, 0.09];
    return labels.map((label, idx) => ({
      label,
      revenue: Math.round(totalRevenue * weights[idx]),
      orders: Math.max(1, Math.round(totalOrders * weights[idx])),
    }));
  }

  if (timePreset === '7d') {
    const labels = ['13/11', '14/11', '15/11', '16/11', '17/11', '18/11', '19/11'];
    const weights = [0.12, 0.13, 0.15, 0.16, 0.14, 0.14, 0.16];
    return labels.map((label, idx) => ({
      label,
      revenue: Math.round(totalRevenue * weights[idx]),
      orders: Math.max(2, Math.round(totalOrders * weights[idx])),
    }));
  }

  const labels = [
    '22/10',
    '25/10',
    '28/10',
    '31/10',
    '03/11',
    '06/11',
    '09/11',
    '12/11',
    '15/11',
    '19/11',
  ];
  const weights = [0.08, 0.09, 0.085, 0.105, 0.095, 0.1, 0.11, 0.105, 0.115, 0.115];
  return labels.map((label, idx) => ({
    label,
    revenue: Math.round(totalRevenue * weights[idx]),
    orders: Math.max(3, Math.round(totalOrders * weights[idx])),
  }));
}
