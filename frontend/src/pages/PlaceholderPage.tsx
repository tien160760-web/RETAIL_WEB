import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ShieldAlert, Layers } from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { SIDEBAR_GROUPS } from '../data/mockDashboardData';
import { SidebarMenuItem } from '../types/dashboard';
import {
  bentoItemVariants,
  pageContainerVariants,
  SpotlightGlassCard,
} from '../components/ui/MotionPrimitives';

interface PlaceholderPageProps {
  menuItem: SidebarMenuItem;
}

export function PlaceholderPage({ menuItem }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const { roleConfig, selectedBranchId, isBranchLocked, getBranchLabel } =
    useAdminContext();

  const isAllowed = roleConfig.allowedMenuIds.includes(menuItem.id);

  const firstAllowedItem = SIDEBAR_GROUPS.flatMap((g) => g.items).find((item) =>
    roleConfig.allowedMenuIds.includes(item.id)
  );

  if (!isAllowed) {
    return (
      <motion.div
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-[14px]"
      >
        <motion.div
          variants={bentoItemVariants}
          className="glass-card rounded-[16px] px-[20px] py-[14px]"
        >
          <h2 className="text-[19px] font-bold text-[#0F172A] tracking-[-0.02em]">
            {menuItem.pageTitle}
          </h2>
          <p className="text-[12px] text-[#475569] mt-1">
            {menuItem.description}
          </p>
        </motion.div>

        <motion.div
          variants={bentoItemVariants}
          className="glass-card border-[#FECACA] rounded-[16px] p-12 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-[14px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-bold text-[#991B1B]">
            Không có quyền truy cập chức năng này
          </h3>
          <p className="text-[13px] text-[#475569] max-w-[520px] mt-1.5">
            Vai trò hiện tại (<strong>{roleConfig.shortLabel}</strong>) không được cấp
            quyền sử dụng mục <strong>{menuItem.label}</strong>.
          </p>
          <button
            type="button"
            onClick={() => navigate(firstAllowedItem?.path ?? '/')}
            className="mt-5 h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              Quay về {firstAllowedItem ? firstAllowedItem.label : 'Dashboard'}
            </span>
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full space-y-[14px]"
    >
      <motion.section
        variants={bentoItemVariants}
        className="min-h-[64px] py-2.5 glass-card glass-card-subtle rounded-[16px] px-4 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-[19px] font-bold text-[#0F172A] tracking-[-0.02em]">
            {menuItem.pageTitle}
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            {menuItem.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Về Dashboard</span>
        </button>
      </motion.section>

      <SpotlightGlassCard
        lift={-4}
        className="rounded-[16px] p-10 flex flex-col items-center text-center"
      >
        <div className="relative z-10 w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_6px_16px_rgba(37,99,235,0.38)] flex items-center justify-center mb-3.5">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="relative z-10 text-[16px] font-bold text-[#0F172A]">
          {menuItem.label}
        </h3>
        <p className="relative z-10 text-[13px] text-[#475569] max-w-[540px] mt-1.5 leading-relaxed">
          {menuItem.description}. Giao diện chi tiết của phân hệ này sẵn sàng kết nối API khi triển khai.
        </p>

        <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left w-full max-w-[520px]">
          <div className="p-4 rounded-[12px] bg-[#EFF6FF]/75 border border-[#DBEAFE]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              Vai trò đang chọn
            </p>
            <p className="text-[13px] font-bold text-[#0F172A] mt-1">
              {roleConfig.shortLabel}
            </p>
            <p className="text-[11px] text-[#475569] mt-0.5">
              {roleConfig.userName}
            </p>
          </div>

          <div className="p-4 rounded-[12px] bg-[#EFF6FF]/75 border border-[#DBEAFE]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              Phạm vi Chi nhánh
            </p>
            <p className="text-[13px] font-bold text-[#0F172A] mt-1 flex items-center gap-1.5">
              {isBranchLocked && <Lock className="w-3.5 h-3.5 text-[#D97706]" />}
              <span>{getBranchLabel(selectedBranchId)}</span>
            </p>
            <p className="text-[11px] text-[#475569] mt-0.5">
              {isBranchLocked ? 'Đã khóa theo chi nhánh được phân công' : 'Xem toàn hệ thống'}
            </p>
          </div>
        </div>
      </SpotlightGlassCard>
    </motion.div>
  );
}
