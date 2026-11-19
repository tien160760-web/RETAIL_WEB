import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import {
  OrderStatus,
  RetailOrder,
  ReturnCondition,
  ReturnRequestItem,
} from '../types/dashboard';
import { formatVND } from '../utils/format';
import { SelectField } from '../components/ui/SelectField';
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
  SPRING_PILL,
} from '../components/ui/MotionPrimitives';

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string }
> = {
  PENDING_CONFIRM: {
    label: 'Chờ xác nhận',
    badge: 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    badge: 'bg-[#DBEAFE]/90 text-[#1D4ED8] border-[#93C5FD]',
  },
  PREPARING: {
    label: 'Đang chuẩn bị hàng',
    badge: 'bg-[#E0E7FF]/90 text-[#4338CA] border-[#C7D2FE]',
  },
  HANDED_TO_CARRIER: {
    label: 'Đã bàn giao ĐVVC',
    badge: 'bg-[#E0F2FE]/90 text-[#0369A1] border-[#BAE6FD]',
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    badge: 'bg-[#DBEAFE]/90 text-[#1D4ED8] border-[#93C5FD]',
  },
  DELIVERED: {
    label: 'Giao thành công',
    badge: 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badge: 'bg-[#FEE2E2]/90 text-[#B91C1C] border-[#FECACA]',
  },
};

