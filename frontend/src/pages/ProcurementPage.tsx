import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  PackagePlus,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { PurchaseOrder, PurchaseOrderLine } from '../types/dashboard';
import { formatDateVN, formatNumber, formatVND } from '../utils/format';
import { SelectField } from '../components/ui/SelectField';
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
  SPRING_PILL,
} from '../components/ui/MotionPrimitives';

export function ProcurementPage() {
  const {
    role,
    selectedBranchId,
    branches,
    suppliers,
    products,
    purchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    getBranchLabel,
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState<'po' | 'grn'>(
    role === 'WAREHOUSE_STAFF' ? 'grn' : 'po'
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Create PO modal state (UC08)
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive),
    [suppliers]
  );
  const allSkus = useMemo(
    () =>
      products.flatMap((p) =>
        p.variants.map((v) => ({
          sku: v.sku,
          productName: p.name,
          variantLabel: `${v.color} · ${v.size}`,
          defaultCost: Math.round(v.price * 0.6),
        }))
      ),
    [products]
  );

  const [poSupplierId, setPoSupplierId] = useState(activeSuppliers[0]?.id ?? '');
  const [poBranchId, setPoBranchId] = useState(
    selectedBranchId === 'all' ? branches[0]?.id ?? 'cn-hn' : selectedBranchId
  );
  const [poExpectedDate, setPoExpectedDate] = useState('2026-11-25');
  const [poLines, setPoLines] = useState<PurchaseOrderLine[]>([]);
  const [poError, setPoError] = useState<string | null>(null);

  // Receive GRN modal state (UC09)
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});
  const [grnError, setGrnError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const visibleOrders = useMemo(() => {
    if (selectedBranchId === 'all') return purchaseOrders;
    return purchaseOrders.filter((po) => po.branchId === selectedBranchId);
  }, [purchaseOrders, selectedBranchId]);

  const pendingReceiptOrders = useMemo(
    () => visibleOrders.filter((po) => po.status === 'PENDING_RECEIPT'),
    [visibleOrders]
  );

  const openCreatePo = () => {
    setPoSupplierId(activeSuppliers[0]?.id ?? '');
    setPoBranchId(
      selectedBranchId === 'all' ? branches[0]?.id ?? 'cn-hn' : selectedBranchId
    );
    setPoExpectedDate('2026-11-25');
    const firstSku = allSkus[0];
    setPoLines(
      firstSku
        ? [
            {
              sku: firstSku.sku,
              productName: firstSku.productName,
              variantLabel: firstSku.variantLabel,
              orderedQty: 20,
              unitCost: firstSku.defaultCost,
            },
          ]
        : []
    );
    setPoError(null);
    setIsPoModalOpen(true);
  };

  const addPoLine = () => {
    const candidate =
      allSkus.find((s) => !poLines.some((l) => l.sku === s.sku)) ?? allSkus[0];
    if (!candidate) return;
    setPoLines((prev) => [
      ...prev,
      {
        sku: candidate.sku,
        productName: candidate.productName,
        variantLabel: candidate.variantLabel,
        orderedQty: 10,
        unitCost: candidate.defaultCost,
      },
    ]);
  };

  const handleSavePo = (e: React.FormEvent) => {
    e.preventDefault();
    setPoError(null);
    if (!poSupplierId) {
      setPoError('Vui lòng chọn nhà cung cấp đang hoạt động.');
      return;
    }
    if (poLines.length === 0) {
      setPoError('Danh sách sản phẩm đặt nhập không được để trống.');
      return;
    }
    for (const line of poLines) {
      if (!line.orderedQty || line.orderedQty <= 0) {
        setPoError(`Số lượng đặt của ${line.sku} phải lớn hơn 0.`);
        return;
      }
      if (!line.unitCost || line.unitCost <= 0) {
        setPoError(`Đơn giá nhập của ${line.sku} phải lớn hơn 0.`);
        return;
      }
    }

    const created = createPurchaseOrder({
      supplierId: poSupplierId,
      branchId: poBranchId,
      expectedDate: poExpectedDate,
      items: poLines,
    });
    setIsPoModalOpen(false);
    showToast(`Đã lập đơn nhập hàng ${created.code} (Chờ nhận hàng).`);
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    const initialMap: Record<string, number> = {};
    po.items.forEach((it) => {
      initialMap[it.sku] = it.orderedQty;
    });
    setReceivingPo(po);
    setReceivedQtyMap(initialMap);
    setGrnError(null);
  };

  const handleConfirmGrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPo) return;
    setGrnError(null);
    const res = receivePurchaseOrder(receivingPo.id, receivedQtyMap);
    if (!res.ok) {
      setGrnError(res.error ?? 'Lỗi lập phiếu nhập kho.');
      return;
    }
    setReceivingPo(null);
    showToast(
      `Đã lập phiếu nhập ${res.receiptCode} và cập nhật tăng tồn kho chi nhánh.`
    );
  };

  const poGrandTotal = poLines.reduce(
    (s, line) => s + (line.orderedQty || 0) * (line.unitCost || 0),
    0
  );

  const canCreatePo = role === 'ADMIN' || role === 'BRANCH_MANAGER';

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
            Quản lý Nhập hàng (Đơn đặt hàng PO &amp; Phiếu nhập kho GRN)
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Lập đơn đặt hàng gửi nhà cung cấp, kiểm đếm thực nhận và tự động cộng tồn kho chi nhánh
          </p>
        </div>

        {canCreatePo && (
          <button
            type="button"
            onClick={openCreatePo}
            className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lập đơn nhập hàng (PO)</span>
          </button>
        )}
      </motion.section>

      {/* Tabs */}
      <motion.div
        variants={bentoItemVariants}
        className="inline-flex items-center gap-1 p-1 rounded-[12px] glass-card"
      >
        <button
          type="button"
          onClick={() => setActiveTab('po')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold transition-colors cursor-pointer ${
            activeTab === 'po' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'po' && (
            <motion.div
              layoutId="procurement-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <span className="relative z-10">
            Danh sách Đơn đặt hàng PO ({visibleOrders.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grn')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold transition-colors cursor-pointer ${
            activeTab === 'grn' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'grn' && (
            <motion.div
              layoutId="procurement-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <span className="relative z-10">
            Tiếp nhận &amp; Lập phiếu nhập kho ({pendingReceiptOrders.length} chờ nhận)
          </span>
        </button>
      </motion.div>

      {/* Table */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full glass-card rounded-[16px] overflow-x-auto"
      >
        <table className="w-full border-collapse min-w-[780px]">
          <thead>
            <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
              <th className="px-4 w-[135px]">Mã đơn PO</th>
              <th className="px-4">Nhà cung cấp</th>
              <th className="px-4 w-[165px]">Chi nhánh nhận</th>
              <th className="px-4 w-[115px]">Dự kiến giao</th>
              <th className="px-4 w-[140px] text-right">Tổng giá trị</th>
              <th className="px-4 w-[135px]">Trạng thái</th>
              <th className="px-4 w-[165px] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
            {(activeTab === 'po' ? visibleOrders : pendingReceiptOrders).map((po) => (
              <tr key={po.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[60px]">
                <td className="px-4">
                  <p className="font-mono font-bold text-[#1D4ED8]">{po.code}</p>
                  {po.receiptCode && (
                    <p className="text-[10.5px] font-mono text-[#15803D]">
                      {po.receiptCode}
                    </p>
                  )}
                </td>
                <td className="px-4">
                  <p className="font-semibold text-[#0F172A]">{po.supplierName}</p>
                  <p className="text-[11px] text-[#64748B]">
                    {po.items.length} mặt hàng · Tạo bởi {po.createdBy}
                  </p>
                </td>
                <td className="px-4 text-[#334155] font-medium">
                  {getBranchLabel(po.branchId)}
                </td>
                <td className="px-4 text-[#475569] tabular-nums">
                  {formatDateVN(po.expectedDate)}
                </td>
                <td className="px-4 text-right font-bold text-[#0F172A] tabular-nums">
                  {formatVND(po.totalAmount)}
                </td>
                <td className="px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                      po.status === 'RECEIVED'
                        ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                        : 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]'
                    }`}
                  >
                    {po.status === 'RECEIVED' ? 'Đã nhập kho' : 'Chờ nhận hàng'}
                  </span>
                </td>
                <td className="px-4 text-right">
                  {po.status === 'PENDING_RECEIPT' ? (
                    <button
                      type="button"
                      onClick={() => openReceiveModal(po)}
                      className="h-[32px] px-3 rounded-[9px] btn-blue-glow text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>Tiếp nhận &amp; Nhập kho</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#64748B]">
                      Đã nhận {po.receivedAt}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(activeTab === 'po' ? visibleOrders : pendingReceiptOrders).length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B]">
                  Không có đơn nhập hàng nào trong danh sách này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.section>

      {/* Modal Create PO (UC08) */}
      <AnimatePresence>
        {isPoModalOpen && (
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
              className="w-full max-w-[760px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-[#2563EB]" />
                  <span>Lập đơn đặt hàng nhập (PO)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePo} className="p-5 space-y-4 bg-white/95 max-h-[82vh] overflow-y-auto admin-scroll">
                {poError && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{poError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Nhà cung cấp <span className="text-[#DC2626]">*</span>
                    </label>
                    <SelectField
                      value={poSupplierId}
                      onChange={setPoSupplierId}
                      heightClass="h-[36px]"
                      options={activeSuppliers.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Chi nhánh nhận hàng <span className="text-[#DC2626]">*</span>
                    </label>
                    <SelectField
                      value={poBranchId}
                      disabled={role !== 'ADMIN'}
                      onChange={setPoBranchId}
                      heightClass="h-[36px]"
                      options={branches
                        .filter((b) => b.isActive)
                        .map((b) => ({ value: b.id, label: b.name }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Ngày dự kiến giao
                    </label>
                    <input
                      type="date"
                      value={poExpectedDate}
                      onChange={(e) => setPoExpectedDate(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-bold text-[#0F172A]">
                      Chi tiết mặt hàng đặt nhập
                    </p>
                    <button
                      type="button"
                      onClick={addPoLine}
                      className="h-[30px] px-3 rounded-[8px] bg-[#EFF6FF] border border-[#93C5FD] text-[11px] font-bold text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer hover:bg-[#DBEAFE]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm sản phẩm</span>
                    </button>
                  </div>

                  <div className="border border-[#DBEAFE] rounded-[12px] overflow-x-auto">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#EFF6FF] border-b border-[#DBEAFE] text-left text-[11.5px] font-bold text-[#1E3A8A] h-[36px]">
                          <th className="px-3">Biến thể SKU</th>
                          <th className="px-3 w-[95px]">Số lượng</th>
                          <th className="px-3 w-[140px]">Đơn giá nhập</th>
                          <th className="px-3 w-[135px] text-right">Thành tiền</th>
                          <th className="px-2 w-[50px]" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF6FF] text-[12px]">
                        {poLines.map((line, idx) => (
                          <tr key={`${line.sku}-${idx}`} className="h-[48px]">
                            <td className="px-3">
                              <select
                                value={line.sku}
                                onChange={(e) => {
                                  const found = allSkus.find(
                                    (s) => s.sku === e.target.value
                                  );
                                  if (!found) return;
                                  setPoLines((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? {
                                            ...item,
                                            sku: found.sku,
                                            productName: found.productName,
                                            variantLabel: found.variantLabel,
                                            unitCost: found.defaultCost,
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full h-[32px] px-2 rounded-[8px] border border-[#CBD5E1] text-[12px] bg-white outline-none focus:border-[#2563EB]"
                              >
                                {allSkus.map((s) => (
                                  <option key={s.sku} value={s.sku}>
                                    {s.sku} — {s.productName} ({s.variantLabel})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3">
                              <input
                                type="number"
                                min={1}
                                value={line.orderedQty}
                                onChange={(e) =>
                                  setPoLines((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, orderedQty: Number(e.target.value) }
                                        : item
                                    )
                                  )
                                }
                                className="w-full h-[32px] px-2 rounded-[8px] border border-[#CBD5E1] text-[12px] tabular-nums outline-none focus:border-[#2563EB]"
                              />
                            </td>
                            <td className="px-3">
                              <input
                                type="number"
                                min={1000}
                                step={10000}
                                value={line.unitCost}
                                onChange={(e) =>
                                  setPoLines((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, unitCost: Number(e.target.value) }
                                        : item
                                    )
                                  )
                                }
                                className="w-full h-[32px] px-2 rounded-[8px] border border-[#CBD5E1] text-[12px] tabular-nums outline-none focus:border-[#2563EB]"
                              />
                            </td>
                            <td className="px-3 text-right font-bold text-[#0F172A] tabular-nums">
                              {formatVND((line.orderedQty || 0) * (line.unitCost || 0))}
                            </td>
                            <td className="px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setPoLines((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-[#DC2626] hover:bg-[#FEF2F2] p-1.5 rounded-[6px] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-[#EFF6FF]/80 border border-[#DBEAFE]">
                    <span className="text-[12px] font-bold text-[#1E3A8A]">
                      Tổng giá trị đơn nhập dự kiến
                    </span>
                    <span className="text-[16px] font-extrabold text-[#1D4ED8] tabular-nums">
                      {formatVND(poGrandTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Xác nhận tạo đơn nhập
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Receive GRN (UC09) */}
      <AnimatePresence>
        {receivingPo && (
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
                    Tiếp nhận hàng &amp; Lập phiếu nhập kho — {receivingPo.code}
                  </h3>
                  <p className="text-[11.5px] text-[#475569]">
                    {receivingPo.supplierName} · {getBranchLabel(receivingPo.branchId)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReceivingPo(null)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmGrn} className="p-5 space-y-4 bg-white/95">
                {grnError && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{grnError}</span>
                  </div>
                )}

                <div className="border border-[#DBEAFE] rounded-[12px] overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#EFF6FF] border-b border-[#DBEAFE] text-left text-[11.5px] font-bold text-[#1E3A8A] h-[38px]">
                        <th className="px-3">Biến thể (SKU)</th>
                        <th className="px-3 w-[90px] text-right">SL đặt</th>
                        <th className="px-3 w-[135px]">SL thực nhận</th>
                        <th className="px-3 w-[95px] text-right">Chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFF6FF] text-[12px]">
                      {receivingPo.items.map((item) => {
                        const actual = receivedQtyMap[item.sku] ?? 0;
                        const diff = actual - item.orderedQty;
                        return (
                          <tr key={item.sku} className="h-[52px]">
                            <td className="px-3">
                              <p className="font-semibold text-[#0F172A]">
                                {item.productName}
                              </p>
                              <p className="text-[10.5px] font-mono text-[#64748B]">
                                {item.sku} · {item.variantLabel}
                              </p>
                            </td>
                            <td className="px-3 text-right font-bold tabular-nums text-[#334155]">
                              {formatNumber(item.orderedQty)}
                            </td>
                            <td className="px-3">
                              <input
                                type="number"
                                value={actual}
                                onChange={(e) => {
                                  setGrnError(null);
                                  setReceivedQtyMap((prev) => ({
                                    ...prev,
                                    [item.sku]: Number(e.target.value),
                                  }));
                                }}
                                className="w-full h-[34px] px-2.5 rounded-[8px] border border-[#CBD5E1] text-[12px] tabular-nums font-bold outline-none focus:border-[#2563EB]"
                              />
                            </td>
                            <td
                              className={`px-3 text-right font-bold tabular-nums ${
                                diff === 0
                                  ? 'text-[#15803D]'
                                  : diff < 0
                                    ? 'text-[#D97706]'
                                    : 'text-[#DC2626]'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReceivingPo(null)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Hoàn tất nhập kho &amp; Cộng tồn
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
