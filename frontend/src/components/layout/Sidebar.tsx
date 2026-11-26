import { NavLink } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext';
import { ROLES } from '../../data/mockDashboardData';
import { UserRole } from '../../types/dashboard';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface MenuItemDef {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  allowedRoles: UserRole[];
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { currentUser, products, suppliers, staffAccounts } = useAdminContext();
  const currentRole: UserRole = currentUser?.role ?? 'SALES_STAFF';
  const roleLabel =
    ROLES.find((r) => r.id === currentRole)?.shortLabel ?? currentRole;

  const allNavItems: MenuItemDef[] = [
    {
      id: 'products',
      label: currentRole === 'ADMIN' ? 'Sản phẩm & Danh mục' : 'Tra cứu Sản phẩm',
      path: '/products',
      icon: Package,
      count: products.length,
      allowedRoles: ['ADMIN', 'BRANCH_MANAGER', 'WAREHOUSE_STAFF', 'SALES_STAFF'],
    },
    {
      id: 'suppliers',
      label: 'Nhà cung cấp',
      path: '/suppliers',
      icon: Building2,
      count: suppliers.length,
      allowedRoles: ['ADMIN', 'BRANCH_MANAGER'],
    },
    {
      id: 'staff',
      label: 'Quản lý Nhân viên',
      path: '/staff',
      icon: Users,
      count: staffAccounts.length,
      allowedRoles: ['ADMIN'],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  const renderNavItems = (isCompact: boolean, onSelect?: () => void) => (
    <nav className="space-y-1.5 flex-1">
      {!isCompact && (
        <div className="px-3 mb-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A]">
            Danh mục quản lý
          </p>
          <p className="text-[11px] text-[#2563EB] font-medium flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span className="truncate">{roleLabel}</span>
          </p>
        </div>
      )}

      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onSelect}
            title={isCompact ? `${item.label} (${item.count})` : undefined}
            className={({ isActive }) =>
              `group relative w-full h-[40px] rounded-[8px] flex items-center justify-between text-[13px] transition-all ${
                isCompact ? 'justify-center px-0' : 'px-3'
              } ${
                isActive
                  ? 'bg-[#F4F4F5] text-[#09090B] font-semibold shadow-[inset_0_0_0_1px_#E4E4E7]'
                  : 'text-[#52525B] font-medium hover:bg-[#F4F4F5]/60 hover:text-[#09090B]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCompact && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#2563EB]" />
                )}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#2563EB]'
                        : 'text-[#71717A] group-hover:text-[#18181B]'
                    }`}
                  />
                  {!isCompact && <span className="truncate">{item.label}</span>}
                </div>
                {!isCompact && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-[5px] text-[11px] font-mono tabular-nums shrink-0 ${
                      isActive
                        ? 'bg-white text-[#18181B] border border-[#E4E4E7] font-semibold'
                        : 'text-[#71717A]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{ width: collapsed ? 64 : 240 }}
        className="hidden lg:flex shrink-0 h-full bg-white border-r border-[#E4E4E7] flex-col px-2.5 py-4 select-none transition-[width] duration-150 overflow-hidden"
      >
        {renderNavItems(collapsed)}

        <div className="pt-3 mt-2 border-t border-[#E4E4E7] shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full h-[34px] rounded-[8px] border border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#F4F4F5] flex items-center text-[12px] font-medium text-[#52525B] hover:text-[#09090B] transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-0' : 'justify-between px-3'
            }`}
          >
            {!collapsed && <span>Thu gọn thanh bên</span>}
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#71717A]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#71717A]" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
          />
          <aside className="relative z-10 w-[256px] max-w-[82vw] h-full bg-white border-r border-[#E4E4E7] flex flex-col px-3 py-4 shadow-xl">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E4E4E7]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-[7px] bg-[#18181B] text-white flex items-center justify-center">
                  <Store className="w-3.5 h-3.5" />
                </span>
                <span className="text-[13.5px] font-bold tracking-tight text-[#09090B]">
                  RETAIL_WEB
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-7 h-7 rounded-[6px] border border-[#E4E4E7] hover:bg-[#F4F4F5] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-[#52525B]" />
              </button>
            </div>
            {renderNavItems(false, onCloseMobile)}
          </aside>
        </div>
      )}
    </>
  );
}
