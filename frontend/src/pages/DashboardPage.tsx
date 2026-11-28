import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FilterBar } from '../components/dashboard/FilterBar';
import { KpiCardsRow } from '../components/dashboard/KpiCardsRow';
import { ChartsRow } from '../components/dashboard/ChartsRow';
import { TablesRow } from '../components/dashboard/TablesRow';
import {
  bentoItemVariants,
  pageContainerVariants,
} from '../components/ui/MotionPrimitives';
import { useAdminContext } from '../context/AdminContext';
import { getDashboardSnapshot } from '../data/mockDashboardData';
import { ChartGranularity, DashboardFilters } from '../types/dashboard';
import { formatDateVN, formatVND, getPresetDateRange } from '../utils/format';

export function DashboardPage() {
  const navigate = useNavigate();
  const { role, roleConfig, selectedBranchId, setSelectedBranchId, isBranchLocked } =
    useAdminContext();

  const initialRange = getPresetDateRange('30d');
  const [filters, setFilters] = useState<DashboardFilters>({
    timePreset: '30d',
    startDate: initialRange.startDate,
    endDate: initialRange.endDate,
    branchId: selectedBranchId,
    categoryId: 'all',
    paymentMethod: 'all',
  });

  const [granularity, setGranularity] = useState<ChartGranularity>('day');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Topbar branch context -> FilterBar branch
  useEffect(() => {
    setFilters((prev) =>
      prev.branchId === selectedBranchId
        ? prev
        : { ...prev, branchId: selectedBranchId }
    );
  }, [selectedBranchId]);

  const handleChangeFilters = (next: DashboardFilters) => {
    setFilters(next);
    if (!isBranchLocked && next.branchId !== selectedBranchId) {
      setSelectedBranchId(next.branchId);
    }
  };

  const snapshot = useMemo(
    () => getDashboardSnapshot(filters, role, granularity),
    [filters, role, granularity]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã làm mới số liệu thống kê mới nhất.');
    }, 500);
  };

  const handleExport = () => {
    const lines = [
      ['BÁO CÁO KINH DOANH & TỒN KHO — RETAIL_WEB'],
      ['Kỳ báo cáo', `${formatDateVN(filters.startDate)} - ${formatDateVN(filters.endDate)}`],
      ['Vai trò xem', roleConfig.shortLabel],
      [],
      ['CHỈ SỐ KPI', 'GIÁ TRỊ'],
      ['Tổng doanh thu', formatVND(snapshot.kpi.totalRevenue)],
      ['Tổng số đơn hàng', String(snapshot.kpi.totalOrders)],
      ['Đơn hoàn thành', String(snapshot.kpi.completedOrders)],
      ['Đơn đã hủy', String(snapshot.kpi.cancelledOrders)],
      ['Giá trị đơn TB (AOV)', formatVND(snapshot.kpi.aov)],
      ['Tổng tồn kho khả dụng', String(snapshot.kpi.totalAvailableStock)],
      [],
      ['SẢN PHẨM BÁN CHẠY', 'MÃ SKU', 'SL BÁN', 'DOANH THU (VND)', 'TỒN KHẢ DỤNG'],
      ...snapshot.topProducts.map((p) => [
        p.name,
        p.sku,
        String(p.soldQty),
        String(p.revenue),
        String(p.availableStock),
      ]),
      [],
      ['CHI NHÁNH', 'THỰC TẾ (ON_HAND)', 'ĐANG GIỮ (RESERVED)', 'KHẢ DỤNG (AVAILABLE)', 'CẢNH BÁO'],
      ...snapshot.branchInventory.map((b) => [
        b.branchName,
        String(b.onHand),
        String(b.reserved),
        String(b.available),
        b.warningLabel,
      ]),
    ];

    const csvContent =
      '\uFEFF' +
      lines
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-kinh-doanh-${filters.startDate}-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Đã xuất file báo cáo kinh doanh (.csv).');
  };

  const isStaffReadOnlyBanner =
    role === 'WAREHOUSE_STAFF' || role === 'SALES_STAFF';

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-3 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="fixed bottom-5 right-6 z-50 bg-[#0B1736]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-[12px] shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)] border border-[#60A5FA]/35 flex items-center gap-2 text-[12px] font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role restriction notice when simulating Staff roles */}
      {isStaffReadOnlyBanner && (
        <motion.div
          variants={bentoItemVariants}
          className="w-full rounded-[12px] glass-card bg-[#EFF6FF]/85 border-[#93C5FD]/80 px-4 py-2.5 flex items-center justify-between gap-3 text-[12px] text-[#1E40AF]"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              Đang xem dưới vai trò <strong>{roleConfig.shortLabel}</strong>: dữ liệu được giới hạn theo{' '}
              <strong>chi nhánh được phân công</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(role === 'WAREHOUSE_STAFF' ? '/inventory' : '/orders')
            }
            className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline shrink-0 cursor-pointer"
          >
            Đi tới màn hình nghiệp vụ →
          </button>
        </motion.div>
      )}

      {/* 3.1 Header trang */}
      <DashboardHeader
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* 3.2 Thanh bộ lọc */}
      <FilterBar
        filters={filters}
        isBranchLocked={isBranchLocked}
        onChangeFilters={handleChangeFilters}
      />

      {/* 3.3 Hàng KPI */}
      <KpiCardsRow kpi={snapshot.kpi} isLoading={isRefreshing} />

      {/* 3.4 Hàng biểu đồ */}
      <ChartsRow
        timeSeries={snapshot.timeSeries}
        granularity={granularity}
        onChangeGranularity={setGranularity}
        shareTitle={snapshot.shareTitle}
        shareSubtitle={snapshot.shareSubtitle}
        revenueShares={snapshot.revenueShares}
        isLoading={isRefreshing}
      />

      {/* 3.5 Hàng bảng */}
      <TablesRow
        topProducts={snapshot.topProducts}
        slowProducts={snapshot.slowProducts}
        branchInventory={snapshot.branchInventory}
        skuMatrix={snapshot.skuMatrix}
        isLoading={isRefreshing}
      />
    </motion.div>
  );
}
