import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  Receipt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { KpiSummary } from '../../types/dashboard';
import { formatNumber, formatPercent, formatVND } from '../../utils/format';
import {
  AnimatedNumber,
  bentoItemVariants,
  SpotlightGlassCard,
} from '../ui/MotionPrimitives';

interface KpiCardsRowProps {
  kpi: KpiSummary;
  isLoading: boolean;
}

export function KpiCardsRow({ kpi, isLoading }: KpiCardsRowProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="w-full min-w-0 h-[108px] glass-card rounded-[16px] px-4 py-3.5 flex flex-col justify-between"
          >
            <div className="h-3.5 w-28 bg-[#DBEAFE] rounded-full animate-pulse" />
            <div className="h-6 w-36 bg-[#DBEAFE]/80 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-[#EFF6FF] rounded-full animate-pulse" />
          </div>
        ))}
      </section>
    );
  }

  const revPositive = kpi.revenueDeltaPct >= 0;
  const aovPositive = kpi.aovDeltaPct >= 0;

  return (
    <motion.section
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.075 } },
      }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full"
    >
      {/* Card 1: Tổng Doanh Thu */}
      <SpotlightGlassCard
        lift={-5}
        className="group w-full min-w-0 h-[108px] rounded-[16px] px-3.5 py-3 flex flex-col justify-between cursor-default"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#3B82F6]/15 blur-2xl group-hover:bg-[#3B82F6]/30 transition-colors duration-300" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#475569] truncate">
            Tổng doanh thu
          </p>
          <span className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center shadow-[0_6px_14px_rgba(37,99,235,0.42)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
            <DollarSign className="w-4 h-4" />
          </span>
        </div>

        <p className="relative z-10 text-[18px] xl:text-[21px] font-extrabold text-[#0F172A] tabular-nums tracking-[-0.02em] leading-none truncate">
          <AnimatedNumber value={kpi.totalRevenue} formatter={formatVND} />
        </p>

        <div className="relative z-10 flex items-center gap-1.5 min-w-0">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
              revPositive
                ? 'bg-[#DCFCE7]/90 text-[#15803D]'
                : 'bg-[#FEE2E2]/90 text-[#B91C1C]'
            }`}
          >
            {revPositive ? (
              <TrendingUp className="w-3 h-3 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 shrink-0" />
            )}
            <span>
              {revPositive ? '+' : '-'}
              {formatPercent(kpi.revenueDeltaPct)}
            </span>
          </span>
          <span className="text-[10.5px] text-[#64748B] truncate">so với kỳ trước</span>
        </div>
      </SpotlightGlassCard>

      {/* Card 2: Tổng Số Đơn Hàng */}
      <SpotlightGlassCard
        lift={-5}
        className="group w-full min-w-0 h-[108px] rounded-[16px] px-3.5 py-3 flex flex-col justify-between cursor-default"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#0EA5E9]/15 blur-2xl group-hover:bg-[#0EA5E9]/30 transition-colors duration-300" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#475569] truncate">
            Tổng số đơn hàng
          </p>
          <span className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shadow-[0_6px_14px_rgba(2,132,199,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </span>
        </div>

        <p className="relative z-10 text-[18px] xl:text-[21px] font-extrabold text-[#0F172A] tabular-nums tracking-[-0.02em] leading-none truncate">
          <AnimatedNumber value={kpi.totalOrders} formatter={formatNumber} />{' '}
          <span className="text-[13px] font-semibold text-[#475569]">đơn</span>
        </p>

        <p className="relative z-10 text-[10.5px] text-[#475569] tabular-nums flex items-center gap-1 min-w-0">
          <span className="px-1.5 py-0.5 rounded-full bg-[#DCFCE7]/85 font-semibold text-[#15803D] truncate">
            <AnimatedNumber value={kpi.completedOrders} formatter={formatNumber} /> hoàn thành
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#FEE2E2]/85 font-semibold text-[#B91C1C] shrink-0">
            <AnimatedNumber value={kpi.cancelledOrders} formatter={formatNumber} /> hủy
          </span>
        </p>
      </SpotlightGlassCard>

      {/* Card 3: Giá Trị Đơn Trung Bình (AOV) */}
      <SpotlightGlassCard
        lift={-5}
        className="group w-full min-w-0 h-[108px] rounded-[16px] px-3.5 py-3 flex flex-col justify-between cursor-default"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#6366F1]/15 blur-2xl group-hover:bg-[#6366F1]/30 transition-colors duration-300" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#475569] truncate">
            Giá trị đơn TB (AOV)
          </p>
          <span className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-[#4F46E5] to-[#60A5FA] text-white flex items-center justify-center shadow-[0_6px_14px_rgba(79,70,229,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
            <Receipt className="w-4 h-4" />
          </span>
        </div>

        <p className="relative z-10 text-[18px] xl:text-[21px] font-extrabold text-[#0F172A] tabular-nums tracking-[-0.02em] leading-none truncate">
          <AnimatedNumber value={kpi.aov} formatter={formatVND} />
        </p>

        <div className="relative z-10 flex items-center gap-1.5 min-w-0">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0 ${
              aovPositive
                ? 'bg-[#DCFCE7]/90 text-[#15803D]'
                : 'bg-[#FEE2E2]/90 text-[#B91C1C]'
            }`}
          >
            {aovPositive ? (
              <TrendingUp className="w-3 h-3 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 shrink-0" />
            )}
            <span>
              {aovPositive ? '+' : '-'}
              {formatPercent(kpi.aovDeltaPct)}
            </span>
          </span>
          <span className="text-[10.5px] text-[#64748B] truncate">so với kỳ trước</span>
        </div>
      </SpotlightGlassCard>

      {/* Card 4: Tổng Lượng Tồn Kho */}
      <SpotlightGlassCard
        lift={-5}
        className="group w-full min-w-0 h-[108px] rounded-[16px] px-3.5 py-3 flex flex-col justify-between cursor-default"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#2563EB]/15 blur-2xl group-hover:bg-[#2563EB]/30 transition-colors duration-300" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#475569] truncate">
            Tổng lượng tồn kho
          </p>
          <span className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-[#1D4ED8] to-[#0EA5E9] text-white flex items-center justify-center shadow-[0_6px_14px_rgba(29,78,216,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
            <Boxes className="w-4 h-4" />
          </span>
        </div>

        <p className="relative z-10 text-[18px] xl:text-[21px] font-extrabold text-[#0F172A] tabular-nums tracking-[-0.02em] leading-none truncate">
          <AnimatedNumber value={kpi.totalAvailableStock} formatter={formatNumber} />{' '}
          <span className="text-[13px] font-semibold text-[#475569]">SP</span>
        </p>

        <motion.p
          variants={bentoItemVariants}
          className="relative z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FEF3C7]/90 text-[10.5px] font-semibold text-[#B45309] w-fit max-w-full truncate"
        >
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {kpi.lowStockSkuCount} sắp hết · {kpi.outOfStockSkuCount} hết hàng
          </span>
        </motion.p>
      </SpotlightGlassCard>
    </motion.section>
  );
}
