import {
  ChartGranularity,
  RevenueShareItem,
  RevenueTimePoint,
} from '../../types/dashboard';
import {
  formatCompactVND,
  formatNumber,
  formatVND,
} from '../../utils/format';

interface ChartsRowProps {
  timeSeries: RevenueTimePoint[];
  granularity: ChartGranularity;
  onChangeGranularity: (g: ChartGranularity) => void;
  shareTitle: string;
  shareSubtitle: string;
  revenueShares: RevenueShareItem[];
  isLoading: boolean;
}

const GRANULARITY_TABS: { id: ChartGranularity; label: string }[] = [
  { id: 'day', label: 'Ngày' },
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
];

export function ChartsRow({
  timeSeries,
  granularity,
  onChangeGranularity,
  shareTitle,
  shareSubtitle,
  revenueShares,
  isLoading,
}: ChartsRowProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
        <div className="lg:col-span-8 h-[220px] glass-card rounded-[10px] p-4 animate-pulse" />
        <div className="lg:col-span-4 h-[220px] glass-card rounded-[10px] p-4 animate-pulse" />
      </section>
    );
  }

  const maxRev = Math.max(...timeSeries.map((d) => d.revenue), 1);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
      {/* Left: Simple native bar chart */}
      <div className="lg:col-span-7 xl:col-span-8 glass-card rounded-[10px] p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-[13.5px] font-bold text-[#0F172A]">
              Biểu đồ Doanh thu &amp; Đơn hàng
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Di chuột vào cột để xem chi tiết doanh thu và số lượng đơn
            </p>
          </div>

          <div className="inline-flex rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC] p-0.5">
            {GRANULARITY_TABS.map((tab) => {
              const active = granularity === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeGranularity(tab.id)}
                  className={`px-2.5 py-1 rounded-[6px] text-[11px] font-semibold cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[150px] flex items-end gap-2 pt-4 pb-1 px-1 border-b border-[#E2E8F0]">
          {timeSeries.map((pt) => {
            const heightPct = Math.max(8, Math.round((pt.revenue / maxRev) * 100));
            return (
              <div
                key={pt.label}
                title={`${pt.label}: ${formatVND(pt.revenue)} (${formatNumber(pt.orders)} đơn)`}
                className="flex-1 flex flex-col items-center justify-end h-full group"
              >
                <span className="text-[9.5px] text-[#64748B] mb-1 hidden sm:block tabular-nums">
                  {formatCompactVND(pt.revenue)}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[34px] rounded-t-[4px] bg-[#3B82F6] group-hover:bg-[#1D4ED8] transition-all"
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-1.5 px-1">
          {timeSeries.map((pt) => (
            <div
              key={pt.label}
              className="flex-1 text-center text-[10.5px] text-[#64748B] truncate"
            >
              {pt.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Simple Revenue Breakdown Progress List */}
      <div className="lg:col-span-5 xl:col-span-4 glass-card rounded-[10px] p-4 flex flex-col justify-between">
        <div className="mb-3">
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">
            {shareTitle}
          </h3>
          <p className="text-[11px] text-[#64748B]">{shareSubtitle}</p>
        </div>

        <div className="space-y-3 my-auto">
          {revenueShares.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-[#334155] truncate">
                    {item.name}
                  </span>
                </div>
                <div className="shrink-0 tabular-nums text-[11.5px]">
                  <strong className="text-[#0F172A]">{item.percentage}%</strong>{' '}
                  <span className="text-[#64748B]">({formatCompactVND(item.revenue)})</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
