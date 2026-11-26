import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  Users,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { ROLES } from '../data/mockDashboardData';
import { StaffAccount, UserRole } from '../types/dashboard';

export function OrganizationPage() {
  const {
    branches,
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    toggleStaffStatus,
    getBranchLabel,
  } = useAdminContext();

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
    <div className="space-y-4">
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-[8px] shadow-md flex items-center gap-2 text-[12.5px]">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {bannerErr && (
        <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-between text-[12.5px] text-[#991B1B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{bannerErr}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerErr(null)}
            className="text-[11px] font-bold underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">
            Quản lý Nhân viên ({staffAccounts.length})
          </h2>
          <p className="text-[12.5px] text-[#64748B]">
            Tạo tài khoản nhân viên, phân quyền vai trò, gán chi nhánh và khóa/mở tài khoản
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateStaff}
          className="h-[36px] px-3.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[680px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11.5px] font-bold text-[#475569] h-[40px]">
              <th className="px-4">Họ và tên</th>
              <th className="px-4">Email đăng nhập</th>
              <th className="px-4">Số điện thoại</th>
              <th className="px-4">Vai trò</th>
              <th className="px-4">Chi nhánh</th>
              <th className="px-4 text-center">Trạng thái</th>
              <th className="px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
            {staffAccounts.map((s) => (
              <tr key={s.id} className="hover:bg-[#F8FAFC] h-[52px]">
                <td className="px-4 font-semibold text-[#0F172A]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#64748B] shrink-0" />
                    <span>{s.fullName}</span>
                  </div>
                </td>
                <td className="px-4 font-mono text-[12px] text-[#2563EB]">
                  {s.email}
                </td>
                <td className="px-4 text-[#334155]">{s.phone}</td>
                <td className="px-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[11.5px] font-semibold">
                    {getRoleLabel(s.role)}
                  </span>
                </td>
                <td className="px-4 text-[#475569]">
                  {s.branchId ? getBranchLabel(s.branchId) : 'Toàn hệ thống'}
                </td>
                <td className="px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      s.isActive
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}
                  >
                    {s.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditStaff(s)}
                      className="h-[28px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-medium text-[#334155] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
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
                      className="h-[28px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-medium text-[#475569] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{s.isActive ? 'Khóa' : 'Mở'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[460px] rounded-[10px] border border-[#CBD5E1] shadow-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {editingStaff ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-3.5">
              {staffErr && (
                <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{staffErr}</span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Họ và tên nhân viên *
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Nguyễn Văn B"
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="staff@retail.vn"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="text"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="123"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Vai trò
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as UserRole)}
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-2.5 text-[13px] outline-none focus:border-[#2563EB]"
                  >
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                    <option value="BRANCH_MANAGER">Quản lý chi nhánh</option>
                    <option value="WAREHOUSE_STAFF">Nhân viên kho</option>
                    <option value="SALES_STAFF">Nhân viên bán hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Chi nhánh làm việc
                  </label>
                  <select
                    value={staffBranchId}
                    disabled={staffRole === 'ADMIN'}
                    onChange={(e) => setStaffBranchId(e.target.value)}
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-2.5 text-[13px] outline-none focus:border-[#2563EB] disabled:bg-[#F1F5F9] disabled:text-[#64748B]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[12.5px] font-semibold text-[#334155] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold cursor-pointer"
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
