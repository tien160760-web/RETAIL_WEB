import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { ROLES } from '../data/mockDashboardData';
import { BranchOption, StaffAccount, UserRole } from '../types/dashboard';
import { SelectField } from '../components/ui/SelectField';
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
  SPRING_PILL,
} from '../components/ui/MotionPrimitives';

export function OrganizationPage() {
  const {
    branches,
    addBranch,
    updateBranch,
    toggleBranchStatus,
    staffAccounts,
    addStaffAccount,
    updateStaffAccount,
    toggleStaffStatus,
    getBranchLabel,
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState<'staff' | 'branches'>('staff');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bannerErr, setBannerErr] = useState<string | null>(null);

  // Staff modal (UC04)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('123');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('SALES_STAFF');
  const [staffBranchId, setStaffBranchId] = useState<string>('cn-hn');
  const [staffErr, setStaffErr] = useState<string | null>(null);

  // Branch modal (UC26)
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchOption | null>(null);
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchShortName, setBranchShortName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchErr, setBranchErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setBannerErr(null);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 3000);
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
      setStaffErr('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStaffErr('Địa chỉ email không đúng định dạng.');
      return;
    }
    if (
      staffAccounts.some(
        (s) => s.email.toLowerCase() === cleanEmail && s.id !== editingStaff?.id
      )
    ) {
      setStaffErr('Email này đã tồn tại trong hệ thống.');
      return;
    }

    const assignedBranch = staffRole === 'ADMIN' ? null : staffBranchId;
    if (editingStaff) {
      updateStaffAccount(editingStaff.id, {
        fullName: staffName.trim(),
        email: cleanEmail,
        password: staffPassword || '123',
        phone: staffPhone.trim(),
        role: staffRole,
        branchId: assignedBranch,
      });
      showToast(`Đã cập nhật tài khoản nhân viên "${staffName.trim()}".`);
    } else {
      addStaffAccount({
        fullName: staffName.trim(),
        email: cleanEmail,
        password: staffPassword || '123',
        phone: staffPhone.trim(),
        role: staffRole,
        branchId: assignedBranch,
        isActive: true,
      });
      showToast(`Đã tạo tài khoản nhân viên mới "${staffName.trim()}".`);
    }
    setIsStaffModalOpen(false);
  };

  const openCreateBranch = () => {
    setEditingBranch(null);
    setBranchCode('');
    setBranchName('');
    setBranchShortName('');
    setBranchAddress('');
    setBranchPhone('');
    setBranchManager('');
    setBranchErr(null);
    setIsBranchModalOpen(true);
  };

  const openEditBranch = (b: BranchOption) => {
    setEditingBranch(b);
    setBranchCode(b.code);
    setBranchName(b.name);
    setBranchShortName(b.shortName);
    setBranchAddress(b.address);
    setBranchPhone(b.phone);
    setBranchManager(b.managerName);
    setBranchErr(null);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchErr(null);
    if (!branchCode.trim() || !branchName.trim() || !branchAddress.trim() || !branchPhone.trim()) {
      setBranchErr('Vui lòng nhập đầy đủ mã chi nhánh, tên, địa chỉ và số điện thoại.');
      return;
    }
    if (!/^(0|\+84)[0-9]{8,10}$/.test(branchPhone.replace(/\s+/g, ''))) {
      setBranchErr('Số điện thoại chi nhánh không đúng định dạng (10–11 chữ số).');
      return;
    }

    const payload = {
      code: branchCode.trim().toUpperCase(),
      name: branchName.trim(),
      shortName: branchShortName.trim() || branchName.trim(),
      address: branchAddress.trim(),
      phone: branchPhone.trim(),
      managerName: branchManager.trim() || 'Chưa phân công',
      isActive: editingBranch ? editingBranch.isActive : true,
    };

    if (editingBranch) {
      updateBranch(editingBranch.id, payload);
      showToast(`Đã cập nhật thông tin "${payload.name}".`);
    } else {
      addBranch(payload);
      showToast(`Đã thêm chi nhánh mới "${payload.name}".`);
    }
    setIsBranchModalOpen(false);
  };

  const getRoleShortLabel = (r: UserRole) =>
    ROLES.find((item) => item.id === r)?.shortLabel ?? r;

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full space-y-3.5 relative"
    >
      {toastMsg && (
        <div className="fixed bottom-5 right-6 z-50 bg-[#0B1736]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-[12px] shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)] border border-[#60A5FA]/35 flex items-center gap-2 text-[12px] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em]">
            Quản lý Chi nhánh &amp; Phân quyền Nhân viên
          </h2>
          <p className="text-[12px] text-[#475569] mt-0.5">
            Tạo tài khoản nhân viên, gán vai trò theo chi nhánh làm việc và quản lý thông tin các chi nhánh cửa hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateBranch}
            className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Thêm Chi nhánh</span>
          </button>
          <button
            type="button"
            onClick={openCreateStaff}
            className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Nhân viên</span>
          </button>
        </div>
      </motion.section>

      {bannerErr && (
        <div className="w-full rounded-[12px] bg-[#FEF2F2] border border-[#FCA5A5] px-4 py-2.5 flex items-center justify-between text-[12px] text-[#991B1B]">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{bannerErr}</span>
          </div>
          <button type="button" onClick={() => setBannerErr(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <motion.div
        variants={bentoItemVariants}
        className="inline-flex items-center gap-1 p-1 rounded-[12px] glass-card"
      >
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'staff' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'staff' && (
            <motion.div
              layoutId="org-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <Users className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Tài khoản &amp; Phân quyền nhân viên ({staffAccounts.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`relative h-[34px] px-4 rounded-[9px] text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'branches' ? 'text-white' : 'text-[#475569] hover:text-[#1D4ED8]'
          }`}
        >
          {activeTab === 'branches' && (
            <motion.div
              layoutId="org-tab-pill"
              transition={SPRING_PILL}
              className="absolute inset-0 rounded-[9px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
            />
          )}
          <Building className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">
            Thông tin Chi nhánh ({branches.length})
          </span>
        </button>
      </motion.div>

      {/* Content */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full glass-card rounded-[16px] overflow-x-auto"
      >
        {activeTab === 'staff' ? (
          <table className="w-full border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4">Nhân viên &amp; Email</th>
                <th className="px-4 w-[125px]">Số điện thoại</th>
                <th className="px-4 w-[175px]">Vai trò</th>
                <th className="px-4 w-[180px]">Chi nhánh làm việc</th>
                <th className="px-4 w-[125px]">Trạng thái</th>
                <th className="px-4 w-[130px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {staffAccounts.map((s) => (
                <tr key={s.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[58px]">
                  <td className="px-4">
                    <p className="font-bold text-[#0F172A]">{s.fullName}</p>
                    <p className="text-[11px] font-mono text-[#64748B]">{s.email}</p>
                  </td>
                  <td className="px-4 tabular-nums text-[#334155]">{s.phone}</td>
                  <td className="px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{getRoleShortLabel(s.role)}</span>
                    </span>
                  </td>
                  <td className="px-4 font-medium text-[#334155]">
                    {s.branchId ? getBranchLabel(s.branchId) : 'Toàn hệ thống'}
                  </td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        s.isActive
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : 'bg-[#FEE2E2]/90 text-[#B91C1C] border-[#FECACA]'
                      }`}
                    >
                      {s.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditStaff(s)}
                        className="h-[30px] px-2.5 rounded-[8px] btn-glass text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#2563EB]" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const res = toggleStaffStatus(s.id);
                          if (!res.ok) {
                            setBannerErr(res.error ?? 'Không thể thay đổi trạng thái.');
                          } else {
                            showToast(
                              `Đã ${s.isActive ? 'vô hiệu hóa' : 'kích hoạt lại'} tài khoản ${s.email}.`
                            );
                          }
                        }}
                        title={s.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                        className="h-[30px] px-2 rounded-[8px] btn-glass text-[#475569] inline-flex items-center cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[42px]">
                <th className="px-4 w-[100px]">Mã CN</th>
                <th className="px-4 w-[200px]">Tên chi nhánh</th>
                <th className="px-4">Địa chỉ</th>
                <th className="px-4 w-[125px]">Số điện thoại</th>
                <th className="px-4 w-[145px]">Người quản lý</th>
                <th className="px-4 w-[125px]">Trạng thái</th>
                <th className="px-4 w-[125px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[58px]">
                  <td className="px-4 font-mono font-bold text-[#1D4ED8]">{b.code}</td>
                  <td className="px-4 font-bold text-[#0F172A]">{b.name}</td>
                  <td className="px-4 text-[#475569]">{b.address}</td>
                  <td className="px-4 tabular-nums text-[#334155]">{b.phone}</td>
                  <td className="px-4 font-medium text-[#0F172A]">{b.managerName}</td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                        b.isActive
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                      }`}
                    >
                      {b.isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditBranch(b)}
                        className="h-[30px] px-2.5 rounded-[8px] btn-glass text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#2563EB]" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleBranchStatus(b.id);
                          showToast(`Đã cập nhật trạng thái "${b.name}".`);
                        }}
                        className="h-[30px] px-2 rounded-[8px] btn-glass text-[#475569] inline-flex items-center cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.section>

      {/* Modal Staff (UC04) */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B1736]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EXPO_EASE } }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[580px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  {editingStaff
                    ? 'Cập nhật tài khoản & phân quyền nhân viên'
                    : 'Thêm tài khoản nhân viên mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="p-5 space-y-4 bg-white/95">
                {staffErr && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{staffErr}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Họ và tên <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Email đăng nhập <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="nhanvien@retail.vn"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Số điện thoại <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Mật khẩu
                    </label>
                    <input
                      type="text"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] font-mono text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Vai trò phân quyền
                    </label>
                    <SelectField
                      value={staffRole}
                      onChange={(v) => setStaffRole(v as UserRole)}
                      heightClass="h-[36px]"
                      options={ROLES.map((r) => ({
                        value: r.id,
                        label: r.shortLabel,
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Chi nhánh phân công
                    </label>
                    <SelectField
                      value={staffRole === 'ADMIN' ? 'all' : staffBranchId}
                      disabled={staffRole === 'ADMIN'}
                      onChange={setStaffBranchId}
                      heightClass="h-[36px]"
                      options={
                        staffRole === 'ADMIN'
                          ? [{ value: 'all', label: 'Toàn hệ thống' }]
                          : branches.map((b) => ({ value: b.id, label: b.name }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Lưu tài khoản
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Branch (UC26) */}
      <AnimatePresence>
        {isBranchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B1736]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EXPO_EASE } }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[580px] glass-popover rounded-[16px] overflow-hidden"
            >
              <div className="px-5 py-4 bg-[#EFF6FF]/85 border-b border-[#DBEAFE] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  {editingBranch ? 'Chỉnh sửa thông tin Chi nhánh' : 'Thêm Chi nhánh mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="p-5 space-y-4 bg-white/95">
                {branchErr && (
                  <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{branchErr}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Mã chi nhánh <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="VD: CN-CT"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] font-mono uppercase text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Tên chi nhánh <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="VD: Chi nhánh D (Cần Thơ)"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                    Địa chỉ <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                    className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Số điện thoại <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      placeholder="02923881122"
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#0F172A] mb-1">
                      Người quản lý
                    </label>
                    <input
                      type="text"
                      value={branchManager}
                      onChange={(e) => setBranchManager(e.target.value)}
                      placeholder="Họ tên Quản lý chi nhánh..."
                      className="w-full h-[36px] px-3 rounded-[10px] border border-[#CBD5E1] text-[12px] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="h-[36px] px-4 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="h-[36px] px-4 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                  >
                    Lưu chi nhánh
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
