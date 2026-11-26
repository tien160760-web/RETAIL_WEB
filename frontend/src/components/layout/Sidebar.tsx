import { NavLink } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Package,
  Store,
  Users,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const DEMO_MENUS = [
  {
    id: 'products',
    label: 'Sản phẩm',
    path: '/products',
    icon: Package,
  },
  {
    id: 'suppliers',
    label: 'Nhà cung cấp',
    path: '/suppliers',
    icon: Building2,
  },
  {
    id: 'staff',
    label: 'Quản lý nhân viên',
    path: '/staff',
    icon: Users,
  },
];

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const renderNavItems = (isCompact: boolean, onSelect?: () => void) => (
    <nav className="space-y-1 flex-1">
      {!isCompact && (
        <p className="px-2.5 mb-2 text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
          Chức năng Demo
        </p>
      )}
      {DEMO_MENUS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onSelect}
            title={isCompact ? item.label : undefined}
            className={({ isActive }) =>
              `w-full h-[38px] rounded-[8px] flex items-center text-[13px] transition-colors ${
                isCompact ? 'justify-center px-0' : 'gap-2.5 px-3'
              } ${
                isActive
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-[#334155] font-medium hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!isCompact && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 210 }}
        className="hidden lg:flex shrink-0 h-full bg-white border-r border-[#E2E8F0] flex-col px-2.5 py-3 select-none transition-[width] duration-150 overflow-hidden"
      >
        {renderNavItems(collapsed)}

        <div className="pt-2.5 mt-2 border-t border-[#E2E8F0] shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full h-[32px] rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center text-[11.5px] font-semibold text-[#334155] cursor-pointer ${
              collapsed ? 'justify-center px-0' : 'justify-between px-2.5'
            }`}
          >
            {!collapsed && <span>Thu gọn menu</span>}
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#475569]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#475569]" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={onCloseMobile} className="fixed inset-0 bg-black/40" />
          <aside className="relative z-10 w-[230px] max-w-[80vw] h-full bg-white border-r border-[#E2E8F0] flex flex-col px-3 py-3.5 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[6px] bg-[#2563EB] text-white flex items-center justify-center">
                  <Store className="w-3.5 h-3.5" />
                </span>
                <span className="text-[13.5px] font-bold text-[#0F172A]">
                  RETAIL DEMO
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-7 h-7 rounded-[6px] border border-[#CBD5E1] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-[#475569]" />
              </button>
            </div>
            {renderNavItems(false, onCloseMobile)}
          </aside>
        </div>
      )}
    </>
  );
}
