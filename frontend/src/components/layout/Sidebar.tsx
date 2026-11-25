import { NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  ShoppingBag,
  Store,
  TicketPercent,
  Users,
  X,
} from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext';
import { SIDEBAR_GROUPS } from '../../data/mockDashboardData';
import { SidebarMenuItem } from '../../types/dashboard';

const MENU_ICONS: Record<SidebarMenuItem['id'], React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  catalog: PackageSearch,
  vouchers: TicketPercent,
  suppliers: Building2,
  procurement: ClipboardList,
  inventory: Boxes,
  'warehouse-tickets': ArrowLeftRight,
  orders: ShoppingBag,
  organization: Users,
};

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { roleConfig } = useAdminContext();

  const visibleGroups = SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      roleConfig.allowedMenuIds.includes(item.id)
    ),
  })).filter((group) => group.items.length > 0);

  const renderNavItems = (isCompact: boolean, onSelect?: () => void) => (
    <nav aria-label="Menu quản trị" className="space-y-4 flex-1 overflow-y-auto admin-scroll pr-0.5">
      {visibleGroups.map((group) => (
        <div key={group.id}>
          {!isCompact ? (
            <p className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] truncate">
              {group.title}
            </p>
          ) : (
            <div className="mx-auto my-2 w-6 h-[1px] bg-[#E2E8F0]" />
          )}

          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = MENU_ICONS[item.id];
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onSelect}
                  title={isCompact ? item.label : undefined}
                  className={({ isActive }) =>
                    `w-full h-[36px] rounded-[8px] flex items-center text-[12.5px] transition-colors whitespace-nowrap ${
                      isCompact ? 'justify-center px-0' : 'gap-2.5 px-2.5'
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
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 220 }}
        className="hidden lg:flex shrink-0 h-full bg-white border-r border-[#E2E8F0] flex-col px-2.5 py-3 select-none transition-[width] duration-150 overflow-hidden"
      >
        {renderNavItems(collapsed)}

        <div className="pt-2.5 mt-2 border-t border-[#E2E8F0] shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            className={`w-full h-[32px] rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center text-[11.5px] font-semibold text-[#334155] cursor-pointer ${
              collapsed ? 'justify-center px-0' : 'justify-between px-2.5'
            }`}
          >
            {!collapsed && <span className="truncate">Thu gọn</span>}
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
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40"
          />
          <aside className="relative z-10 w-[250px] max-w-[82vw] h-full bg-white border-r border-[#E2E8F0] flex flex-col px-3 py-3.5 shadow-lg select-none">
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
