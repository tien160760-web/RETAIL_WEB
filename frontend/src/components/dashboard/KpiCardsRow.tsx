import {
  Boxes,
  DollarSign,
  Receipt,
  ShoppingBag,
} from 'lucide-react';
import { KpiSummary } from '../../types/dashboard';
import { formatNumber, formatPercent, formatVND } from '../../utils/format';

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
            className="w-full h-[96px] glass-card rounded-[10px] p-3.5 animate-pulse bg-white"
          />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {/* Card 1 */}
      <div className="glass-card rounded-[10px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-[#64748B]">
            Tổng doanh thu
          </span>
          <DollarSign className="w-4 h-4 text-[#2563EB]" />
        </div>
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] tabular-nums my-1 truncate">
          {formatVND(kpi.totalRevenue)}
        </p>
        <p className="text-[11px] text-[#15803D] font-medium">
          {kpi.revenueDeltaPct >= 0 ? '+' : ''}
          {formatPercent(kpi.revenueDeltaPct)} so với kỳ trước
        </p>
      </div>

      {/* Card 2 */}
      <div className="glass-card rounded-[10px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-[#64748B]">
            Tổng số đơn hàng
          </span>
          <ShoppingBag className="w-4 h-4 text-[#0284C7]" />
        </div>
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] tabular-nums my-1">
          {formatNumber(kpi.totalOrders)} đơn
        </p>
        <p className="text-[11px] text-[#475569]">
          <span className="text-[#15803D] font-semibold">{kpi.completedOrders} hoàn thành</span>
          {' · '}
          <span className="text-[#B91C1C] font-semibold">{kpi.cancelledOrders} hủy</span>
        </p>
      </div>

      {/* Card 3 */}
      <div className="glass-card rounded-[10px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-[#64748B]">
            Giá trị đơn TB (AOV)
          </span>
          <Receipt className="w-4 h-4 text-[#4F46E5]" />
        </div>
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] tabular-nums my-1 truncate">
          {formatVND(kpi.aov)}
        </p>
        <p className="text-[11px] text-[#64748B]">
          {kpi.aovDeltaPct >= 0 ? '+' : ''}
          {formatPercent(kpi.aovDeltaPct)} so với kỳ trước
        </p>
      </div>

      {/* Card 4 */}
      <div className="glass-card rounded-[10px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-[#64748B]">
            Tổng tồn kho khả dụng
          </span>
          <Boxes className="w-4 h-4 text-[#D97706]" />
        </div>
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] tabular-nums my-1">
          {formatNumber(kpi.totalAvailableStock)} SP
        </p>
        <p className="text-[11px] text-[#B45309] font-medium">
          {kpi.lowStockSkuCount} sắp hết · {kpi.outOfStockSkuCount} hết hàng
        </p>
      </div>
    </section>
  );
}
