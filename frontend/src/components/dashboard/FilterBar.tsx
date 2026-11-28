import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, Lock, AlertCircle, Check } from 'lucide-react';
import { BRANCHES, CATEGORIES, PAYMENT_METHODS } from '../../data/mockDashboardData';
import {
  BranchId,
  CategoryId,
  DashboardFilters,
  PaymentMethod,
  TimePreset,
} from '../../types/dashboard';
import { formatDateVN, getPresetDateRange } from '../../utils/format';
import { bentoItemVariants, EXPO_EASE, SPRING_PILL } from '../ui/MotionPrimitives';

interface FilterBarProps {
  filters: DashboardFilters;
  isBranchLocked: boolean;
  onChangeFilters: (next: DashboardFilters) => void;
}

const TIME_BUTTONS: { id: Exclude<TimePreset, 'custom'>; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'month', label: 'Tháng này' },
];

type OpenDropdown = 'date' | 'branch' | 'category' | 'payment' | null;

const popoverAnim = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: EXPO_EASE } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } },
};

export function FilterBar({
  filters,
  isBranchLocked,
  onChangeFilters,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [draftStart, setDraftStart] = useState(filters.startDate);
  const [draftEnd, setDraftEnd] = useState(filters.endDate);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDraftStart(filters.startDate);
    setDraftEnd(filters.endDate);
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isDateInvalid = draftStart > draftEnd;

  const handleSelectPreset = (preset: Exclude<TimePreset, 'custom'>) => {
    const range = getPresetDateRange(preset);
    setOpenDropdown(null);
    onChangeFilters({
      ...filters,
      timePreset: preset,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  };

  const handleApplyDateRange = () => {
    if (isDateInvalid || !draftStart || !draftEnd) return;
    onChangeFilters({
      ...filters,
      timePreset: 'custom',
      startDate: draftStart,
      endDate: draftEnd,
    });
    setOpenDropdown(null);
  };

  const activeBranchLabel =
    filters.branchId === 'all'
      ? 'Chi nhánh: Tất cả'
      : BRANCHES.find((b) => b.id === filters.branchId)?.shortName ?? 'Chi nhánh';

  const activeCategoryLabel =
    filters.categoryId === 'all'
      ? 'Danh mục SP'
      : CATEGORIES.find((c) => c.id === filters.categoryId)?.label ?? 'Danh mục SP';

  const activePaymentLabel =
    filters.paymentMethod === 'all'
      ? 'PT Thanh toán'
      : PAYMENT_METHODS.find((p) => p.id === filters.paymentMethod)?.label ?? 'PT Thanh toán';

  return (
    <motion.section
      ref={barRef}
      variants={bentoItemVariants}
      className="w-full min-h-[52px] glass-card rounded-[16px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 relative z-20"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-[2px] p-[3px] rounded-[11px] bg-[#EFF6FF]/90 border border-[#DBEAFE]">
          {TIME_BUTTONS.map((btn) => {
            const isActive = filters.timePreset === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleSelectPreset(btn.id)}
                className={`relative h-[28px] px-2.5 rounded-[8px] text-[11.5px] font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-[#334155] hover:text-[#1D4ED8]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="time-preset-pill"
                    transition={SPRING_PILL}
                    className="absolute inset-0 rounded-[8px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_3px_10px_rgba(37,99,235,0.42)]"
                  />
                )}
                <span className="relative z-10">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown((prev) => (prev === 'date' ? null : 'date'))
            }
            className={`w-[186px] h-[34px] rounded-[10px] border px-2.5 flex items-center gap-1.5 text-[11.5px] transition-all duration-200 cursor-pointer ${
              filters.timePreset === 'custom' || openDropdown === 'date'
                ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] font-semibold shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                : 'bg-white/85 border-[#CBD5E1] text-[#334155] hover:border-[#60A5FA] hover:text-[#1D4ED8]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span className="truncate tabular-nums whitespace-nowrap">
              {formatDateVN(filters.startDate)} — {formatDateVN(filters.endDate)}
            </span>
          </button>

          <AnimatePresence>
            {openDropdown === 'date' && (
              <motion.div
                {...popoverAnim}
                className="absolute left-0 top-[40px] w-[300px] glass-popover rounded-[12px] p-4 z-50"
              >
                <p className="text-[12px] font-bold text-[#0F172A] mb-2.5">
                  Chọn khoảng thời gian tùy chỉnh
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#475569] mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={draftStart}
                      onChange={(e) => setDraftStart(e.target.value)}
                      className={`w-full h-[34px] px-2.5 rounded-[8px] border text-[12px] outline-none transition-all ${
                        isDateInvalid
                          ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                          : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#475569] mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={draftEnd}
                      onChange={(e) => setDraftEnd(e.target.value)}
                      className={`w-full h-[34px] px-2.5 rounded-[8px] border text-[12px] outline-none transition-all ${
                        isDateInvalid
                          ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                          : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      }`}
                    />
                  </div>
                </div>

                {isDateInvalid && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#DC2626]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Ngày bắt đầu phải ≤ ngày kết thúc</span>
                  </div>
                )}

                <div className="mt-3.5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="h-[32px] px-3 rounded-[8px] btn-glass text-[12px] font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={isDateInvalid}
                    onClick={handleApplyDateRange}
                    className="h-[32px] px-3.5 rounded-[8px] btn-blue-glow text-[12px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Branch Filter */}
        <div className="relative">
          <button
            type="button"
            disabled={isBranchLocked}
            aria-label="Lọc theo chi nhánh"
            onClick={() =>
              setOpenDropdown((prev) => (prev === 'branch' ? null : 'branch'))
            }
            title={
              isBranchLocked
                ? 'Chi nhánh bị khóa theo vai trò được phân công'
                : 'Lọc báo cáo theo chi nhánh'
            }
            className={`w-[146px] xl:w-[162px] h-[34px] rounded-[10px] border px-2.5 flex items-center justify-between text-[11.5px] font-medium transition-all duration-200 whitespace-nowrap ${
              isBranchLocked
                ? 'bg-[#F1F5F9]/80 border-[#CBD5E1] text-[#64748B] cursor-not-allowed'
                : filters.branchId !== 'all' || openDropdown === 'branch'
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] font-semibold shadow-[0_0_0_3px_rgba(37,99,235,0.12)] cursor-pointer'
                  : 'bg-white/85 border-[#CBD5E1] text-[#334155] hover:border-[#60A5FA] hover:text-[#1D4ED8] cursor-pointer'
            }`}
          >
            <span className="truncate flex items-center gap-1">
              {isBranchLocked && (
                <Lock className="w-3 h-3 text-[#D97706] shrink-0" />
              )}
              <span className="truncate">{activeBranchLabel}</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform duration-200 ${
                openDropdown === 'branch' ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === 'branch' && !isBranchLocked && (
              <motion.div
                {...popoverAnim}
                className="absolute right-0 top-[40px] w-[220px] glass-popover rounded-[12px] py-1.5 z-50"
              >
                {(
                  [
                    { id: 'all' as BranchId, label: 'Chi nhánh: Tất cả' },
                    ...BRANCHES.map((b) => ({ id: b.id as BranchId, label: b.name })),
                  ]
                ).map((opt) => {
                  const active = filters.branchId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChangeFilters({ ...filters, branchId: opt.id });
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'font-bold text-[#1D4ED8] bg-[#EFF6FF]'
                          : 'text-[#334155] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            type="button"
            aria-label="Lọc theo danh mục sản phẩm"
            onClick={() =>
              setOpenDropdown((prev) => (prev === 'category' ? null : 'category'))
            }
            className={`w-[126px] xl:w-[140px] h-[34px] rounded-[10px] border px-2.5 flex items-center justify-between text-[11.5px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              filters.categoryId !== 'all' || openDropdown === 'category'
                ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] font-semibold shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                : 'bg-white/85 border-[#CBD5E1] text-[#334155] hover:border-[#60A5FA] hover:text-[#1D4ED8]'
            }`}
          >
            <span className="truncate">{activeCategoryLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform duration-200 ${
                openDropdown === 'category' ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === 'category' && (
              <motion.div
                {...popoverAnim}
                className="absolute right-0 top-[40px] w-[196px] glass-popover rounded-[12px] py-1.5 z-50"
              >
                {CATEGORIES.map((cat) => {
                  const active = filters.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onChangeFilters({
                          ...filters,
                          categoryId: cat.id as CategoryId,
                        });
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'font-bold text-[#1D4ED8] bg-[#EFF6FF]'
                          : 'text-[#334155] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Method Filter */}
        <div className="relative">
          <button
            type="button"
            aria-label="Lọc theo phương thức thanh toán"
            onClick={() =>
              setOpenDropdown((prev) => (prev === 'payment' ? null : 'payment'))
            }
            className={`w-[126px] xl:w-[138px] h-[34px] rounded-[10px] border px-2.5 flex items-center justify-between text-[11.5px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
              filters.paymentMethod !== 'all' || openDropdown === 'payment'
                ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                : 'bg-white/85 border-[#CBD5E1] text-[#0F172A] hover:border-[#60A5FA] hover:text-[#1D4ED8]'
            }`}
          >
            <span className="truncate">{activePaymentLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform duration-200 ${
                openDropdown === 'payment' ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === 'payment' && (
              <motion.div
                {...popoverAnim}
                className="absolute right-0 top-[40px] w-[196px] glass-popover rounded-[12px] py-1.5 z-50"
              >
                {PAYMENT_METHODS.map((pm) => {
                  const active = filters.paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        onChangeFilters({
                          ...filters,
                          paymentMethod: pm.id as PaymentMethod,
                        });
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'font-bold text-[#1D4ED8] bg-[#EFF6FF]'
                          : 'text-[#334155] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="truncate">{pm.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
