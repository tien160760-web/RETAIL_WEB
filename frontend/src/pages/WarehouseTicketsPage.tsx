import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ClipboardEdit,
  Plus,
  Truck,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { formatNumber } from '../utils/format';
import { SelectField } from '../components/ui/SelectField';
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
  SPRING_PILL,
} from '../components/ui/MotionPrimitives';

const ADJUSTMENT_REASONS = [
  'Hàng lỗi sản xuất / rách hỏng',
  'Thất thoát trong quá trình lưu kho',
  'Kiểm đếm thực tế dư so với sổ sách',
  'Nhầm lẫn khi xuất/nhập hàng',
];

export function WarehouseTicketsPage() {
  const {
    role,
    selectedBranchId,
    branches,
    inventoryLevels,
    stockTransfers,
    createStockTransfer,
    approveTransferDispatch,
    confirmTransferReceipt,
    adjustments,
    createAdjustment,
    reviewAdjustment,
    getBranchLabel,
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState<'transfers' | 'adjustments'>('transfers');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Create Transfer modal (UC11)
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromBranchId, setFromBranchId] = useState(
    selectedBranchId === 'all' ? 'cn-hn' : selectedBranchId
  );
  const [toBranchId, setToBranchId] = useState(
    selectedBranchId === 'cn-dn' ? 'cn-hn' : 'cn-dn'
  );
  const [transferSku, setTransferSku] = useState('APL-DEN-L');
  const [transferQty, setTransferQty] = useState('5');
  const [transferNote, setTransferNote] = useState('');
  const [transferErr, setTransferErr] = useState<string | null>(null);

  // Create Adjustment modal (UC12)
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [adjBranchId, setAdjBranchId] = useState(
    selectedBranchId === 'all' ? 'cn-hn' : selectedBranchId
  );
  const [adjSku, setAdjSku] = useState('APL-DEN-L');
  const [adjActualQty, setAdjActualQty] = useState('');
  const [adjReason, setAdjReason] = useState(ADJUSTMENT_REASONS[0]);
  const [adjErr, setAdjErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setActionError(null);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const activeBranches = useMemo(
    () => branches.filter((b) => b.isActive),
    [branches]
  );

  const sourceInventory = useMemo(
    () => inventoryLevels.filter((i) => i.branchId === fromBranchId),
    [inventoryLevels, fromBranchId]
  );

  const selectedTransferStock = useMemo(
    () => sourceInventory.find((i) => i.sku === transferSku),
    [sourceInventory, transferSku]
  );

  const adjBranchInventory = useMemo(
    () => inventoryLevels.filter((i) => i.branchId === adjBranchId),
    [inventoryLevels, adjBranchId]
  );

  const selectedAdjStock = useMemo(
    () => adjBranchInventory.find((i) => i.sku === adjSku),
    [adjBranchInventory, adjSku]
  );

  const visibleTransfers = useMemo(() => {
    if (selectedBranchId === 'all') return stockTransfers;
    return stockTransfers.filter(
      (t) => t.fromBranchId === selectedBranchId || t.toBranchId === selectedBranchId
    );
  }, [stockTransfers, selectedBranchId]);

  const visibleAdjustments = useMemo(() => {
    if (selectedBranchId === 'all') return adjustments;
    return adjustments.filter((a) => a.branchId === selectedBranchId);
  }, [adjustments, selectedBranchId]);

  const openCreateTransfer = () => {
    const defFrom = selectedBranchId === 'all' ? 'cn-hn' : selectedBranchId;
    const defTo = activeBranches.find((b) => b.id !== defFrom)?.id ?? 'cn-dn';
    setFromBranchId(defFrom);
    setToBranchId(defTo);
    const firstInv = inventoryLevels.find((i) => i.branchId === defFrom);
    setTransferSku(firstInv?.sku ?? 'APL-DEN-L');
    setTransferQty('5');
    setTransferNote('');
    setTransferErr(null);
    setIsTransferOpen(true);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferErr(null);
    const stock = inventoryLevels.find(
      (i) => i.branchId === fromBranchId && i.sku === transferSku
    );
    const res = createStockTransfer({
      fromBranchId,
      toBranchId,
      note: transferNote,
      items: [
        {
          sku: transferSku,
          productName: stock?.productName ?? transferSku,
          variantLabel: stock?.variantLabel ?? '',
          quantity: Number(transferQty),
        },
      ],
    });
    if (!res.ok) {
      setTransferErr(res.error ?? 'Không thể tạo phiếu điều chuyển.');
      return;
    }
    setIsTransferOpen(false);
    showToast('Đã tạo phiếu yêu cầu điều chuyển kho (Chờ duyệt xuất hàng).');
  };

  const openCreateAdj = () => {
    const defBranch = selectedBranchId === 'all' ? 'cn-hn' : selectedBranchId;
    setAdjBranchId(defBranch);
    const firstInv = inventoryLevels.find((i) => i.branchId === defBranch);
    setAdjSku(firstInv?.sku ?? 'APL-DEN-L');
    setAdjActualQty(firstInv ? String(firstInv.onHand) : '0');
    setAdjReason(ADJUSTMENT_REASONS[0]);
    setAdjErr(null);
    setIsAdjOpen(true);
  };

  const handleSubmitAdj = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjErr(null);
    const res = createAdjustment({
      branchId: adjBranchId,
      sku: adjSku,
      actualQty: Number(adjActualQty),
      reason: adjReason,
    });
    if (!res.ok) {
      setAdjErr(res.error ?? 'Không thể tạo phiếu kiểm kê.');
      return;
    }
    setIsAdjOpen(false);
    showToast('Đã tạo phiếu kiểm kê điều chỉnh tồn kho (Chờ Quản lý phê duyệt).');
  };

  const canApprove = role === 'ADMIN' || role === 'BRANCH_MANAGER';

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
            Điều chuyển kho &amp; Kiểm kê tồn kho
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Luân chuyển hàng hóa giữa các chi nhánh và kiểm kê đối chiếu, điều chỉnh chênh lệch tồn kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateAdj}
            className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardEdit className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Tạo phiếu kiểm kê</span>
          </button>
          <button
            type="button"
            onClick={openCreateTransfer}
            className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phiếu điều chuyển</span>
          </button>
        </div>
      </motion.section>

      {actionError && (
        <div className="w-full rounded-[12px] bg-[#FEF2F2] border border-[#FCA5A5] px-4 py-2.5 flex items-center justify-between text-[12px] text-[#991B1B]">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <motion.div
        variants={bentoItemVariants}
        className="inline-flex items-center gap-1 p-1 rounded-[12px] glass-card"
      >
        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'transfers' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'transfers' && (
            <motion.div
              layoutId="warehouse-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <ArrowLeftRight className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Phiếu Điều chuyển chi nhánh ({visibleTransfers.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adjustments')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'adjustments' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'adjustments' && (
            <motion.div
              layoutId="warehouse-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <ClipboardEdit className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Phiếu Kiểm kê &amp; Điều chỉnh ({visibleAdjustments.length})
          </span>
        </button>
      </motion.div>

      {/* Content Table */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full glass-card rounded-[16px] overflow-x-auto"
      >
        {activeTab === 'transfers' ? (
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4 w-[130px]">Mã phiếu</th>
                <th className="px-4 w-[240px]">Tuyến điều chuyển</th>
                <th className="px-4">Sản phẩm &amp; Số lượng</th>
                <th className="px-4 w-[140px]">Trạng thái</th>
                <th className="px-4 w-[180px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {visibleTransfers.map((trf) => (
                <tr key={trf.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[64px]">
                  <td className="px-4">
                    <p className="font-mono font-bold text-[#1D4ED8]">{trf.code}</p>
                    <p className="text-[10.5px] text-[#64748B]">{trf.createdAt}</p>
                  </td>
                  <td className="px-4">
                    <p className="font-semibold text-[#0F172A]">
                      {getBranchLabel(trf.fromBranchId)}
                    </p>
                    <p className="text-[11px] text-[#2563EB] font-medium">
                      → {getBranchLabel(trf.toBranchId)}
                    </p>
                  </td>
                  <td className="px-4">
                    {trf.items.map((it) => (
                      <p key={it.sku} className="text-[#0F172A]">
                        <span className="font-mono font-bold text-[#1E3A8A]">
                          {it.sku}
                        </span>{' '}
                        · {it.productName} —{' '}
                        <strong className="text-[#2563EB]">×{it.quantity}</strong>
                      </p>
                    ))}
                    {trf.note && (
                      <p className="text-[11px] text-[#64748B] mt-0.5">{trf.note}</p>
                    )}
                  </td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        trf.status === 'COMPLETED'
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : trf.status === 'IN_TRANSIT'
                            ? 'bg-[#DBEAFE]/90 text-[#1D4ED8] border-[#93C5FD]'
                            : 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]'
                      }`}
                    >
                      {trf.status === 'COMPLETED'
                        ? 'Hoàn tất'
                        : trf.status === 'IN_TRANSIT'
                          ? 'Đang vận chuyển'
                          : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    {trf.status === 'PENDING_APPROVAL' && (
                      <button
                        type="button"
                        disabled={!canApprove}
                        title={
                          canApprove
                            ? 'Duyệt xuất hàng & trừ tồn chi nhánh xuất'
                            : 'Chỉ Quản lý chi nhánh hoặc Admin mới có quyền duyệt xuất'
                        }
                        onClick={() => {
                          const res = approveTransferDispatch(trf.id);
                          if (!res.ok) {
                            setActionError(res.error ?? 'Lỗi duyệt xuất hàng.');
                          } else {
                            showToast(
                              `Đã duyệt xuất ${trf.code}. Trừ tồn kho xuất và chuyển sang Đang vận chuyển.`
                            );
                          }
                        }}
                        className="h-[32px] px-3 rounded-[9px] btn-blue-glow disabled:opacity-45 disabled:cursor-not-allowed text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Duyệt xuất hàng</span>
                      </button>
                    )}

                    {trf.status === 'IN_TRANSIT' && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = confirmTransferReceipt(trf.id);
                          if (!res.ok) {
                            setActionError(res.error ?? 'Lỗi xác nhận nhận hàng.');
                          } else {
                            showToast(
                              `Đã xác nhận nhận hàng ${trf.code} và cộng tồn kho chi nhánh nhận.`
                            );
                          }
                        }}
                        className="h-[32px] px-3 rounded-[9px] bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-[0_4px_12px_rgba(22,163,74,0.35)] transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Xác nhận nhận hàng</span>
                      </button>
                    )}

                    {trf.status === 'COMPLETED' && (
                      <span className="text-[11px] text-[#15803D] font-semibold">
                        Đã nhập kho đích
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4 w-[125px]">Mã phiếu</th>
                <th className="px-4 w-[145px]">Chi nhánh</th>
                <th className="px-4">Sản phẩm &amp; Lý do</th>
                <th className="px-3 w-[85px] text-right">Hệ thống</th>
                <th className="px-3 w-[85px] text-right">Thực tế</th>
                <th className="px-3 w-[85px] text-right">Độ lệch</th>
                <th className="px-3 w-[125px]">Trạng thái</th>
                <th className="px-4 w-[165px] text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {visibleAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[64px]">
                  <td className="px-4">
                    <p className="font-mono font-bold text-[#1D4ED8]">{adj.code}</p>
                    <p className="text-[10.5px] text-[#64748B]">{adj.createdAt}</p>
                  </td>
                  <td className="px-4 font-medium text-[#334155]">
                    {getBranchLabel(adj.branchId)}
                  </td>
                  <td className="px-4">
                    <p className="font-semibold text-[#0F172A]">
                      <span className="font-mono text-[#1D4ED8]">{adj.sku}</span> ·{' '}
                      {adj.productName}
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{adj.reason}</p>
                  </td>
                  <td className="px-3 text-right tabular-nums text-[#475569]">
                    {formatNumber(adj.systemOnHand)}
                  </td>
                  <td className="px-3 text-right font-bold tabular-nums text-[#0F172A]">
                    {formatNumber(adj.actualQty)}
                  </td>
                  <td
                    className={`px-3 text-right font-extrabold tabular-nums ${
                      adj.delta > 0
                        ? 'text-[#15803D]'
                        : adj.delta < 0
                          ? 'text-[#DC2626]'
                          : 'text-[#64748B]'
                    }`}
                  >
                    {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                  </td>
                  <td className="px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        adj.status === 'APPROVED'
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : adj.status === 'REJECTED'
                            ? 'bg-[#FEE2E2]/90 text-[#B91C1C] border-[#FECACA]'
                            : 'bg-[#FEF3C7]/90 text-[#B45309] border-[#FDE68A]'
                      }`}
                    >
                      {adj.status === 'APPROVED'
                        ? 'Đã phê duyệt'
                        : adj.status === 'REJECTED'
                          ? 'Đã từ chối'
                          : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    {adj.status === 'PENDING_APPROVAL' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={!canApprove}
                          title={
                            canApprove
                              ? 'Phê duyệt và đồng bộ tồn kho'
                              : 'Chỉ Quản lý chi nhánh hoặc Admin mới có quyền phê duyệt'
                          }
                          onClick={() => {
                            const res = reviewAdjustment(adj.id, true);
                            if (!res.ok) {
                              setActionError(res.error ?? 'Lỗi phê duyệt kiểm kê.');
                            } else {
                              showToast(
                                `Đã phê duyệt ${adj.code} và đồng bộ tồn kho theo số lượng thực tế.`
                              );
                            }
                          }}
                          className="h-[30px] px-2.5 rounded-[8px] btn-blue-glow disabled:opacity-45 disabled:cursor-not-allowed text-[11px] font-bold cursor-pointer"
                        >
                          Phê duyệt
                        </button>
                        <button
                          type="button"
                          disabled={!canApprove}
                          onClick={() => {
                            reviewAdjustment(adj.id, false);
                            showToast(`Đã từ chối phiếu kiểm kê ${adj.code}.`);
                          }}
                          className="h-[30px] px-2.5 rounded-[8px] bg-white border border-[#FECACA] hover:bg-[#FEF2F2] disabled:opacity-45 disabled:cursor-not-allowed text-[11px] font-bold text-[#DC2626] cursor-pointer"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#64748B]">
                        {adj.reviewedBy}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.section>

      {/* Modal Create Transfer (UC11) */}
      <AnimatePresence>
        {isTransferOpen && (
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
              className="w-full max-w-[560px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  Tạo phiếu Điều chuyển hàng giữa các chi nhánh
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitTransfer} className="p-5 space-y-4 bg-white/95">
                {transferErr && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{transferErr}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Chi nhánh xuất hàng <span className="text-[#DC2626]">*</span>
                    </label>
                    <SelectField
                      value={fromBranchId}
                      onChange={(val) => {
                        setFromBranchId(val);
                        setTransferErr(null);
                      }}
                      heightClass="h-[36px]"
                      options={activeBranches.map((b) => ({
                        value: b.id,
                        label: b.name,
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Chi nhánh nhận hàng <span className="text-[#DC2626]">*</span>
                    </label>
                    <SelectField
                      value={toBranchId}
                      onChange={(val) => {
                        setToBranchId(val);
                        setTransferErr(null);
                      }}
                      heightClass="h-[36px]"
                      options={activeBranches.map((b) => ({
                        value: b.id,
                        label: b.name,
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Biến thể sản phẩm (SKU)
                    </label>
                    <SelectField
                      value={transferSku}
                      onChange={(val) => {
                        setTransferSku(val);
                        setTransferErr(null);
                      }}
                      heightClass="h-[36px]"
                      options={sourceInventory.map((i) => ({
                        value: i.sku,
                        label: `${i.sku} — ${i.productName} (Khả dụng: ${Math.max(0, i.onHand - i.reserved)})`,
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Số lượng chuyển <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={transferQty}
                      onChange={(e) => {
                        setTransferQty(e.target.value);
                        setTransferErr(null);
                      }}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] tabular-nums outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {selectedTransferStock && (
                  <p className="text-[11.5px] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-2 rounded-[9px]">
                    Tồn khả dụng tại {getBranchLabel(fromBranchId)}:{' '}
                    <strong>
                      {Math.max(
                        0,
                        selectedTransferStock.onHand - selectedTransferStock.reserved
                      )}{' '}
                      sản phẩm
                    </strong>{' '}
                    (Thực tế: {selectedTransferStock.onHand} · Đang giữ:{' '}
                    {selectedTransferStock.reserved})
                  </p>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                    Ghi chú điều chuyển
                  </label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="VD: Bổ sung hàng bán chạy cuối tuần..."
                    className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTransferOpen(false)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Tạo phiếu điều chuyển
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Create Adjustment (UC12) */}
      <AnimatePresence>
        {isAdjOpen && (
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
              className="w-full max-w-[560px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  Tạo phiếu Kiểm kê &amp; Điều chỉnh tồn kho
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAdjOpen(false)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdj} className="p-5 space-y-4 bg-white/95">
                {adjErr && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{adjErr}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Chi nhánh kiểm kê
                    </label>
                    <SelectField
                      value={adjBranchId}
                      disabled={role !== 'ADMIN'}
                      onChange={setAdjBranchId}
                      heightClass="h-[36px]"
                      options={activeBranches.map((b) => ({
                        value: b.id,
                        label: b.name,
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Biến thể SKU
                    </label>
                    <SelectField
                      value={adjSku}
                      onChange={(sku) => {
                        setAdjSku(sku);
                        const found = adjBranchInventory.find((i) => i.sku === sku);
                        if (found) setAdjActualQty(String(found.onHand));
                        setAdjErr(null);
                      }}
                      heightClass="h-[36px]"
                      options={adjBranchInventory.map((i) => ({
                        value: i.sku,
                        label: `${i.sku} — ${i.productName}`,
                      }))}
                    />
                  </div>
                </div>

                {selectedAdjStock && (
                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-[11px] bg-[#EFF6FF]/80 border border-[#DBEAFE] text-center">
                    <div>
                      <p className="text-[10.5px] text-[#64748B]">Tồn hệ thống</p>
                      <p className="text-[16px] font-extrabold text-[#0F172A] tabular-nums">
                        {selectedAdjStock.onHand}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] text-[#64748B]">Đang giữ đơn</p>
                      <p className="text-[16px] font-extrabold text-[#D97706] tabular-nums">
                        {selectedAdjStock.reserved}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] text-[#64748B]">Độ lệch dự kiến</p>
                      <p
                        className={`text-[16px] font-extrabold tabular-nums ${
                          Number(adjActualQty) - selectedAdjStock.onHand >= 0
                            ? 'text-[#15803D]'
                            : 'text-[#DC2626]'
                        }`}
                      >
                        {Number(adjActualQty) - selectedAdjStock.onHand > 0 ? '+' : ''}
                        {Number(adjActualQty) - selectedAdjStock.onHand}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                    Số lượng kiểm đếm thực tế <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    value={adjActualQty}
                    onChange={(e) => {
                      setAdjActualQty(e.target.value);
                      setAdjErr(null);
                    }}
                    className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] tabular-nums font-bold outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                    Lý do điều chỉnh <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    list="adj-reasons"
                    value={adjReason}
                    onChange={(e) => {
                      setAdjReason(e.target.value);
                      setAdjErr(null);
                    }}
                    placeholder="Ghi rõ lý do chênh lệch tồn kho..."
                    className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                  />
                  <datalist id="adj-reasons">
                    {ADJUSTMENT_REASONS.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjOpen(false)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Gửi phiếu chờ duyệt
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
