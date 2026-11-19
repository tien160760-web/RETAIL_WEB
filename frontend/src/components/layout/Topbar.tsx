import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Lock,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Store,
  User,
  Check,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext';
import {
  QUICK_SEARCH_ITEMS,
  ROLES,
  SYSTEM_NOTIFICATIONS,
} from '../../data/mockDashboardData';
import { BranchId, UserRole } from '../../types/dashboard';

type OpenMenu = 'branch' | 'role' | 'bell' | 'account' | 'search' | null;

interface TopbarProps {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({
  isSidebarCollapsed,
  isMobileMenuOpen,
  onToggleSidebar,
}: TopbarProps) {
  const navigate = useNavigate();
  const {
    role,
    roleConfig,
    setRole,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    isBranchLocked,
    quickSearch,
    setQuickSearch,
    getBranchLabel,
    logout,
  } = useAdminContext();

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase();
    if (!q) return QUICK_SEARCH_ITEMS;
    return QUICK_SEARCH_ITEMS.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.meta.toLowerCase().includes(q)
    );
  }, [quickSearch]);

  const branchDisplayText = useMemo(() => {
    if (selectedBranchId === 'all') return 'Chi nhánh: Tất cả';
    const found = branches.find((b) => b.id === selectedBranchId);
    return found ? found.name : getBranchLabel(selectedBranchId);
  }, [selectedBranchId, branches, getBranchLabel]);

  return (
    <div
      ref={containerRef}
      className="h-[58px] w-full shrink-0 bg-white/80 backdrop-blur-xl border-b border-[#DBEAFE] px-4 flex items-center justify-between gap-3 relative z-30 shadow-[0_4px_20px_-8px_rgba(37,99,235,0.1)]"
    >
      {/* Left: Toggle Sidebar + Logo + Quick Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Đóng/mở thanh công cụ bên trái"
          title={
            isSidebarCollapsed
              ? 'Mở rộng thanh công cụ bên trái'
              : 'Thu gọn thanh công cụ bên trái'
          }
          className="w-[36px] h-[36px] rounded-[10px] btn-glass flex items-center justify-center cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 text-[#2563EB] lg:hidden" />
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#2563EB] hidden lg:block" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[#2563EB] hidden lg:block" />
          )}
          <span className="sr-only">
            {isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="h-[36px] px-2.5 pr-3 rounded-[10px] bg-white/90 border border-[#DBEAFE] hover:border-[#60A5FA] hover:shadow-[0_6px_16px_-4px_rgba(37,99,235,0.22)] flex items-center gap-2 text-[13px] font-extrabold text-[#0F172A] transition-all duration-200 cursor-pointer shrink-0 group"
          title="Về Dashboard & Báo cáo kinh doanh"
        >
          <span className="w-[24px] h-[24px] rounded-[7px] bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform">
            <Store className="w-3.5 h-3.5" />
          </span>
          <span className="tracking-tight text-[#0F172A]">RETAIL</span>
        </button>

        {/* Quick Search */}
        <div className="hidden md:block relative flex-1 max-w-[300px] min-w-[150px]">
          <div className="w-full h-[36px] rounded-[10px] bg-white/85 border border-[#CBD5E1]/90 hover:border-[#93C5FD] focus-within:bg-white focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] px-3 flex items-center gap-2 transition-all duration-200">
            <Search className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
            <input
              type="text"
              value={quickSearch}
              onFocus={() => setOpenMenu('search')}
              onChange={(e) => {
                setQuickSearch(e.target.value);
                setOpenMenu('search');
              }}
              placeholder="Tìm nhanh (SKU, mã đơn, phiếu...)"
              className="w-full min-w-0 bg-transparent text-[12px] text-[#0F172A] placeholder:text-[#64748B] outline-none"
            />
            {quickSearch && (
              <button
                type="button"
                onClick={() => setQuickSearch('')}
                className="text-[11px] text-[#64748B] hover:text-[#1D4ED8] px-1 cursor-pointer shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          {openMenu === 'search' && (
            <div className="absolute left-0 top-[42px] w-[380px] max-w-[90vw] glass-popover rounded-[12px] overflow-hidden z-50">
              <div className="px-3.5 py-2.5 bg-[#EFF6FF]/70 border-b border-[#DBEAFE] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wide">
                  Tra cứu nhanh SKU · Đơn hàng · Phiếu kho
                </span>
                <span className="text-[11px] font-medium text-[#3B82F6]">
                  {searchResults.length} kết quả
                </span>
              </div>
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-[#64748B]">
                  Không tìm thấy mã phù hợp với &ldquo;{quickSearch}&rdquo;.
                </div>
              ) : (
                <ul className="divide-y divide-[#EFF6FF] max-h-[260px] overflow-y-auto admin-scroll">
                  {searchResults.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          navigate(item.targetPath);
                        }}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-[#EFF6FF]/70 flex items-start justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold bg-[#DBEAFE]/80 text-[#1D4ED8]">
                              {item.type}
                            </span>
                            <span className="font-mono text-[12px] font-semibold text-[#0F172A]">
                              {item.code}
                            </span>
                          </div>
                          <p className="text-[12px] font-medium text-[#334155] truncate mt-0.5">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {item.meta}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#2563EB] shrink-0 mt-1">
                          Mở →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Branch Dropdown */}
        <div className="hidden sm:block relative">
          <button
            type="button"
            disabled={isBranchLocked}
            onClick={() =>
              setOpenMenu((prev) => (prev === 'branch' ? null : 'branch'))
            }
            title={
              isBranchLocked
                ? 'Chi nhánh bị khóa theo vai trò được phân công'
                : 'Chọn phạm vi chi nhánh hiển thị'
            }
            className={`w-[172px] xl:w-[196px] h-[36px] rounded-[10px] px-2.5 flex items-center justify-between text-[12px] font-medium transition-all duration-200 ${
              isBranchLocked
                ? 'bg-[#F1F5F9]/80 border border-[#CBD5E1] text-[#64748B] cursor-not-allowed'
                : openMenu === 'branch'
                  ? 'bg-white border border-[#2563EB] text-[#1D4ED8] shadow-[0_0_0_3px_rgba(37,99,235,0.14)] cursor-pointer'
                  : 'btn-glass cursor-pointer'
            }`}
          >
            <span className="truncate flex items-center gap-1.5">
              {isBranchLocked && (
                <Lock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              )}
              <span className="truncate">{branchDisplayText}</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform duration-200 ${
                openMenu === 'branch' ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
              }`}
            />
          </button>

          {openMenu === 'branch' && !isBranchLocked && (
            <div className="absolute right-0 top-[42px] w-[240px] glass-popover rounded-[12px] py-1.5 z-50">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6] border-b border-[#EFF6FF]">
                Phạm vi Chi nhánh
              </div>
              {(
                [
                  { id: 'all' as BranchId, label: 'Chi nhánh: Tất cả (Hệ thống)' },
                  ...branches.map((b) => ({ id: b.id as BranchId, label: b.name })),
                ]
              ).map((option) => {
                const active = selectedBranchId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedBranchId(option.id);
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                      active
                        ? 'font-bold text-[#1D4ED8] bg-[#EFF6FF]'
                        : 'text-[#334155] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Role Dropdown */}
        <div className="hidden md:block relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'role' ? null : 'role'))
            }
            className={`w-[166px] xl:w-[186px] h-[36px] rounded-[10px] px-2.5 flex items-center justify-between text-[12px] font-medium transition-all duration-200 cursor-pointer ${
              openMenu === 'role'
                ? 'bg-white border border-[#2563EB] text-[#1D4ED8] shadow-[0_0_0_3px_rgba(37,99,235,0.14)]'
                : 'btn-glass'
            }`}
          >
            <span className="truncate">{roleConfig.label}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform duration-200 ${
                openMenu === 'role' ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
              }`}
            />
          </button>

          {openMenu === 'role' && (
            <div className="absolute right-0 top-[42px] w-[260px] glass-popover rounded-[12px] py-1.5 z-50">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6] border-b border-[#EFF6FF]">
                Vai trò làm việc
              </div>
              {ROLES.map((item) => {
                const active = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRole(item.id as UserRole);
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                      active ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div>
                      <p
                        className={`text-[12px] ${
                          active ? 'font-bold text-[#1D4ED8]' : 'font-medium text-[#0F172A]'
                        }`}
                      >
                        {item.shortLabel}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.userTitle}</p>
                    </div>
                    {active && <Check className="w-3.5 h-3.5 text-[#2563EB] mt-0.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bell Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'bell' ? null : 'bell'))
            }
            aria-label="Thông báo hệ thống"
            className={`w-[38px] h-[36px] rounded-[10px] flex items-center justify-center relative transition-all duration-200 cursor-pointer ${
              openMenu === 'bell'
                ? 'bg-white border border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.14)]'
                : 'btn-glass'
            }`}
          >
            <Bell className="w-4 h-4 text-[#2563EB]" />
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
          </button>

          {openMenu === 'bell' && (
            <div className="absolute right-0 top-[42px] w-[340px] glass-popover rounded-[12px] overflow-hidden z-50">
              <div className="px-3.5 py-2.5 bg-[#EFF6FF]/75 border-b border-[#DBEAFE] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#0F172A]">
                  Cảnh báo &amp; Thông báo (3)
                </span>
                <span className="text-[11px] text-[#2563EB] font-semibold">
                  Thời gian thực
                </span>
              </div>
              <ul className="divide-y divide-[#EFF6FF]">
                {SYSTEM_NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="px-3.5 py-2.5 hover:bg-[#EFF6FF]/50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          n.level === 'danger'
                            ? 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                            : n.level === 'warning'
                              ? 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                              : 'bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.6)]'
                        }`}
                      />
                      <div>
                        <p className="text-[12px] font-semibold text-[#0F172A]">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                          {n.detail}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">{n.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Account Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'account' ? null : 'account'))
            }
            className={`h-[36px] rounded-[10px] px-2.5 flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              openMenu === 'account'
                ? 'bg-white border border-[#2563EB] text-[#1D4ED8] shadow-[0_0_0_3px_rgba(37,99,235,0.14)]'
                : 'btn-glass'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center shrink-0">
              <User className="w-3 h-3" />
            </span>
            <span>Tài khoản</span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                openMenu === 'account' ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
              }`}
            />
          </button>

          {openMenu === 'account' && (
            <div className="absolute right-0 top-[42px] w-[250px] glass-popover rounded-[12px] overflow-hidden z-50">
              <div className="px-4 py-3 bg-[#EFF6FF]/75 border-b border-[#DBEAFE]">
                <p className="text-[12.5px] font-bold text-[#0F172A]">
                  {roleConfig.userName}
                </p>
                <p className="text-[11px] text-[#475569] mt-0.5">
                  {roleConfig.userTitle}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.35)]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{roleConfig.shortLabel}</span>
                </div>
              </div>
              <div className="p-1.5">
                {role !== 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRole('ADMIN');
                      setOpenMenu(null);
                      navigate('/');
                    }}
                    className="w-full px-3 py-2 rounded-[8px] text-left text-[12px] font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                  >
                    Quay lại vai trò Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-3 py-2 rounded-[8px] text-left text-[12px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
