import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { ROLES } from '../data/mockDashboardData';
import { StaffAccount, UserRole } from '../types/dashboard';

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  ADMIN: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  BRANCH_MANAGER: 'bg-[#F3E8FF] text-[#6D28D9] border-[#DDD6FE]',
  WAREHOUSE_STAFF: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  SALES_STAFF: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
};

const AVATAR_STYLES: Record<UserRole, string> = {
  ADMIN: 'bg-[#1D4ED8] text-white',
  BRANCH_MANAGER: 'bg-[#6D28D9] text-white',
  WAREHOUSE_STAFF: 'bg-[#D97706] text-white',
  SALES_STAFF: 'bg-[#0284C7] text-white',
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return 'NV';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function OrganizationPage() {
  const {
    branches,
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    toggleStaffStatus,
    getBranchLabel,
  } = useAdminContext();

  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('123');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('SALES_STAFF');
  const [staffBranchId, setStaffBranchId] = useState<string>('cn-hn');
  const [staffErr, setStaffErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setBannerErr(null);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const activeStaffCount = useMemo(
    () => staffAccounts.filter((s) => s.isActive).length,
    [staffAccounts]
  );
  const lockedStaffCount = staffAccounts.length - activeStaffCount;

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staffAccounts.filter((s) => {
      if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
      if (!q) return true;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
      );
    });
  }, [staffAccounts, roleFilter, searchQuery]);

  const openCreateStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('123');
    setStaffPhone('');
    setStaffRole('SALES_STAFF');
    setStaffBranchId(branches[0]?.id ?? 'cn-hn');
    setStaffErr(null);
    setIsStaffModalOpen(true);
  };

  const openEditStaff = (s: StaffAccount) => {
    setEditingStaff(s);
    setStaffName(s.fullName);
    setStaffEmail(s.email);
    setStaffPassword(s.password);
    setStaffPhone(s.phone);
    setStaffRole(s.role);
    setStaffBranchId(s.branchId ?? branches[0]?.id ?? 'cn-hn');
    setStaffErr(null);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffErr(null);
    const cleanEmail = staffEmail.trim().toLowerCase();
    if (!staffName.trim() || !cleanEmail || !staffPhone.trim()) {
      setStaffErr('Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.');
      return;
    }
    if (
      staffAccounts.some(
        (s) => s.email.toLowerCase() === cleanEmail && s.id !== editingStaff?.id
      )
    ) {
      setStaffErr(`Email "${cleanEmail}" đã tồn tại trong hệ thống.`);
      return;
    }

    const branchVal = staffRole === 'ADMIN' ? null : staffBranchId;

    if (editingStaff) {
      updateStaffAccount(editingStaff.id, {
        fullName: staffName.trim(),
        email: cleanEmail,
        password: staffPassword.trim() || '123',
        phone: staffPhone.trim(),
        role: staffRole,
        branchId: branchVal,
      });
      showToast(`Đã cập nhật nhân viên "${staffName.trim()}".`);
    } else {
      addStaffAccount({
        fullName: staffName.trim(),
        email: cleanEmail,
        password: staffPassword.trim() || '123',
        phone: staffPhone.trim(),
        role: staffRole,
        branchId: branchVal,
        isActive: true,
      });
      showToast(`Đã thêm nhân viên mới "${staffName.trim()}".`);
    }
    setIsStaffModalOpen(false);
  };

  const getRoleLabel = (r: UserRole) =>
    ROLES.find((item) => item.id === r)?.shortLabel ?? r;

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-[10px] shadow-lg border border-white/10 flex items-center gap-2.5 text-[13px] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Unboxed Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#09090B]">
            Nhân sự &amp; Phân quyền (RBAC)
          </h1>
          <p className="text-[13px] text-[#71717A] mt-0.5">
            Quản lý tài khoản nhân viên, gán vai trò nghiệp vụ và phân công phạm vi chi nhánh
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateStaff}
          className="h-[36px] px-4 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Tổng nhân sự</span>
            <Users className="w-4 h-4 text-[#71717A]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {staffAccounts.length}
          </p>
          <p className="text-[11.5px] text-[#71717A] mt-0.5">
            Tài khoản nội bộ hệ thống
          </p>
        </div>

        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Đang hoạt động</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {activeStaffCount}
          </p>
          <p className="text-[11.5px] text-[#15803D] font-medium mt-0.5">
            Được phép truy cập hệ thống
          </p>
        </div>

        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Tài khoản bị khóa</span>
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {lockedStaffCount}
          </p>
          <p className="text-[11.5px] text-[#71717A] mt-0.5">
            Đã thu hồi quyền đăng nhập
          </p>
        </div>

        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Chi nhánh vận hành</span>
            <Building className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {branches.length}
          </p>
          <p className="text-[11.5px] text-[#2563EB] font-medium mt-0.5">
            Hà Nội · Đà Nẵng · TP.HCM
          </p>
        </div>
      </div>

      {bannerErr && (
        <div className="p-3.5 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-[13px] text-[#991B1B]">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{bannerErr}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerErr(null)}
            className="text-[12px] font-semibold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Unified Polaris Table Card */}
      <div className="polaris-card overflow-hidden">
        {/* Integrated Filter Toolbar (Role Tabs + Search) */}
        <div className="px-4 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: 'ALL', label: 'Tất cả vai trò' },
                { id: 'ADMIN', label: 'Admin' },
                { id: 'BRANCH_MANAGER', label: 'Quản lý CN' },
                { id: 'WAREHOUSE_STAFF', label: 'NV Kho' },
                { id: 'SALES_STAFF', label: 'NV Bán hàng' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRoleFilter(t.id)}
                className={`h-[30px] px-3 rounded-[7px] text-[12.5px] font-medium transition-all cursor-pointer ${
                  roleFilter === t.id
                    ? 'bg-[#18181B] text-white font-semibold shadow-2xs'
                    : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-[34px] w-full sm:w-[250px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] px-2.5 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm họ tên, email, SĐT..."
              className="w-full bg-transparent text-[12.5px] text-[#09090B] placeholder:text-[#A1A1AA] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[720px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#71717A] h-[40px]">
                <th className="px-5">Nhân viên</th>
                <th className="px-4">Liên hệ</th>
                <th className="px-4">Vai trò (Role)</th>
                <th className="px-4">Phạm vi Chi nhánh</th>
                <th className="px-4 text-center">Trạng thái</th>
                <th className="px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7]/80 text-[13px]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-[13.5px] font-semibold text-[#18181B]">
                      Không tìm thấy nhân viên nào
                    </p>
                    <p className="text-[12.5px] text-[#71717A] mt-1">
                      Thử bỏ bộ lọc vai trò hoặc thêm tài khoản nhân sự mới.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#FAFAFA] transition-colors h-[64px]"
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 shadow-2xs ${AVATAR_STYLES[s.role]}`}
                        >
                          {getInitials(s.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#09090B] leading-snug">
                            {s.fullName}
                          </p>
                          <p className="text-[12px] font-mono text-[#71717A]">
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4">
                      <div className="space-y-0.5">
                        <p className="text-[12.5px] font-medium text-[#18181B] flex items-center gap-1.5 tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-[#71717A]" />
                          <span>{s.phone}</span>
                        </p>
                        <p className="text-[11.5px] text-[#71717A] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A1A1AA]" />
                          <span>MK: {s.password}</span>
                        </p>
                      </div>
                    </td>

                    <td className="px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-semibold ${ROLE_BADGE_STYLES[s.role]}`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{getRoleLabel(s.role)}</span>
                      </span>
                    </td>

                    <td className="px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#F4F4F5] border border-[#E4E4E7] text-[12px] font-medium text-[#18181B]">
                        <Building className="w-3.5 h-3.5 text-[#71717A]" />
                        <span>
                          {s.branchId ? getBranchLabel(s.branchId) : 'Toàn hệ thống'}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 text-center">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[11.5px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          <span>Hoạt động</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[11.5px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                          <span>Đã khóa</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditStaff(s)}
                          className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-medium text-[#18181B] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#52525B]" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const res = toggleStaffStatus(s.id);
                            if (!res.ok) {
                              setBannerErr(res.error ?? 'Không thể khóa tài khoản.');
                            } else {
                              showToast(`Đã đổi trạng thái tài khoản "${s.fullName}".`);
                            }
                          }}
                          className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-medium text-[#52525B] hover:text-[#09090B] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{s.isActive ? 'Khóa' : 'Mở'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between text-[12px] text-[#71717A]">
            <span>
              Hiển thị <strong className="text-[#18181B]">{filteredStaff.length}</strong> /{' '}
              <strong className="text-[#18181B]">{staffAccounts.length}</strong> nhân sự
            </span>
            <span>Kiểm soát truy cập theo vai trò (RBAC)</span>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[470px] rounded-[12px] border border-[#E4E4E7] shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#09090B]">
                  {editingStaff ? 'Chỉnh sửa hồ sơ Nhân viên' : 'Thêm Nhân viên mới'}
                </h3>
                <p className="text-[12px] text-[#71717A]">
                  Cấp tài khoản đăng nhập và phân quyền chi nhánh làm việc
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="w-7 h-7 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-4">
              {staffErr && (
                <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-[12.5px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{staffErr}</span>
                </div>
              )}

              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                  Họ và tên nhân viên *
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Nguyễn Văn B"
                  className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="staff@retail.vn"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Mật khẩu cấp
                  </label>
                  <input
                    type="text"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="123"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] font-mono outline-none focus:border-[#18181B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Vai trò nghiệp vụ
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as UserRole)}
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 text-[13px] outline-none focus:border-[#18181B]"
                  >
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                    <option value="BRANCH_MANAGER">Quản lý chi nhánh</option>
                    <option value="WAREHOUSE_STAFF">Nhân viên kho</option>
                    <option value="SALES_STAFF">Nhân viên bán hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Chi nhánh phân công
                  </label>
                  <select
                    value={staffBranchId}
                    disabled={staffRole === 'ADMIN'}
                    onChange={(e) => setStaffBranchId(e.target.value)}
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 text-[13px] outline-none focus:border-[#18181B] disabled:bg-[#F4F4F5] disabled:text-[#71717A]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12.5px] font-medium text-[#18181B] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[12.5px] font-semibold cursor-pointer"
                >
                  {editingStaff ? 'Lưu thay đổi' : 'Thêm nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