export function OrdersPage() {
  const {
    selectedBranchId,
    orders,
    advanceOrderStatus,
    cancelOrder,
    returnRequests,
    approveReturnRequest,
    rejectReturnRequest,
    getBranchLabel,
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState<'orders' | 'returns'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Order Detail & Action modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [carrierName, setCarrierName] = useState('Giao Hàng Nhanh (GHN)');
  const [trackingCode, setTrackingCode] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [orderModalError, setOrderModalError] = useState<string | null>(null);

  // Return Processing modal (UC24)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestItem | null>(
    null
  );
  const [returnMode, setReturnMode] = useState<'approve' | 'reject'>('approve');
  const [receivedQty, setReceivedQty] = useState('1');
  const [returnCondition, setReturnCondition] =
    useState<ReturnCondition>('RESTOCKABLE');
  const [rejectReason, setRejectReason] = useState('');
  const [returnErr, setReturnErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const selectedOrder: RetailOrder | undefined = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (selectedBranchId !== 'all' && o.branchId !== selectedBranchId)
        return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (q) {
        return (
          o.code.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
        );
      }
      return true;
    });
  }, [orders, selectedBranchId, statusFilter, searchQuery]);

  const visibleReturns = useMemo(() => {
    if (selectedBranchId === 'all') return returnRequests;
    return returnRequests.filter((r) => r.branchId === selectedBranchId);
  }, [returnRequests, selectedBranchId]);

  const openOrderDetail = (ord: RetailOrder) => {
    setSelectedOrderId(ord.id);
    setCarrierName(ord.carrierName || 'Giao Hàng Nhanh (GHN)');
    setTrackingCode(
      ord.trackingCode || `GHN${Math.floor(1000000 + Math.random() * 9000000)}VN`
    );
    setCancelReason('');
    setShowCancelForm(false);
    setOrderModalError(null);
  };

  const handleAdvance = (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setOrderModalError(null);
    const res = advanceOrderStatus(
      selectedOrder.id,
      nextStatus,
      nextStatus === 'HANDED_TO_CARRIER'
        ? { carrierName, trackingCode }
        : undefined
    );
    if (!res.ok) {
      setOrderModalError(res.error ?? 'Không thể cập nhật trạng thái đơn hàng.');
      return;
    }
    showToast(
      `Đã cập nhật đơn ${selectedOrder.code} sang trạng thái "${ORDER_STATUS_META[nextStatus].label}".`
    );
  };

  const handleCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setOrderModalError(null);
    const res = cancelOrder(selectedOrder.id, cancelReason);
    if (!res.ok) {
      setOrderModalError(res.error ?? 'Không thể hủy đơn hàng.');
      return;
    }
    setShowCancelForm(false);
    showToast(
      `Đã hủy đơn ${selectedOrder.code} và giải phóng số lượng tồn kho đang giữ.`
    );
  };

  const openReturnModal = (req: ReturnRequestItem) => {
    setSelectedReturn(req);
    setReturnMode('approve');
    setReceivedQty(String(req.requestedQty));
    setReturnCondition('RESTOCKABLE');
    setRejectReason('');
    setReturnErr(null);
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setReturnErr(null);
    if (returnMode === 'reject') {
      rejectReturnRequest(selectedReturn.id, rejectReason);
      setSelectedReturn(null);
      showToast(`Đã từ chối yêu cầu trả hàng ${selectedReturn.code}.`);
      return;
    }

    const res = approveReturnRequest(selectedReturn.id, {
      receivedQty: Number(receivedQty),
      condition: returnCondition,
    });
    if (!res.ok) {
      setReturnErr(res.error ?? 'Không thể xử lý yêu cầu trả hàng.');
      return;
    }
    setSelectedReturn(null);
    showToast(
      returnCondition === 'RESTOCKABLE'
        ? `Đã chấp thuận ${selectedReturn.code}, cộng lại tồn kho và xác nhận hoàn tiền.`
        : `Đã chấp thuận ${selectedReturn.code} (hàng lỗi không nhập lại kho) và xác nhận hoàn tiền.`
    );
  };

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full space-y-3.5 relative"
    >
      {toastMsg && (
        <div className="fixed bottom-5 right-6 z-50 bg-[#0B1736]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-[12px] shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)] border border-[#60A5FA]/35 flex items-center gap-2 text-[12px] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em]">
            Xử lý Đơn hàng, Giao hàng &amp; Trả hàng Hoàn tiền
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Xác nhận đơn, cập nhật vận chuyển, xử lý hủy đơn giải phóng tồn kho và duyệt trả hàng hoàn tiền
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] font-bold text-[#1D4ED8]">
          {getBranchLabel(selectedBranchId)}
        </span>
      </motion.section>

      {/* Tabs */}
      <motion.div
        variants={bentoItemVariants}
        className="inline-flex items-center gap-1 p-1 rounded-[12px] glass-card"
      >
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'orders' && (
            <motion.div
              layoutId="orders-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <ShoppingBag className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Đơn hàng &amp; Giao hàng ({filteredOrders.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'returns' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'returns' && (
            <motion.div
              layoutId="orders-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <RotateCcw className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Yêu cầu Trả hàng &amp; Hoàn tiền ({visibleReturns.length})
          </span>
        </button>
      </motion.div>

      {activeTab === 'orders' ? (
        <>
          <motion.section
            variants={bentoItemVariants}
            className="w-full min-h-[54px] glass-card rounded-[16px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 relative z-20"
          >
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="w-full sm:w-[290px] h-[34px] rounded-[10px] border border-[#CBD5E1] focus-within:border-[#2563EB] px-3 flex items-center gap-2 bg-white/90">
                <Search className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>

              <SelectField
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as 'all' | OrderStatus)}
                className="w-[190px]"
                heightClass="h-[34px]"
                options={[
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'PENDING_CONFIRM', label: 'Chờ xác nhận' },
                  { value: 'CONFIRMED', label: 'Đã xác nhận' },
                  { value: 'PREPARING', label: 'Đang chuẩn bị hàng' },
                  { value: 'HANDED_TO_CARRIER', label: 'Đã bàn giao ĐVVC' },
                  { value: 'SHIPPING', label: 'Đang giao hàng' },
                  { value: 'DELIVERED', label: 'Giao thành công' },
                  { value: 'CANCELLED', label: 'Đã hủy' },
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </motion.section>

          <motion.section
            variants={bentoItemVariants}
            className="w-full glass-card rounded-[16px] overflow-x-auto"
          >
            <table className="w-full border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                  <th className="px-4 w-[135px]">Mã đơn hàng</th>
                  <th className="px-4">Khách hàng &amp; Chi nhánh</th>
                  <th className="px-4 w-[145px]">Thanh toán</th>
                  <th className="px-4 w-[125px] text-right">Tổng tiền</th>
                  <th className="px-4 w-[145px]">Trạng thái đơn</th>
                  <th className="px-4 w-[130px] text-right">Xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[62px]">
                    <td className="px-4">
                      <p className="font-mono font-bold text-[#1D4ED8]">{ord.code}</p>
                      <p className="text-[10.5px] text-[#64748B]">{ord.createdAt}</p>
                    </td>
                    <td className="px-4">
                      <p className="font-semibold text-[#0F172A]">
                        {ord.customerName} ·{' '}
                        <span className="font-normal text-[#475569]">{ord.customerPhone}</span>
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        {getBranchLabel(ord.branchId)} · {ord.items.length} mặt hàng
                      </p>
                    </td>
                    <td className="px-4">
                      <span className="font-bold text-[#0F172A]">{ord.paymentMethod}</span>
                      <p
                        className={`text-[11px] font-semibold ${
                          ord.paymentStatus === 'PAID'
                            ? 'text-[#15803D]'
                            : ord.paymentStatus === 'REFUND_REQUIRED'
                              ? 'text-[#DC2626]'
                              : 'text-[#D97706]'
                        }`}
                      >
                        {ord.paymentStatus === 'PAID'
                          ? 'Đã thanh toán'
                          : ord.paymentStatus === 'REFUND_REQUIRED'
                            ? 'Cần hoàn tiền'
                            : ord.paymentStatus === 'REFUNDED'
                              ? 'Đã hoàn tiền'
                              : 'Chưa thanh toán'}
                      </p>
                    </td>
                    <td className="px-4 text-right font-bold tabular-nums text-[#0F172A]">
                      {formatVND(ord.totalAmount)}
                    </td>
                    <td className="px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${ORDER_STATUS_META[ord.status].badge}`}
                      >
                        {ORDER_STATUS_META[ord.status].label}
                      </span>
                    </td>
                    <td className="px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderDetail(ord)}
                        className="h-[32px] px-3 rounded-[9px] btn-glass text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Chi tiết / Xử lý</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.section>
        </>
      ) : (
        <motion.section
          variants={bentoItemVariants}
          className="w-full glass-card rounded-[16px] overflow-x-auto"
        >
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4 w-[135px]">Mã yêu cầu</th>
                <th className="px-4 w-[140px]">Đơn &amp; Khách hàng</th>
                <th className="px-4">Sản phẩm &amp; Lý do trả hàng</th>
                <th className="px-4 w-[125px] text-right">Giá trị dự kiến</th>
                <th className="px-4 w-[140px]">Trạng thái</th>
                <th className="px-4 w-[130px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {visibleReturns.map((req) => (
                <tr key={req.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[66px]">
                  <td className="px-4">
                    <p className="font-mono font-bold text-[#1D4ED8]">{req.code}</p>
                    <p className="text-[10.5px] text-[#64748B]">{req.createdAt}</p>
                  </td>
                  <td className="px-4">
                    <p className="font-mono font-semibold text-[#0F172A]">{req.orderCode}</p>
                    <p className="text-[11px] text-[#475569]">{req.customerName}</p>
                  </td>
                  <td className="px-4">
                    <p className="font-semibold text-[#0F172A]">
                      {req.productName}{' '}
                      <span className="font-mono text-[#2563EB]">
                        ({req.sku} × {req.requestedQty})
                      </span>
                    </p>
                    <p className="text-[11px] text-[#475569] mt-0.5">{req.reason}</p>
                    <p className="text-[10.5px] text-[#2563EB]">{req.evidenceNote}</p>
                  </td>
                  <td className="px-4 text-right font-bold tabular-nums text-[#0F172A]">
                    {formatVND(req.requestedQty * req.unitPrice)}
                  </td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        req.status === 'APPROVED_REFUNDED'
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : req.status === 'REJECTED'
                            ? 'bg-[#FEE2E2]/90 text-[#B91C1C] border-[#FECACA]'
                            : 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]'
                      }`}
                    >
                      {req.status === 'APPROVED_REFUNDED'
                        ? 'Đã hoàn tiền'
                        : req.status === 'REJECTED'
                          ? 'Đã từ chối'
                          : 'Chờ xử lý'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    {req.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => openReturnModal(req)}
                        className="h-[32px] px-3 rounded-[9px] btn-blue-glow text-[11px] font-bold cursor-pointer"
                      >
                        Xử lý trả hàng
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#64748B]">
                        {req.condition === 'RESTOCKABLE'
                          ? 'Đã nhập lại kho'
                          : req.condition === 'DAMAGED'
                            ? 'Hàng lỗi'
                            : req.rejectReason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.section>
      )}

      {/* Modal Chi tiết & Xử lý Đơn hàng (UC17, UC18, UC19) */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B1736]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EXPO_EASE } }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[680px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">
                    Đơn hàng {selectedOrder.code}
                  </h3>
                  <p className="text-[11.5px] text-[#475569]">
                    {selectedOrder.customerName} · {selectedOrder.customerPhone} ·{' '}
                    {getBranchLabel(selectedOrder.branchId)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 bg-white/95 max-h-[82vh] overflow-y-auto admin-scroll">
                {orderModalError && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{orderModalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                  <div className="p-3 rounded-[11px] bg-[#EFF6FF]/60 border border-[#DBEAFE]">
                    <p className="text-[10.5px] font-bold uppercase text-[#2563EB]">
                      Địa chỉ giao hàng
                    </p>
                    <p className="font-semibold text-[#0F172A] mt-1">
                      {selectedOrder.shippingAddress}
                    </p>
                    {selectedOrder.trackingCode && (
                      <p className="text-[11px] text-[#1D4ED8] mt-1 font-mono">
                        {selectedOrder.carrierName} · {selectedOrder.trackingCode}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-[11px] bg-[#EFF6FF]/60 border border-[#DBEAFE]">
                    <p className="text-[10.5px] font-bold uppercase text-[#2563EB]">
                      Trạng thái &amp; Thanh toán
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${ORDER_STATUS_META[selectedOrder.status].badge}`}
                      >
                        {ORDER_STATUS_META[selectedOrder.status].label}
                      </span>
                      <span className="font-semibold text-[#334155]">
                        {selectedOrder.paymentMethod} (
                        {selectedOrder.paymentStatus === 'PAID'
                          ? 'Đã thanh toán'
                          : selectedOrder.paymentStatus === 'REFUND_REQUIRED'
                            ? 'Cần hoàn tiền'
                            : 'Chưa thanh toán'}
                        )
                      </span>
                    </div>
                    {selectedOrder.cancelReason && (
                      <p className="text-[11px] text-[#DC2626] mt-1">
                        Lý do hủy: {selectedOrder.cancelReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border border-[#DBEAFE] rounded-[12px] overflow-hidden">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="bg-[#EFF6FF] border-b border-[#DBEAFE] text-left text-[11.5px] font-bold text-[#1E3A8A] h-[36px]">
                        <th className="px-3">Sản phẩm</th>
                        <th className="px-3 w-[65px] text-right">SL</th>
                        <th className="px-3 w-[125px] text-right">Đơn giá</th>
                        <th className="px-3 w-[125px] text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFF6FF]">
                      {selectedOrder.items.map((it) => (
                        <tr key={it.sku} className="h-[46px]">
                          <td className="px-3">
                            <p className="font-semibold text-[#0F172A]">{it.productName}</p>
                            <p className="text-[10.5px] font-mono text-[#64748B]">
                              {it.sku} · {it.variantLabel}
                            </p>
                          </td>
                          <td className="px-3 text-right font-bold tabular-nums">
                            {it.quantity}
                          </td>
                          <td className="px-3 text-right tabular-nums">
                            {formatVND(it.unitPrice)}
                          </td>
                          <td className="px-3 text-right font-bold tabular-nums">
                            {formatVND(it.quantity * it.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Shipping carrier input when preparing */}
                {selectedOrder.status === 'PREPARING' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[12px] bg-[#EFF6FF]/70 border border-[#BFDBFE]">
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#0F172A] mb-1">
                        Đơn vị vận chuyển
                      </label>
                      <input
                        type="text"
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        className="w-full h-[34px] px-2.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[12px] outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#0F172A] mb-1">
                        Mã vận đơn
                      </label>
                      <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="w-full h-[34px] px-2.5 rounded-[8px] border border-[#CBD5E1] bg-white font-mono text-[12px] outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                )}

                {/* Cancel reason inline form (UC19) */}
                {showCancelForm && (
                  <form
                    onSubmit={handleCancelOrder}
                    className="p-3.5 rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] space-y-2.5"
                  >
                    <label className="block text-[12px] font-bold text-[#991B1B]">
                      Nhập lý do hủy đơn hàng <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="VD: Khách yêu cầu đổi địa chỉ / hủy đơn..."
                      className="w-full h-[34px] px-3 rounded-[8px] border border-[#FCA5A5] bg-white text-[12px] outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCancelForm(false)}
                        className="h-[30px] px-3 rounded-[8px] bg-white border border-[#CBD5E1] text-[11.5px] font-semibold cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        className="h-[30px] px-3.5 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11.5px] font-bold cursor-pointer"
                      >
                        Xác nhận hủy &amp; Giải phóng tồn
                      </button>
                    </div>
                  </form>
                )}

                {/* Sequential Action Buttons (UC17 + UC18 + UC19) */}
                <div className="pt-3 border-t border-[#DBEAFE] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    {selectedOrder.status !== 'SHIPPING' &&
                      selectedOrder.status !== 'DELIVERED' &&
                      selectedOrder.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => setShowCancelForm((prev) => !prev)}
                          className="h-[34px] px-3.5 rounded-[10px] bg-white border border-[#FECACA] hover:bg-[#FEF2F2] text-[#DC2626] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Hủy đơn hàng</span>
                        </button>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrder.status === 'PENDING_CONFIRM' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('CONFIRMED')}
                        className="h-[34px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                      >
                        Xác nhận đơn hàng
                      </button>
                    )}
                    {selectedOrder.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('PREPARING')}
                        className="h-[34px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                      >
                        Chuyển Đang chuẩn bị hàng
                      </button>
                    )}
                    {selectedOrder.status === 'PREPARING' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('HANDED_TO_CARRIER')}
                        className="h-[34px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Bàn giao ĐVVC</span>
                      </button>
                    )}
                    {selectedOrder.status === 'HANDED_TO_CARRIER' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('SHIPPING')}
                        className="h-[34px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                      >
                        Cập nhật Đang giao
                      </button>
                    )}
                    {selectedOrder.status === 'SHIPPING' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('DELIVERED')}
                        className="h-[34px] px-4 rounded-[10px] bg-[#16A34A] hover:bg-[#15803D] text-white text-[12px] font-bold cursor-pointer shadow-[0_4px_12px_rgba(22,163,74,0.35)]"
                      >
                        Xác nhận Giao thành công
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Xử lý Trả hàng & Hoàn tiền 3 bước (UC24) */}
      <AnimatePresence>
        {selectedReturn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B1736]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EXPO_EASE } }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[580px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">
                    Xử lý Trả hàng &amp; Hoàn tiền — {selectedReturn.code}
                  </h3>
                  <p className="text-[11.5px] text-[#475569]">
                    Đơn {selectedReturn.orderCode} · Khách: {selectedReturn.customerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProcessReturn} className="p-5 space-y-4 bg-white/95">
                {returnErr && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{returnErr}</span>
                  </div>
                )}

                <div className="p-3 rounded-[11px] bg-[#EFF6FF]/70 border border-[#DBEAFE] text-[12px]">
                  <p className="font-bold text-[#0F172A]">
                    {selectedReturn.productName} ({selectedReturn.sku})
                  </p>
                  <p className="text-[#475569] mt-0.5">
                    Đã mua: <strong>{selectedReturn.purchasedQty}</strong> · Yêu cầu trả:{' '}
                    <strong>{selectedReturn.requestedQty}</strong> · Đơn giá:{' '}
                    <strong>{formatVND(selectedReturn.unitPrice)}</strong>
                  </p>
                  <p className="text-[#334155] mt-1">
                    Lý do: <em>{selectedReturn.reason}</em>
                  </p>
                </div>

                {/* Decision Switch */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReturnMode('approve')}
                    className={`h-[38px] rounded-[10px] border text-[12px] font-bold cursor-pointer transition-all ${
                      returnMode === 'approve'
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] shadow-[0_0_0_2px_rgba(37,99,235,0.15)]'
                        : 'bg-white border-[#CBD5E1] text-[#475569]'
                    }`}
                  >
                    Chấp thuận &amp; Hoàn tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnMode('reject')}
                    className={`h-[38px] rounded-[10px] border text-[12px] font-bold cursor-pointer transition-all ${
                      returnMode === 'reject'
                        ? 'bg-[#FEF2F2] border-[#DC2626] text-[#B91C1C]'
                        : 'bg-white border-[#CBD5E1] text-[#475569]'
                    }`}
                  >
                    Từ chối yêu cầu
                  </button>
                </div>

                {returnMode === 'approve' ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                        Bước 1: Số lượng thực tế nhận lại (tối đa {selectedReturn.purchasedQty})
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={selectedReturn.purchasedQty}
                        value={receivedQty}
                        onChange={(e) => {
                          setReceivedQty(e.target.value);
                          setReturnErr(null);
                        }}
                        className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] tabular-nums font-bold outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                        Bước 2: Tình trạng sản phẩm nhận lại
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-start gap-2.5 p-2.5 rounded-[10px] border border-[#DBEAFE] bg-[#EFF6FF]/40 cursor-pointer">
                          <input
                            type="radio"
                            name="returnCond"
                            checked={returnCondition === 'RESTOCKABLE'}
                            onChange={() => setReturnCondition('RESTOCKABLE')}
                            className="mt-0.5 accent-[#2563EB]"
                          />
                          <div className="text-[12px]">
                            <p className="font-bold text-[#0F172A]">
                              Đủ điều kiện nhập lại kho
                            </p>
                            <p className="text-[11px] text-[#475569]">
                              Hệ thống tự động cộng lại số lượng vào tồn kho bán của chi nhánh.
                            </p>
                          </div>
                        </label>
                        <label className="flex items-start gap-2.5 p-2.5 rounded-[10px] border border-[#E2E8F0] bg-white cursor-pointer">
                          <input
                            type="radio"
                            name="returnCond"
                            checked={returnCondition === 'DAMAGED'}
                            onChange={() => setReturnCondition('DAMAGED')}
                            className="mt-0.5 accent-[#2563EB]"
                          />
                          <div className="text-[12px]">
                            <p className="font-bold text-[#0F172A]">
                              Hư hỏng / Không đủ điều kiện nhập kho
                            </p>
                            <p className="text-[11px] text-[#475569]">
                              Chỉ ghi nhận hàng lỗi, không cộng vào tồn kho bán.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-3 rounded-[10px] bg-[#DCFCE7]/60 border border-[#BBF7D0] flex items-center justify-between text-[12px]">
                      <span className="font-bold text-[#15803D]">
                        Bước 3: Số tiền hoàn trả cho khách
                      </span>
                      <span className="text-[15px] font-extrabold text-[#15803D] tabular-nums">
                        {formatVND(
                          Math.max(0, Number(receivedQty) || 0) *
                            selectedReturn.unitPrice
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Lý do từ chối trả hàng
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="VD: Sản phẩm đã qua sử dụng, không còn tem mác..."
                      className="w-full p-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none resize-none focus:border-[#2563EB]"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReturn(null)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className={`h-[36px] px-4 rounded-[10px] text-[12px] font-bold cursor-pointer ${
                      returnMode === 'approve'
                        ? 'btn-blue-glow'
                        : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                    }`}
                  >
                    {returnMode === 'approve'
                      ? 'Xác nhận hoàn tiền'
                      : 'Xác nhận từ chối'}
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
