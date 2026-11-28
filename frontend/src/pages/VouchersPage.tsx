import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  Search,
  TicketPercent,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { DiscountType, VoucherItem } from '../types/dashboard';
import { formatDateVN, formatVND } from '../utils/format';
import { SelectField } from '../components/ui/SelectField';
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
} from '../components/ui/MotionPrimitives';

export function VouchersPage() {
  const { vouchers, addVoucher, updateVoucher, toggleVoucherStatus } =
    useAdminContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<VoucherItem | null>(null);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENT');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('300000');
  const [maxDiscount, setMaxDiscount] = useState('150000');
  const [startDate, setStartDate] = useState('2026-11-19');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const openCreate = () => {
    setEditing(null);
    setCode('');
    setTitle('');
    setDiscountType('PERCENT');
    setDiscountValue('10');
    setMinOrderValue('300000');
    setMaxDiscount('150000');
    setStartDate('2026-11-19');
    setEndDate('2026-12-31');
    setUsageLimit('100');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (v: VoucherItem) => {
    setEditing(v);
    setCode(v.code);
    setTitle(v.title);
    setDiscountType(v.discountType);
    setDiscountValue(String(v.discountValue));
    setMinOrderValue(String(v.minOrderValue));
    setMaxDiscount(v.maxDiscount ? String(v.maxDiscount) : '');
    setStartDate(v.startDate);
    setEndDate(v.endDate);
    setUsageLimit(String(v.usageLimit));
    setIsActive(v.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Vui lòng nhập mã giảm giá.');
      return;
    }
    if (
      vouchers.some(
        (v) => v.code.toUpperCase() === cleanCode && v.id !== editing?.id
      )
    ) {
      setFormError(`Mã giảm giá "${cleanCode}" đã tồn tại trong hệ thống.`);
      return;
    }
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên chương trình khuyến mãi.');
      return;
    }
    const valNum = Number(discountValue);
    if (!valNum || valNum <= 0) {
      setFormError('Giá trị giảm phải lớn hơn 0.');
      return;
    }
    if (discountType === 'PERCENT' && valNum > 100) {
      setFormError('Giá trị giảm theo phần trăm không được vượt quá 100%.');
      return;
    }
    if (!startDate || !endDate || endDate < startDate) {
      setFormError('Thời gian áp dụng không hợp lệ: Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
      return;
    }

    const payload = {
      code: cleanCode,
      title: title.trim(),
      discountType,
      discountValue: valNum,
      minOrderValue: Math.max(0, Number(minOrderValue) || 0),
      maxDiscount:
        discountType === 'PERCENT' && Number(maxDiscount) > 0
          ? Number(maxDiscount)
          : undefined,
      startDate,
      endDate,
      usageLimit: Math.max(1, Number(usageLimit) || 100),
      isActive,
    };

    if (editing) {
      updateVoucher(editing.id, payload);
      showToast(`Đã cập nhật mã giảm giá "${cleanCode}".`);
    } else {
      addVoucher(payload);
      showToast(`Đã tạo mã giảm giá mới "${cleanCode}".`);
    }
    setIsModalOpen(false);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vouchers.filter((v) => {
      if (statusFilter === 'active' && !v.isActive) return false;
      if (statusFilter === 'inactive' && v.isActive) return false;
      if (q) {
        return (
          v.code.toLowerCase().includes(q) || v.title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vouchers, searchQuery, statusFilter]);

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
            Quản lý Mã giảm giá &amp; Khuyến mãi
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Tạo mã giảm giá theo phần trăm hoặc số tiền cố định, thiết lập điều kiện đơn tối thiểu và thời gian hiệu lực
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo mã giảm giá</span>
        </button>
      </motion.section>

      {/* Filter Bar */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[54px] glass-card rounded-[16px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 relative z-20"
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="w-full sm:w-[300px] h-[34px] rounded-[10px] border border-[#CBD5E1] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] px-3 flex items-center gap-2 bg-white/90">
            <Search className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã code hoặc tên chương trình..."
              className="w-full bg-transparent text-[12px] text-[#0F172A] outline-none"
            />
          </div>

          <SelectField
            value={statusFilter}
            onChange={(val) =>
              setStatusFilter(val as 'all' | 'active' | 'inactive')
            }
            className="w-[180px]"
            heightClass="h-[34px]"
            options={[
              { value: 'all', label: 'Trạng thái: Tất cả' },
              { value: 'active', label: 'Đang áp dụng' },
              { value: 'inactive', label: 'Ngừng áp dụng' },
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

      {/* Vouchers Table */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full glass-card rounded-[16px] overflow-x-auto"
      >
        {filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center">
            <TicketPercent className="w-10 h-10 text-[#3B82F6] mb-2" />
            <p className="text-[14px] font-bold text-[#0F172A]">
              Chưa có mã giảm giá nào phù hợp
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4 w-[130px]">Mã Code</th>
                <th className="px-4">Chương trình</th>
                <th className="px-4 w-[145px]">Mức giảm</th>
                <th className="px-4 w-[140px]">Đơn tối thiểu</th>
                <th className="px-4 w-[175px]">Thời gian áp dụng</th>
                <th className="px-4 w-[95px] text-right">Đã dùng</th>
                <th className="px-4 w-[125px]">Trạng thái</th>
                <th className="px-4 w-[124px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[58px]">
                  <td className="px-4">
                    <span className="px-2.5 py-1 rounded-[7px] bg-[#EFF6FF] border border-[#BFDBFE] font-mono font-bold text-[#1D4ED8] text-[11.5px]">
                      {v.code}
                    </span>
                  </td>
                  <td className="px-4 font-semibold text-[#0F172A]">{v.title}</td>
                  <td className="px-4 font-bold text-[#2563EB] tabular-nums">
                    {v.discountType === 'PERCENT'
                      ? `${v.discountValue}%${
                          v.maxDiscount ? ` (tối đa ${formatVND(v.maxDiscount)})` : ''
                        }`
                      : formatVND(v.discountValue)}
                  </td>
                  <td className="px-4 text-[#334155] tabular-nums">
                    {formatVND(v.minOrderValue)}
                  </td>
                  <td className="px-4 text-[#475569] tabular-nums text-[11.5px]">
                    {formatDateVN(v.startDate)} – {formatDateVN(v.endDate)}
                  </td>
                  <td className="px-4 text-right font-semibold tabular-nums text-[#0F172A]">
                    {v.usedCount}/{v.usageLimit}
                  </td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        v.isActive
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                      }`}
                    >
                      {v.isActive ? 'Đang áp dụng' : 'Tạm ngừng'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        className="h-[30px] px-2.5 rounded-[8px] btn-glass text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#2563EB]" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleVoucherStatus(v.id);
                          showToast(`Đã cập nhật trạng thái mã "${v.code}".`);
                        }}
                        className="h-[30px] px-2 rounded-[8px] btn-glass text-[#475569] inline-flex items-center cursor-pointer"
                        title="Bật/tắt mã giảm giá"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.section>

      {/* Modal Create / Edit Voucher */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="w-full max-w-[640px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  {editing ? 'Chỉnh sửa Mã giảm giá' : 'Tạo mới Mã giảm giá'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white/95">
                {formError && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Mã Code <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="VD: BLACKFRIDAY20"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] font-mono uppercase text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Tên chương trình <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="Giảm 20% dịp lễ..."
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Loại giảm giá
                    </label>
                    <SelectField
                      value={discountType}
                      onChange={(v) => setDiscountType(v as DiscountType)}
                      heightClass="h-[36px]"
                      options={[
                        { value: 'PERCENT', label: 'Phần trăm (%)' },
                        { value: 'FIXED', label: 'Số tiền cố định (VNĐ)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Giá trị giảm <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] tabular-nums outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Đơn tối thiểu (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] tabular-nums outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Ngày bắt đầu <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setFormError(null);
                      }}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Ngày kết thúc <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setFormError(null);
                      }}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Giới hạn lượt dùng
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] tabular-nums outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DBEAFE] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Lưu mã giảm giá
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
