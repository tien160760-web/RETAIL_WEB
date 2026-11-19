import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import { EXPO_EASE, SPRING_PILL } from '../ui/MotionPrimitives';

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

  const renderNavItems = (isCompact: boolean, pillScope: string, onSelect?: () => void) => (
    <nav aria-label="Menu quản trị" className="space-y-4 flex-1 overflow-y-auto admin-scroll pr-0.5">
      {visibleGroups.map((group) => (
        <div key={group.id}>
          {!isCompact ? (
            <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B] truncate">
              {group.title}
            </p>
          ) : (
            <div className="mx-auto my-2 w-6 h-[1px] bg-[#DBEAFE]" />
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
                    `group relative w-full h-[38px] rounded-[11px] flex items-center text-[12px] transition-colors duration-200 whitespace-nowrap overflow-hidden ${
                      isCompact ? 'justify-center px-0' : 'gap-2.5 px-2.5'
                    } ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-[#334155] font-medium hover:bg-white/80 hover:text-[#1D4ED8]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId={`sidebar-active-pill-${pillScope}`}
                          transition={SPRING_PILL}
                          className="absolute inset-0 rounded-[11px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_6px_18px_-3px_rgba(37,99,235,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]"
                        />
                      )}
                      <Icon
                        className={`relative z-10 w-[16px] h-[16px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'text-white'
                            : 'text-[#64748B] group-hover:text-[#2563EB]'
                        }`}
                      />
                      {!isCompact && (
                        <span className="relative z-10 truncate">{item.label}</span>
                      )}
                    </>
                  )}
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
      {/* Desktop Collapsible Sidebar (lg+) */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 222 }}
        transition={{ duration: 0.28, ease: EXPO_EASE }}
        className="hidden lg:flex shrink-0 h-full bg-white/65 backdrop-blur-xl border-r border-white/85 flex-col px-2.5 pt-3.5 pb-3 select-none shadow-[4px_0_24px_-12px_rgba(37,99,235,0.12)] overflow-hidden"
      >
        {renderNavItems(collapsed, 'desktop')}

        <div className="pt-2.5 mt-2 border-t border-[#DBEAFE]/80 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Mở rộng thanh công cụ' : 'Thu gọn thanh công cụ'}
            className={`w-full h-[34px] rounded-[10px] btn-glass flex items-center text-[11.5px] font-bold text-[#334155] cursor-pointer ${
              collapsed ? 'justify-center px-0' : 'justify-between px-3'
            }`}
          >
            {!collapsed && <span className="truncate">Thu gọn menu</span>}
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#2563EB]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#2563EB]" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile / Tablet Slide-in Drawer (< lg) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-[#0B1736]/45 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: EXPO_EASE }}
              className="relative z-10 w-[264px] max-w-[82vw] h-full bg-white/95 backdrop-blur-2xl border-r border-[#DBEAFE] flex flex-col px-3.5 py-4 shadow-[12px_0_40px_rgba(15,23,42,0.25)] select-none"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DBEAFE]">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(37,99,235,0.4)]">
                    <Store className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[14px] font-extrabold text-[#0F172A]">
                    RETAIL
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label="Đóng thanh menu"
                  className="w-8 h-8 rounded-[9px] btn-glass flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#475569]" />
                </button>
              </div>

              {renderNavItems(false, 'mobile', onCloseMobile)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
