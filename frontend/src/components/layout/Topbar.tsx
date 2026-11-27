import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
} from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext';
import { ROLES } from '../../data/mockDashboardData';

interface TopbarProps {
  pageTitle?: string;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onToggleSidebar: () => void;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Topbar({
  pageTitle,
  isSidebarCollapsed,
  onToggleSidebar,
}: TopbarProps) {
  const navigate = useNavigate();
  const { currentUser, logout, apiConnected } = useAdminContext();

  const roleLabel =
    ROLES.find((r) => r.id === currentUser?.role)?.shortLabel ?? 'Quản trị viên';
  const initials = getInitials(currentUser?.fullName ?? 'Admin');

  return (
    <header className="h-[56px] w-full shrink-0 bg-white border-b border-[#E4E4E7] px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Toggle + Brand + Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Đóng/mở thanh điều hướng"
          className="w-[32px] h-[32px] rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#52525B] hover:text-[#09090B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 lg:hidden" />
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 hidden lg:block" />
          ) : (
            <PanelLeftClose className="w-4 h-4 hidden lg:block" />
          )}
        </button>

        <div className="flex items-center gap-2 text-[13.5px] font-bold tracking-tight text-[#09090B] shrink-0">
          <span className="w-[26px] h-[26px] rounded-[7px] bg-[#18181B] text-white flex items-center justify-center shadow-2xs">
            <Store className="w-3.5 h-3.5" />
          </span>
          <span>RETAIL_WEB</span>
          <span
            title={
              apiConnected
                ? 'Đã kết nối trực tiếp với FastAPI Backend (/api/v1)'
                : 'Đang chạy chế độ Local'
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10.5px] font-semibold ${
              apiConnected
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                : 'bg-[#F4F4F5] border-[#E4E4E7] text-[#52525B]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiConnected ? 'bg-[#16A34A]' : 'bg-[#71717A]'
              }`}
            />
            <span>{apiConnected ? 'API Connected' : 'Local Mode'}</span>
          </span>
        </div>

        {pageTitle && (
          <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#71717A] pl-1 min-w-0">
            <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
            <span className="font-medium text-[#18181B] truncate">
              {pageTitle}
            </span>
          </div>
        )}
      </div>

      {/* Right: User badge + Neutral Logout button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-[#E4E4E7] bg-[#FAFAFA]">
          <span className="w-6 h-6 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </span>
          <div className="leading-none">
            <p className="text-[12px] font-semibold text-[#09090B]">
              {currentUser?.fullName ?? 'Admin'}
            </p>
            <p className="text-[10.5px] text-[#71717A] mt-0.5">
              {roleLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Đăng xuất khỏi phiên làm việc"
          className="h-[32px] px-3 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[#52525B] hover:text-[#DC2626] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
