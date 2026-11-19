import { motion } from 'framer-motion';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
import { SpotlightGlassCard, SPRING_PILL } from '../ui/MotionPrimitives';

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
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full">
        <div className="lg:col-span-7 xl:col-span-8 h-[228px] glass-card rounded-[16px] px-4 py-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-4 w-64 bg-[#DBEAFE] rounded-full animate-pulse" />
            <div className="h-7 w-36 bg-[#DBEAFE] rounded-lg animate-pulse" />
          </div>
          <div className="h-[156px] w-full bg-[#EFF6FF]/70 rounded-xl animate-pulse" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 h-[228px] glass-card rounded-[16px] px-4 py-3.5 flex flex-col justify-between">
          <div className="h-4 w-44 bg-[#DBEAFE] rounded-full animate-pulse" />
          <div className="h-[156px] w-full bg-[#EFF6FF]/70 rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full">
      {/* Left Chart Card */}
      <SpotlightGlassCard
        lift={-4}
        className="lg:col-span-7 xl:col-span-8 min-w-0 h-[228px] rounded-[16px] px-4 py-3.5 flex flex-col"
      >
        <div className="relative z-10 flex items-center justify-between gap-2 mb-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="text-[13.5px] xl:text-[14.5px] font-bold text-[#0F172A] tracking-[-0.01em] truncate">
              Doanh thu &amp; Số đơn hàng theo thời gian
            </h3>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-[#475569] whitespace-nowrap shrink-0">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] shadow-[0_0_6px_rgba(37,99,235,0.5)] shrink-0" />
                Doanh thu
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span className="w-3 h-[2.5px] rounded-full bg-[#0EA5E9] shadow-[0_0_6px_rgba(14,165,233,0.65)] shrink-0" />
                Số đơn
              </span>
            </div>
          </div>

          <div className="w-[146px] h-[28px] shrink-0 rounded-[9px] border border-[#DBEAFE] bg-[#EFF6FF]/90 p-[2px] grid grid-cols-3 gap-[2px]">
            {GRANULARITY_TABS.map((tab) => {
              const active = granularity === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeGranularity(tab.id)}
                  className={`relative rounded-[6px] text-[11px] font-bold transition-colors duration-200 cursor-pointer ${
                    active
                      ? 'text-white'
                      : 'text-[#475569] hover:text-[#1D4ED8]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="granularity-pill"
                      transition={SPRING_PILL}
                      className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_2px_8px_rgba(37,99,235,0.42)]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timeSeries}
              margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.96} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#DBEAFE"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={{ stroke: '#DBEAFE' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={formatCompactVND}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#0284C7' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: 'rgba(219, 234, 254, 0.35)' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(191, 219, 254, 0.95)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 12px 28px -8px rgba(37, 99, 235, 0.22)',
                }}
                formatter={(value, name) => {
                  const num = Number(value ?? 0);
                  if (name === 'Doanh thu') return [formatVND(num), 'Doanh thu'];
                  return [`${formatNumber(num)} đơn`, 'Số đơn hàng'];
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Doanh thu"
                fill="url(#revenueBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
                isAnimationActive={true}
                animationDuration={850}
                animationEasing="ease-out"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Số đơn hàng"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#0EA5E9', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={950}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SpotlightGlassCard>

      {/* Right Chart Card */}
      <SpotlightGlassCard
        lift={-4}
        className="lg:col-span-5 xl:col-span-4 min-w-0 h-[228px] rounded-[16px] px-4 py-3.5 flex flex-col"
      >
        <div className="relative z-10 shrink-0">
          <h3 className="text-[13.5px] xl:text-[14.5px] font-bold text-[#0F172A] tracking-[-0.01em] leading-tight truncate">
            {shareTitle}
          </h3>
          <p className="text-[11px] text-[#64748B] mt-[2px] truncate">
            {shareSubtitle}
          </p>
        </div>

        <div className="relative z-10 flex-1 min-h-0 flex items-center gap-3 mt-1.5">
          <div className="w-[116px] h-[116px] xl:w-[128px] xl:h-[128px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueShares}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={3}
                  cornerRadius={4}
                  strokeWidth={0}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {revenueShares.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(191, 219, 254, 0.95)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    boxShadow: '0 10px 24px -8px rgba(37, 99, 235, 0.22)',
                  }}
                  formatter={(value) => [formatVND(Number(value ?? 0)), 'Doanh thu']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9.5px] font-medium text-[#64748B]">Tỷ trọng</span>
              <span className="text-[13px] font-extrabold text-[#1E3A8A]">100%</span>
            </div>
          </div>

          <ul className="flex-1 min-w-0 space-y-1.5">
            {revenueShares.map((item) => (
              <motion.li
                key={item.id}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-between gap-1.5 text-[11px] px-1.5 py-1 rounded-[7px] hover:bg-[#EFF6FF]/85 transition-colors cursor-default"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.35)]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#334155] font-medium truncate">
                    {item.name}
                  </span>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <span className="font-bold text-[#0F172A]">
                    {item.percentage}%
                  </span>
                  <span className="text-[#64748B] ml-1 text-[10px]">
                    ({formatCompactVND(item.revenue)})
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </SpotlightGlassCard>
    </section>
  );
}
