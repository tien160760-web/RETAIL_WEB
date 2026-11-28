import { motion } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import { bentoItemVariants } from '../ui/MotionPrimitives';

interface DashboardHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function DashboardHeader({
  isRefreshing,
  onRefresh,
  onExport,
}: DashboardHeaderProps) {
  return (
    <motion.section
      variants={bentoItemVariants}
      className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight truncate">
          Dashboard &amp; Báo cáo kinh doanh
        </h2>
        <p className="text-[12px] text-[#475569] mt-[2px] truncate">
          Tổng quan doanh thu, đơn hàng, sản phẩm nổi bật và tồn kho theo chi nhánh
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-[34px] px-3.5 rounded-[10px] btn-glass disabled:opacity-60 flex items-center justify-center gap-1.5 text-[12px] font-bold cursor-pointer whitespace-nowrap"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-[#2563EB] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
          <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onExport}
          className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow flex items-center justify-center gap-1.5 text-[12px] font-bold cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất báo cáo</span>
        </motion.button>
      </div>
    </motion.section>
  );
}
