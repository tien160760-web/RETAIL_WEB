import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  User,
} from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext';

interface TopbarProps {
  pageTitle?: string;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({
  pageTitle,
  isSidebarCollapsed,
  onToggleSidebar,
}: TopbarProps) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAdminContext();

  return (
    <header className="h-[52px] w-full shrink-0 bg-white border-b border-[#E2E8F0] px-3 sm:px-4 flex items-center justify-between gap-3">
      {/* Left: Toggle + Brand + Current Page Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Đóng/mở thanh menu"
          className="w-[34px] h-[34px] rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] flex items-center justify-center cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 text-[#334155] lg:hidden" />
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#334155] hidden lg:block" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[#334155] hidden lg:block" />
          )}
        </button>

        <div className="flex items-center gap-2 text-[14px] font-bold text-[#0F172A] shrink-0">
          <span className="w-[26px] h-[26px] rounded-[6px] bg-[#2563EB] text-white flex items-center justify-center">
            <Store className="w-3.5 h-3.5" />
          </span>
          <span>RETAIL DEMO</span>
        </div>

        {pageTitle && (
          <span className="hidden sm:inline-block text-[13px] font-medium text-[#64748B] border-l border-[#E2E8F0] pl-3 truncate">
            {pageTitle}
          </span>
        )}
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[12px] text-[#334155]">
          <User className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold text-[#0F172A]">
            {currentUser?.fullName ?? 'Admin'}
          </span>
          <span className="text-[#64748B]">({currentUser?.email})</span>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="h-[34px] px-3 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
