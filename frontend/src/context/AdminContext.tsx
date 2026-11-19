import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  BRANCHES,
  INITIAL_CATALOG_CATEGORIES,
  INITIAL_CATALOG_PRODUCTS,
  INITIAL_SUPPLIERS,
  ROLES,
} from '../data/mockDashboardData';
import {
  INITIAL_ADJUSTMENTS,
  INITIAL_INVENTORY_LEVELS,
  INITIAL_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RETURN_REQUESTS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_VOUCHERS,
} from '../data/mockBackofficeData';
import {
  BranchId,
  BranchOption,
  CatalogCategory,
  CatalogProduct,
  InventoryAdjustmentTicket,
  InventoryLevelItem,
  OrderStatus,
  PurchaseOrder,
  PurchaseOrderLine,
  RetailOrder,
  ReturnCondition,
  ReturnRequestItem,
  RoleConfig,
  StaffAccount,
  StockMovementItem,
  StockTransferLine,
  StockTransferTicket,
  SupplierItem,
  UserRole,
  VoucherItem,
} from '../types/dashboard';

export interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AdminContextValue {
  // Authentication (UC02)
  currentUser: StaffAccount | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;

  // Role & Branch Context
  role: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
  selectedBranchId: BranchId;
  setSelectedBranchId: (branchId: BranchId) => void;
  isBranchLocked: boolean;
  quickSearch: string;
  setQuickSearch: (q: string) => void;
  getBranchLabel: (id: BranchId) => string;

  // Branches (UC26) & Staff Accounts (UC04)
  branches: BranchOption[];
  addBranch: (input: Omit<BranchOption, 'id'>) => void;
  updateBranch: (id: string, input: Omit<BranchOption, 'id'>) => void;
  toggleBranchStatus: (id: string) => void;

  staffAccounts: StaffAccount[];
  addStaffAccount: (input: Omit<StaffAccount, 'id'>) => void;
  updateStaffAccount: (id: string, input: Partial<Omit<StaffAccount, 'id'>>) => void;
  toggleStaffStatus: (id: string) => { ok: boolean; error?: string };

  // Catalog & Products (UC06)
  categories: CatalogCategory[];
  addCategory: (input: Omit<CatalogCategory, 'id'>) => CatalogCategory;
  updateCategory: (id: string, input: Omit<CatalogCategory, 'id'>) => void;
  deleteCategory: (id: string) => boolean;

  products: CatalogProduct[];
  addProduct: (input: Omit<CatalogProduct, 'id'>) => CatalogProduct;
  updateProduct: (id: string, input: Omit<CatalogProduct, 'id'>) => void;
  deleteProduct: (id: string) => void;

  // Vouchers (UC20)
  vouchers: VoucherItem[];
  addVoucher: (input: Omit<VoucherItem, 'id' | 'usedCount'>) => void;
  updateVoucher: (id: string, input: Omit<VoucherItem, 'id' | 'usedCount'>) => void;
  toggleVoucherStatus: (id: string) => void;

  // Suppliers (UC07)
  suppliers: SupplierItem[];
  addSupplier: (input: Omit<SupplierItem, 'id'>) => SupplierItem;
  updateSupplier: (id: string, input: Omit<SupplierItem, 'id'>) => void;
  toggleSupplierStatus: (id: string) => void;

  // Inventory & Stock Movements (UC10)
  inventoryLevels: InventoryLevelItem[];
  stockMovements: StockMovementItem[];

  // Purchase Orders & Receipts (UC08, UC09)
  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (input: {
    supplierId: string;
    branchId: string;
    expectedDate: string;
    items: PurchaseOrderLine[];
  }) => PurchaseOrder;
  receivePurchaseOrder: (
    poId: string,
    receivedMap: Record<string, number>
  ) => { ok: boolean; error?: string; receiptCode?: string };

  // Stock Transfers (UC11)
  stockTransfers: StockTransferTicket[];
  createStockTransfer: (input: {
    fromBranchId: string;
    toBranchId: string;
    note: string;
    items: StockTransferLine[];
  }) => { ok: boolean; error?: string };
  approveTransferDispatch: (transferId: string) => { ok: boolean; error?: string };
  confirmTransferReceipt: (transferId: string) => { ok: boolean; error?: string };

  // Inventory Adjustments (UC12)
  adjustments: InventoryAdjustmentTicket[];
  createAdjustment: (input: {
    branchId: string;
    sku: string;
    actualQty: number;
    reason: string;
  }) => { ok: boolean; error?: string };
  reviewAdjustment: (
    adjustmentId: string,
    approve: boolean
  ) => { ok: boolean; error?: string };

  // Orders & Shipping & Cancel (UC17, UC18, UC19)
  orders: RetailOrder[];
  advanceOrderStatus: (
    orderId: string,
    nextStatus: OrderStatus,
    shippingMeta?: { carrierName: string; trackingCode: string }
  ) => { ok: boolean; error?: string };
  cancelOrder: (orderId: string, reason: string) => { ok: boolean; error?: string };

  // Returns & Refunds (UC24)
  returnRequests: ReturnRequestItem[];
  approveReturnRequest: (
    returnId: string,
    payload: { receivedQty: number; condition: ReturnCondition }
  ) => { ok: boolean; error?: string };
  rejectReturnRequest: (returnId: string, rejectReason: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function nowVN(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BranchOption[]>(BRANCHES);
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(
    INITIAL_STAFF_ACCOUNTS
  );

  // Start at Login screen by default so Admin login flow (UC02) is immediately accessible
  const [currentUser, setCurrentUser] = useState<StaffAccount | null>(() => {
    try {
      const savedEmail = sessionStorage.getItem('retail_admin_email');
      if (savedEmail) {
        const found = INITIAL_STAFF_ACCOUNTS.find(
          (s) => s.email === savedEmail && s.isActive
        );
        if (found) return found;
      }
    } catch {
      // ignore storage error
    }
    return null;
  });

  const [role, setRoleState] = useState<UserRole>(currentUser?.role ?? 'ADMIN');
  const [selectedBranchId, setSelectedBranchIdState] = useState<BranchId>(
    currentUser?.branchId ?? 'all'
  );
  const [quickSearch, setQuickSearch] = useState('');

  const [categories, setCategories] = useState<CatalogCategory[]>(
    INITIAL_CATALOG_CATEGORIES
  );
  const [products, setProducts] = useState<CatalogProduct[]>(
    INITIAL_CATALOG_PRODUCTS
  );
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);

  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevelItem[]>(
    INITIAL_INVENTORY_LEVELS
  );
  const [stockMovements, setStockMovements] = useState<StockMovementItem[]>(
    INITIAL_STOCK_MOVEMENTS
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    INITIAL_PURCHASE_ORDERS
  );
  const [stockTransfers, setStockTransfers] = useState<StockTransferTicket[]>(
    INITIAL_STOCK_TRANSFERS
  );
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentTicket[]>(
    INITIAL_ADJUSTMENTS
  );
  const [orders, setOrders] = useState<RetailOrder[]>(INITIAL_ORDERS);
  const [returnRequests, setReturnRequests] = useState<ReturnRequestItem[]>(
    INITIAL_RETURN_REQUESTS
  );

  const baseRoleConfig = useMemo(
    () => ROLES.find((r) => r.id === role) ?? ROLES[0],
    [role]
  );

  const roleConfig: RoleConfig = useMemo(() => {
    if (currentUser && currentUser.role === role) {
      return {
        ...baseRoleConfig,
        userName: currentUser.fullName,
        assignedBranchId: currentUser.branchId,
      };
    }
    return baseRoleConfig;
  }, [baseRoleConfig, currentUser, role]);

  const isBranchLocked = role !== 'ADMIN';

  const login = (email: string, password: string): LoginResult => {
    const cleanEmail = email.trim().toLowerCase();
    const account = staffAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );
    if (!account || account.password !== password) {
      return {
        ok: false,
        error: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      };
    }
    if (!account.isActive) {
      return {
        ok: false,
        error: 'Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên.',
      };
    }
    setCurrentUser(account);
    setRoleState(account.role);
    setSelectedBranchIdState(account.branchId ?? 'all');
    try {
      sessionStorage.setItem('retail_admin_email', account.email);
    } catch {
      // ignore
    }
    return { ok: true };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('retail_admin_email');
    } catch {
      // ignore
    }
  };

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    const nextConfig = ROLES.find((r) => r.id === nextRole);
    if (nextConfig?.assignedBranchId) {
      setSelectedBranchIdState(nextConfig.assignedBranchId);
    } else {
      setSelectedBranchIdState('all');
    }
  };

  const setSelectedBranchId = (branchId: BranchId) => {
    if (isBranchLocked) return;
    setSelectedBranchIdState(branchId);
  };

  const getBranchLabel = (id: BranchId) => {
    if (id === 'all') return 'Chi nhánh: Tất cả';
    const found = branches.find((b) => b.id === id);
    return found ? found.name : 'Chi nhánh';
  };

  // --- Helper to mutate stock & log movement ---
  const applyStockDelta = (
    branchId: string,
    sku: string,
    productName: string,
    variantLabel: string,
    categoryId: string,
    onHandDelta: number,
    reservedDelta: number,
    movementType: StockMovementItem['type'],
    referenceCode: string,
    note: string
  ) => {
    setInventoryLevels((prev) => {
      const idx = prev.findIndex(
        (row) => row.branchId === branchId && row.sku === sku
      );
      if (idx >= 0) {
        return prev.map((row, i) =>
          i === idx
            ? {
                ...row,
                onHand: Math.max(0, row.onHand + onHandDelta),
                reserved: Math.max(0, row.reserved + reservedDelta),
              }
            : row
        );
      }
      return [
        {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          branchId,
          sku,
          productName,
          variantLabel,
          categoryId,
          onHand: Math.max(0, onHandDelta),
          reserved: Math.max(0, reservedDelta),
        },
        ...prev,
      ];
    });

    if (onHandDelta !== 0 || movementType === 'ORDER_RELEASE') {
      setStockMovements((prev) => [
        {
          id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: nowVN(),
          branchId,
          sku,
          productName,
          type: movementType,
          delta: onHandDelta !== 0 ? onHandDelta : -reservedDelta,
          referenceCode,
          note,
          actorName: roleConfig.userName,
        },
        ...prev,
      ]);
    }
  };

  // --- Branches CRUD (UC26) ---
  const addBranch = (input: Omit<BranchOption, 'id'>) => {
    const newBranch: BranchOption = {
      id: `cn-${Date.now().toString().slice(-4)}`,
      ...input,
    };
    setBranches((prev) => [...prev, newBranch]);
  };

  const updateBranch = (id: string, input: Omit<BranchOption, 'id'>) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...input } : b))
    );
  };

  const toggleBranchStatus = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  // --- Staff CRUD (UC04) ---
  const addStaffAccount = (input: Omit<StaffAccount, 'id'>) => {
    setStaffAccounts((prev) => [
      { id: `staff-${Date.now()}`, ...input },
      ...prev,
    ]);
  };

  const updateStaffAccount = (
    id: string,
    input: Partial<Omit<StaffAccount, 'id'>>
  ) => {
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...input } : s))
    );
  };

  const toggleStaffStatus = (id: string): { ok: boolean; error?: string } => {
    const target = staffAccounts.find((s) => s.id === id);
    if (!target) return { ok: false, error: 'Tài khoản không tồn tại.' };
    if (target.role === 'ADMIN' && target.isActive) {
      const activeAdmins = staffAccounts.filter(
        (s) => s.role === 'ADMIN' && s.isActive
      );
      if (activeAdmins.length <= 1) {
        return {
          ok: false,
          error: 'Không thể vô hiệu hóa tài khoản Quản trị viên duy nhất đang hoạt động.',
        };
      }
    }
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    return { ok: true };
  };

  // --- Categories & Products CRUD (UC06) ---
  const addCategory = (input: Omit<CatalogCategory, 'id'>) => {
    const newItem: CatalogCategory = { id: `cat-${Date.now()}`, ...input };
    setCategories((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateCategory = (id: string, input: Omit<CatalogCategory, 'id'>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...input } : c))
    );
  };

  const deleteCategory = (id: string): boolean => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) return false;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  const addProduct = (input: Omit<CatalogProduct, 'id'>) => {
    const newProduct: CatalogProduct = { id: `prod-${Date.now()}`, ...input };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, input: Omit<CatalogProduct, 'id'>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...input } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Vouchers CRUD (UC20) ---
  const addVoucher = (input: Omit<VoucherItem, 'id' | 'usedCount'>) => {
    setVouchers((prev) => [
      { id: `vc-${Date.now()}`, usedCount: 0, ...input },
      ...prev,
    ]);
  };

  const updateVoucher = (
    id: string,
    input: Omit<VoucherItem, 'id' | 'usedCount'>
  ) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...input } : v))
    );
  };

  const toggleVoucherStatus = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
  };

  // --- Suppliers CRUD (UC07) ---
  const addSupplier = (input: Omit<SupplierItem, 'id'>) => {
    const newSup: SupplierItem = { id: `sup-${Date.now()}`, ...input };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, input: Omit<SupplierItem, 'id'>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...input } : s))
    );
  };

  const toggleSupplierStatus = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // --- Purchase Orders (UC08) & Receipts (UC09) ---
  const createPurchaseOrder = (input: {
    supplierId: string;
    branchId: string;
    expectedDate: string;
    items: PurchaseOrderLine[];
  }) => {
    const sup = suppliers.find((s) => s.id === input.supplierId);
    const totalAmount = input.items.reduce(
      (sum, it) => sum + it.orderedQty * it.unitCost,
      0
    );
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `PO-2026-${String(purchaseOrders.length + 116).padStart(4, '0')}`,
      supplierId: input.supplierId,
      supplierName: sup?.name ?? 'Nhà cung cấp',
      branchId: input.branchId,
      expectedDate: input.expectedDate,
      createdAt: nowVN().split(' ')[0],
      createdBy: roleConfig.userName,
      status: 'PENDING_RECEIPT',
      items: input.items,
      totalAmount,
    };
    setPurchaseOrders((prev) => [po, ...prev]);
    return po;
  };

  const receivePurchaseOrder = (
    poId: string,
    receivedMap: Record<string, number>
  ): { ok: boolean; error?: string; receiptCode?: string } => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'RECEIVED') {
      return { ok: false, error: 'Đơn nhập hàng không tồn tại hoặc đã hoàn tất nhập kho.' };
    }

    for (const line of po.items) {
      const qty = receivedMap[line.sku];
      if (qty === undefined || Number.isNaN(qty) || qty < 0) {
        return { ok: false, error: `Số lượng thực nhận của ${line.sku} không được âm.` };
      }
      if (qty > line.orderedQty) {
        return {
          ok: false,
          error: `Số lượng thực nhận của ${line.sku} (${qty}) vượt quá số lượng đặt (${line.orderedQty}).`,
        };
      }
    }

    const receiptCode = `GRN-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const updatedItems = po.items.map((line) => {
      const qty = receivedMap[line.sku] ?? 0;
      if (qty > 0) {
        const prod = products.find((p) =>
          p.variants.some((v) => v.sku === line.sku)
        );
        applyStockDelta(
          po.branchId,
          line.sku,
          line.productName,
          line.variantLabel,
          prod?.categoryId ?? 'ao-thun',
          qty,
          0,
          'GRN',
          receiptCode,
          `Nhập kho từ đơn ${po.code} (${po.supplierName})`
        );
      }
      return { ...line, receivedQty: qty };
    });

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'RECEIVED',
              receiptCode,
              receivedAt: nowVN(),
              receivedBy: roleConfig.userName,
              items: updatedItems,
            }
          : p
      )
    );

    return { ok: true, receiptCode };
  };

  // --- Stock Transfers (UC11) ---
  const createStockTransfer = (input: {
    fromBranchId: string;
    toBranchId: string;
    note: string;
    items: StockTransferLine[];
  }): { ok: boolean; error?: string } => {
    if (input.fromBranchId === input.toBranchId) {
      return { ok: false, error: 'Chi nhánh xuất và chi nhánh nhận không được trùng nhau.' };
    }
    if (input.items.length === 0) {
      return { ok: false, error: 'Vui lòng chọn ít nhất một biến thể sản phẩm cần điều chuyển.' };
    }

    for (const line of input.items) {
      if (line.quantity <= 0) {
        return { ok: false, error: `Số lượng chuyển của ${line.sku} phải lớn hơn 0.` };
      }
      const stock = inventoryLevels.find(
        (inv) => inv.branchId === input.fromBranchId && inv.sku === line.sku
      );
      const avail = stock ? Math.max(0, stock.onHand - stock.reserved) : 0;
      if (line.quantity > avail) {
        return {
          ok: false,
          error: `Tồn khả dụng tại chi nhánh xuất cho ${line.sku} chỉ còn ${avail}, không đủ để chuyển ${line.quantity}.`,
        };
      }
    }

    const ticket: StockTransferTicket = {
      id: `trf-${Date.now()}`,
      code: `TRF-2026-${String(stockTransfers.length + 20).padStart(3, '0')}`,
      fromBranchId: input.fromBranchId,
      toBranchId: input.toBranchId,
      createdAt: nowVN(),
      createdBy: roleConfig.userName,
      status: 'PENDING_APPROVAL',
      note: input.note.trim(),
      items: input.items,
    };
    setStockTransfers((prev) => [ticket, ...prev]);
    return { ok: true };
  };

  const approveTransferDispatch = (
    transferId: string
  ): { ok: boolean; error?: string } => {
    const trf = stockTransfers.find((t) => t.id === transferId);
    if (!trf || trf.status !== 'PENDING_APPROVAL') {
      return { ok: false, error: 'Phiếu điều chuyển không ở trạng thái chờ duyệt.' };
    }

    for (const line of trf.items) {
      const stock = inventoryLevels.find(
        (inv) => inv.branchId === trf.fromBranchId && inv.sku === line.sku
      );
      const avail = stock ? Math.max(0, stock.onHand - stock.reserved) : 0;
      if (line.quantity > avail) {
        return {
          ok: false,
          error: `Không đủ tồn khả dụng cho ${line.sku} tại chi nhánh xuất (còn ${avail}).`,
        };
      }
    }

    for (const line of trf.items) {
      applyStockDelta(
        trf.fromBranchId,
        line.sku,
        line.productName,
        line.variantLabel,
        'ao-thun',
        -line.quantity,
        0,
        'TRANSFER_OUT',
        trf.code,
        `Xuất điều chuyển sang ${getBranchLabel(trf.toBranchId)}`
      );
    }

    setStockTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'IN_TRANSIT', approvedBy: roleConfig.userName }
          : t
      )
    );
    return { ok: true };
  };

  const confirmTransferReceipt = (
    transferId: string
  ): { ok: boolean; error?: string } => {
    const trf = stockTransfers.find((t) => t.id === transferId);
    if (!trf || trf.status !== 'IN_TRANSIT') {
      return { ok: false, error: 'Phiếu không ở trạng thái đang vận chuyển.' };
    }

    for (const line of trf.items) {
      applyStockDelta(
        trf.toBranchId,
        line.sku,
        line.productName,
        line.variantLabel,
        'ao-thun',
        line.quantity,
        0,
        'TRANSFER_IN',
        trf.code,
        `Nhận điều chuyển từ ${getBranchLabel(trf.fromBranchId)}`
      );
    }

    setStockTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'COMPLETED', receivedBy: roleConfig.userName }
          : t
      )
    );
    return { ok: true };
  };

  // --- Inventory Adjustments (UC12) ---
  const createAdjustment = (input: {
    branchId: string;
    sku: string;
    actualQty: number;
    reason: string;
  }): { ok: boolean; error?: string } => {
    if (Number.isNaN(input.actualQty) || input.actualQty < 0) {
      return { ok: false, error: 'Số lượng kiểm đếm thực tế không được là số âm.' };
    }
    if (!input.reason.trim()) {
      return { ok: false, error: 'Vui lòng nhập lý do điều chỉnh tồn kho.' };
    }
    const inv = inventoryLevels.find(
      (i) => i.branchId === input.branchId && i.sku === input.sku
    );
    if (!inv) {
      return { ok: false, error: 'Không tìm thấy bản ghi tồn kho cho SKU tại chi nhánh này.' };
    }
    if (input.actualQty < inv.reserved) {
      return {
        ok: false,
        error: `Số lượng thực tế (${input.actualQty}) nhỏ hơn số lượng đang giữ cho đơn hàng chờ xử lý (${inv.reserved}).`,
      };
    }

    const ticket: InventoryAdjustmentTicket = {
      id: `adj-${Date.now()}`,
      code: `ADJ-2026-${String(adjustments.length + 5).padStart(3, '0')}`,
      branchId: input.branchId,
      sku: inv.sku,
      productName: inv.productName,
      variantLabel: inv.variantLabel,
      systemOnHand: inv.onHand,
      systemReserved: inv.reserved,
      actualQty: input.actualQty,
      delta: input.actualQty - inv.onHand,
      reason: input.reason.trim(),
      createdAt: nowVN(),
      createdBy: roleConfig.userName,
      status: 'PENDING_APPROVAL',
    };
    setAdjustments((prev) => [ticket, ...prev]);
    return { ok: true };
  };

  const reviewAdjustment = (
    adjustmentId: string,
    approve: boolean
  ): { ok: boolean; error?: string } => {
    const ticket = adjustments.find((a) => a.id === adjustmentId);
    if (!ticket || ticket.status !== 'PENDING_APPROVAL') {
      return { ok: false, error: 'Phiếu kiểm kê đã được xử lý trước đó.' };
    }

    if (approve) {
      const inv = inventoryLevels.find(
        (i) => i.branchId === ticket.branchId && i.sku === ticket.sku
      );
      if (inv && ticket.actualQty < inv.reserved) {
        return {
          ok: false,
          error: `Không thể phê duyệt: số lượng thực tế (${ticket.actualQty}) nhỏ hơn số lượng đang giữ (${inv.reserved}).`,
        };
      }
      const delta = inv ? ticket.actualQty - inv.onHand : ticket.delta;
      applyStockDelta(
        ticket.branchId,
        ticket.sku,
        ticket.productName,
        ticket.variantLabel,
        inv?.categoryId ?? 'ao-thun',
        delta,
        0,
        'ADJUSTMENT',
        ticket.code,
        `Kiểm kê điều chỉnh: ${ticket.reason}`
      );
    }

    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === adjustmentId
          ? {
              ...a,
              status: approve ? 'APPROVED' : 'REJECTED',
              reviewedBy: roleConfig.userName,
            }
          : a
      )
    );
    return { ok: true };
  };

  // --- Orders Processing (UC17, UC18, UC19) ---
  const advanceOrderStatus = (
    orderId: string,
    nextStatus: OrderStatus,
    shippingMeta?: { carrierName: string; trackingCode: string }
  ): { ok: boolean; error?: string } => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return { ok: false, error: 'Đơn hàng không tồn tại.' };
    if (ord.status === 'CANCELLED') {
      return { ok: false, error: 'Đơn hàng đã bị hủy, không thể xử lý tiếp.' };
    }

    if (
      nextStatus === 'CONFIRMED' &&
      ord.paymentMethod === 'ONLINE' &&
      ord.paymentStatus === 'UNPAID'
    ) {
      return {
        ok: false,
        error:
          'Không thể xác nhận đơn hàng: Đơn thanh toán trực tuyến chưa hoàn tất thanh toán.',
      };
    }

    if (nextStatus === 'HANDED_TO_CARRIER') {
      if (!shippingMeta?.carrierName.trim() || !shippingMeta?.trackingCode.trim()) {
        return {
          ok: false,
          error: 'Vui lòng nhập đầy đủ đơn vị vận chuyển và mã vận đơn.',
        };
      }
    }

    // When delivered, deduct onHand & reserved cleanly
    if (nextStatus === 'DELIVERED') {
      for (const line of ord.items) {
        setInventoryLevels((prev) =>
          prev.map((inv) =>
            inv.branchId === ord.branchId && inv.sku === line.sku
              ? {
                  ...inv,
                  onHand: Math.max(0, inv.onHand - line.quantity),
                  reserved: Math.max(0, inv.reserved - line.quantity),
                }
              : inv
          )
        );
      }
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              paymentStatus:
                nextStatus === 'DELIVERED' && o.paymentMethod === 'COD'
                  ? 'PAID'
                  : o.paymentStatus,
              carrierName: shippingMeta?.carrierName ?? o.carrierName,
              trackingCode: shippingMeta?.trackingCode ?? o.trackingCode,
            }
          : o
      )
    );
    return { ok: true };
  };

  const cancelOrder = (
    orderId: string,
    reason: string
  ): { ok: boolean; error?: string } => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return { ok: false, error: 'Không tìm thấy đơn hàng.' };
    if (
      ord.status === 'SHIPPING' ||
      ord.status === 'DELIVERED' ||
      ord.status === 'CANCELLED'
    ) {
      return {
        ok: false,
        error: 'Đơn hàng đang giao hoặc đã hoàn tất, không đủ điều kiện hủy.',
      };
    }
    if (!reason.trim()) {
      return { ok: false, error: 'Vui lòng nhập lý do hủy đơn hàng.' };
    }

    for (const line of ord.items) {
      applyStockDelta(
        ord.branchId,
        line.sku,
        line.productName,
        line.variantLabel,
        'ao-thun',
        0,
        -line.quantity,
        'ORDER_RELEASE',
        ord.code,
        `Giải phóng tồn kho đang giữ do hủy đơn (${reason.trim()})`
      );
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'CANCELLED',
              cancelReason: reason.trim(),
              paymentStatus:
                o.paymentStatus === 'PAID' ? 'REFUND_REQUIRED' : o.paymentStatus,
            }
          : o
      )
    );
    return { ok: true };
  };

  // --- Returns & Refunds (UC24) ---
  const approveReturnRequest = (
    returnId: string,
    payload: { receivedQty: number; condition: ReturnCondition }
  ): { ok: boolean; error?: string } => {
    const req = returnRequests.find((r) => r.id === returnId);
    if (!req || req.status !== 'PENDING') {
      return { ok: false, error: 'Yêu cầu trả hàng không hợp lệ hoặc đã xử lý.' };
    }
    if (
      Number.isNaN(payload.receivedQty) ||
      payload.receivedQty <= 0 ||
      payload.receivedQty > req.purchasedQty
    ) {
      return {
        ok: false,
        error: `Số lượng nhận lại phải từ 1 đến ${req.purchasedQty} (không vượt quá số lượng đã mua).`,
      };
    }

    const refundAmount = payload.receivedQty * req.unitPrice;
    if (payload.condition === 'RESTOCKABLE') {
      applyStockDelta(
        req.branchId,
        req.sku,
        req.productName,
        req.variantLabel,
        'ao-thun',
        payload.receivedQty,
        0,
        'RETURN_RESTOCK',
        req.code,
        `Nhập lại kho hàng trả đủ điều kiện từ đơn ${req.orderCode}`
      );
    }

    setReturnRequests((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              status: 'APPROVED_REFUNDED',
              receivedQty: payload.receivedQty,
              condition: payload.condition,
              refundAmount,
              processedBy: roleConfig.userName,
            }
          : r
      )
    );
    return { ok: true };
  };

  const rejectReturnRequest = (returnId: string, rejectReason: string) => {
    setReturnRequests((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              status: 'REJECTED',
              rejectReason: rejectReason.trim() || 'Không đáp ứng điều kiện đổi trả',
              processedBy: roleConfig.userName,
            }
          : r
      )
    );
  };

  const value: AdminContextValue = {
    currentUser,
    login,
    logout,
    role,
    roleConfig,
    setRole,
    selectedBranchId,
    setSelectedBranchId,
    isBranchLocked,
    quickSearch,
    setQuickSearch,
    getBranchLabel,
    branches,
    addBranch,
    updateBranch,
    toggleBranchStatus,
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    toggleStaffStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    vouchers,
    addVoucher,
    updateVoucher,
    toggleVoucherStatus,
    suppliers,
    addSupplier,
    updateSupplier,
    toggleSupplierStatus,
    inventoryLevels,
    stockMovements,
    purchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    stockTransfers,
    createStockTransfer,
    approveTransferDispatch,
    confirmTransferReceipt,
    adjustments,
    createAdjustment,
    reviewAdjustment,
    orders,
    advanceOrderStatus,
    cancelOrder,
    returnRequests,
    approveReturnRequest,
    rejectReturnRequest,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdminContext must be used inside AdminProvider');
  }
  return ctx;
}
