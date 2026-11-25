import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Lock,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Store,
  User,
  Check,
  LogOut,
} from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext';
import {
  QUICK_SEARCH_ITEMS,
  ROLES,
} from '../../data/mockDashboardData';
import { BranchId, UserRole } from '../../types/dashboard';

type OpenMenu = 'branch' | 'role' | 'account' | 'search' | null;

interface TopbarProps {
  pageTitle?: string;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({
  pageTitle,
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
    <header
      ref={containerRef}
      className="h-[54px] w-full shrink-0 bg-white border-b border-[#E2E8F0] px-3 sm:px-4 flex items-center justify-between gap-3 relative z-30"
    >
      {/* Left: Toggle Sidebar + Logo + Page Title + Quick Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Đóng/mở thanh công cụ bên trái"
          title={
            isSidebarCollapsed
              ? 'Mở rộng thanh menu'
              : 'Thu gọn thanh menu'
          }
          className="w-[34px] h-[34px] rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] flex items-center justify-center cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 text-[#334155] lg:hidden" />
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#334155] hidden lg:block" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[#334155] hidden lg:block" />
          )}
          <span className="sr-only">
            {isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[13.5px] font-bold text-[#0F172A] cursor-pointer shrink-0"
        >
          <span className="w-[26px] h-[26px] rounded-[6px] bg-[#2563EB] text-white flex items-center justify-center">
            <Store className="w-3.5 h-3.5" />
          </span>
          <span>RETAIL DEMO</span>
        </button>

        {pageTitle && (
          <span className="hidden lg:inline-block text-[12.5px] text-[#64748B] border-l border-[#E2E8F0] pl-3 truncate">
            {pageTitle}
          </span>
        )}

        {/* Quick Search */}
        <div className="hidden md:block relative flex-1 max-w-[260px] min-w-[140px] ml-1">
          <div className="w-full h-[34px] rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] focus-within:bg-white focus-within:border-[#2563EB] px-2.5 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <input
              type="text"
              value={quickSearch}
              onFocus={() => setOpenMenu('search')}
              onChange={(e) => {
                setQuickSearch(e.target.value);
                setOpenMenu('search');
              }}
              placeholder="Tìm nhanh SKU, đơn, phiếu..."
              className="w-full min-w-0 bg-transparent text-[12px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
            />
            {quickSearch && (
              <button
                type="button"
                onClick={() => setQuickSearch('')}
                className="text-[11px] text-[#64748B] hover:text-[#0F172A] px-1 cursor-pointer shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          {openMenu === 'search' && (
            <div className="absolute left-0 top-[40px] w-[340px] max-w-[90vw] glass-popover rounded-[8px] overflow-hidden z-50">
              <div className="px-3 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] font-semibold text-[#475569]">
                <span>Kết quả tra cứu nhanh</span>
                <span>{searchResults.length} mục</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="px-4 py-4 text-center text-[12px] text-[#64748B]">
                  Không tìm thấy &ldquo;{quickSearch}&rdquo;
                </div>
              ) : (
                <ul className="divide-y divide-[#F1F5F9] max-h-[240px] overflow-y-auto admin-scroll">
                  {searchResults.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          navigate(item.targetPath);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#F8FAFC] flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8]">
                              {item.type}
                            </span>
                            <span className="font-mono text-[12px] font-semibold text-[#0F172A]">
                              {item.code}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[#475569] truncate mt-0.5">
                            {item.title}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#2563EB] shrink-0">
                          Mở
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

      {/* Right Controls: Branch + Role + Account */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Branch Dropdown */}
        <div className="hidden sm:block relative">
          <button
            type="button"
            disabled={isBranchLocked}
            onClick={() =>
              setOpenMenu((prev) => (prev === 'branch' ? null : 'branch'))
            }
            className={`h-[34px] rounded-[8px] px-2.5 flex items-center justify-between gap-1.5 text-[12px] font-medium border ${
              isBranchLocked
                ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B] cursor-not-allowed'
                : 'bg-white border-[#CBD5E1] text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer'
            }`}
          >
            <span className="truncate max-w-[140px] flex items-center gap-1">
              {isBranchLocked && (
                <Lock className="w-3 h-3 text-[#D97706] shrink-0" />
              )}
              <span className="truncate">{branchDisplayText}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          </button>

          {openMenu === 'branch' && !isBranchLocked && (
            <div className="absolute right-0 top-[40px] w-[220px] glass-popover rounded-[8px] py-1 z-50">
              {(
                [
                  { id: 'all' as BranchId, label: 'Tất cả chi nhánh' },
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
                    className={`w-full px-3 py-2 text-left text-[12px] flex items-center justify-between cursor-pointer ${
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

        {/* Role Switcher */}
        <div className="hidden md:block relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'role' ? null : 'role'))
            }
            className="h-[34px] rounded-[8px] px-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] flex items-center justify-between gap-1.5 text-[12px] font-medium text-[#1E293B] cursor-pointer"
          >
            <span className="truncate max-w-[140px]">{roleConfig.shortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          </button>

          {openMenu === 'role' && (
            <div className="absolute right-0 top-[40px] w-[230px] glass-popover rounded-[8px] py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#64748B] border-b border-[#F1F5F9]">
                Đổi vai trò Demo
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
                    className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer ${
                      active ? 'bg-[#EFF6FF] text-[#1D4ED8] font-bold' : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                    }`}
                  >
                    <span className="text-[12px]">{item.shortLabel}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Account & Logout */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'account' ? null : 'account'))
            }
            className="h-[34px] rounded-[8px] px-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] flex items-center gap-1.5 text-[12px] font-semibold text-[#0F172A] cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline">{roleConfig.userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {openMenu === 'account' && (
            <div className="absolute right-0 top-[40px] w-[210px] glass-popover rounded-[8px] overflow-hidden z-50">
              <div className="px-3 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <p className="text-[12px] font-bold text-[#0F172A]">
                  {roleConfig.userName}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  {roleConfig.shortLabel}
                </p>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-3 py-2 rounded-[6px] text-left text-[12px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
