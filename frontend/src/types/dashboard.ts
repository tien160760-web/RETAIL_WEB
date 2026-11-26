export type UserRole = 'ADMIN' | 'BRANCH_MANAGER' | 'WAREHOUSE_STAFF' | 'SALES_STAFF';

export type BranchId = 'all' | 'cn-hn' | 'cn-dn' | 'cn-hcm' | (string & {});

export type TimePreset = 'today' | '7d' | '30d' | 'month' | 'custom';

export type ChartGranularity = 'day' | 'week' | 'month';

export type CategoryId = 'all' | 'ao-thun' | 'quan-denim' | 'ao-khoac' | 'phu-kien';

export type PaymentMethod = 'all' | 'COD' | 'ONLINE';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
  userName: string;
  userTitle: string;
  assignedBranchId: string | null;
  allowedMenuIds: string[];
}

export interface BranchOption {
  id: string;
  code: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  managerName: string;
  isActive: boolean;
}

export interface StaffAccount {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  branchId: string | null;
  isActive: boolean;
}

export interface DashboardFilters {
  timePreset: TimePreset;
  startDate: string;
  endDate: string;
  branchId: BranchId;
  categoryId: CategoryId;
  paymentMethod: PaymentMethod;
}

export interface KpiSummary {
  totalRevenue: number;
  revenueDeltaPct: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  aov: number;
  aovDeltaPct: number;
  totalAvailableStock: number;
  lowStockSkuCount: number;
  outOfStockSkuCount: number;
}

export interface RevenueTimePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface RevenueShareItem {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface ProductSalesRow {
  sku: string;
  name: string;
  variantLabel: string;
  categoryId: Exclude<CategoryId, 'all'>;
  categoryName: string;
  colorHex: string;
  soldQty: number;
  revenue: number;
  revenueSharePct: number;
  availableStock: number;
  stockStatus: StockStatus;
}

export interface BranchInventoryRow {
  branchId: string;
  branchName: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockSkus: number;
  outOfStockSkus: number;
  warningType: 'low' | 'out' | 'normal';
  warningLabel: string;
}

export interface SkuBranchMatrixRow {
  sku: string;
  productName: string;
  variantLabel: string;
  stockByBranch: Record<string, number>;
  totalAvailable: number;
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  path: string;
  pageTitle: string;
  description: string;
}

export interface SidebarGroup {
  id: string;
  title: string;
  items: SidebarMenuItem[];
}

export interface QuickSearchItem {
  id: string;
  type: 'SKU' | 'Đơn hàng' | 'Phiếu kho';
  code: string;
  title: string;
  meta: string;
  targetPath: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description: string;
}

export interface ProductVariantItem {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock?: number;
  imageUrl?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  description: string;
  imageUrl?: string;
  images?: string[];
  colorHex: string;
  isActive: boolean;
  variants: ProductVariantItem[];
}

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

// --- Vouchers (UC20) ---
export type DiscountType = 'PERCENT' | 'FIXED';

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// --- Inventory & Movements (UC10) ---
export interface InventoryLevelItem {
  id: string;
  branchId: string;
  sku: string;
  productName: string;
  variantLabel: string;
  categoryId: string;
  onHand: number;
  reserved: number;
}

export interface StockMovementItem {
  id: string;
  timestamp: string;
  branchId: string;
  sku: string;
  productName: string;
  type: 'GRN' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT' | 'RETURN_RESTOCK' | 'ORDER_RELEASE';
  delta: number;
  referenceCode: string;
  note: string;
  actorName: string;
}

// --- Purchase Orders & Receipts (UC08 & UC09) ---
export type PurchaseOrderStatus = 'PENDING_RECEIPT' | 'RECEIVED';

export interface PurchaseOrderLine {
  sku: string;
  productName: string;
  variantLabel: string;
  orderedQty: number;
  unitCost: number;
  receivedQty?: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  expectedDate: string;
  createdAt: string;
  createdBy: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderLine[];
  totalAmount: number;
  receiptCode?: string;
  receivedAt?: string;
  receivedBy?: string;
}

// --- Stock Transfers (UC11) ---
export type TransferStatus = 'PENDING_APPROVAL' | 'IN_TRANSIT' | 'COMPLETED';

export interface StockTransferLine {
  sku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
}

export interface StockTransferTicket {
  id: string;
  code: string;
  fromBranchId: string;
  toBranchId: string;
  createdAt: string;
  createdBy: string;
  status: TransferStatus;
  note: string;
  items: StockTransferLine[];
  approvedBy?: string;
  receivedBy?: string;
}

// --- Inventory Adjustments (UC12) ---
export type AdjustmentStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface InventoryAdjustmentTicket {
  id: string;
  code: string;
  branchId: string;
  sku: string;
  productName: string;
  variantLabel: string;
  systemOnHand: number;
  systemReserved: number;
  actualQty: number;
  delta: number;
  reason: string;
  createdAt: string;
  createdBy: string;
  status: AdjustmentStatus;
  reviewedBy?: string;
}

// --- Orders & Shipping (UC17, UC18, UC19) ---
export type OrderStatus =
  | 'PENDING_CONFIRM'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'HANDED_TO_CARRIER'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderPaymentStatus = 'UNPAID' | 'PAID' | 'REFUND_REQUIRED' | 'REFUNDED';

export interface OrderLineItem {
  sku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface RetailOrder {
  id: string;
  code: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: OrderPaymentStatus;
  status: OrderStatus;
  carrierName?: string;
  trackingCode?: string;
  cancelReason?: string;
  items: OrderLineItem[];
  totalAmount: number;
}

// --- Returns & Refunds (UC24) ---
export type ReturnStatus = 'PENDING' | 'APPROVED_REFUNDED' | 'REJECTED';
export type ReturnCondition = 'RESTOCKABLE' | 'DAMAGED';

export interface ReturnRequestItem {
  id: string;
  code: string;
  orderCode: string;
  branchId: string;
  customerName: string;
  sku: string;
  productName: string;
  variantLabel: string;
  purchasedQty: number;
  requestedQty: number;
  unitPrice: number;
  reason: string;
  evidenceNote: string;
  createdAt: string;
  status: ReturnStatus;
  receivedQty?: number;
  condition?: ReturnCondition;
  refundAmount?: number;
  rejectReason?: string;
  processedBy?: string;
}
