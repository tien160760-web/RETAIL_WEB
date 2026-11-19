import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  Search,
  X,
} from 'lucide-react';
import {
  bentoItemVariants,
  EXPO_EASE,
  pageContainerVariants,
} from '../components/ui/MotionPrimitives';
import { SelectField } from '../components/ui/SelectField';
import { useAdminContext } from '../context/AdminContext';
import { SupplierItem } from '../types/dashboard';

interface SupplierFormErrors {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, toggleSupplierStatus } =
    useAdminContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState<SupplierFormErrors>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setCode('');
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsActive(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setCode(sup.code);
    setName(sup.name);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setIsActive(sup.isActive);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: SupplierFormErrors = {};
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedCode) {
      nextErrors.code = 'Vui lòng nhập mã nhà cung cấp.';
    } else if (
      suppliers.some(
        (s) =>
          s.code.toUpperCase() === trimmedCode && s.id !== editingSupplier?.id
      )
    ) {
      nextErrors.code = 'Mã nhà cung cấp đã tồn tại.';
    }

    if (!trimmedName) {
      nextErrors.name = 'Vui lòng nhập tên nhà cung cấp.';
    }

    if (!trimmedPhone) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.';
    } else if (!/^(0|\+84)[0-9]{8,10}$/.test(trimmedPhone.replace(/\s+/g, ''))) {
      nextErrors.phone = 'Số điện thoại không đúng định dạng (10–11 chữ số).';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      code: trimmedCode,
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      address: address.trim(),
      isActive,
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, payload);
      showToast(`Đã cập nhật nhà cung cấp "${trimmedName}".`);
    } else {
      addSupplier(payload);
      showToast(`Đã thêm nhà cung cấp mới "${trimmedName}".`);
    }
    setIsModalOpen(false);
  };

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;
      if (q) {
        return (
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [suppliers, searchQuery, statusFilter]);

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full space-y-[14px] relative"
    >
      {toastMsg && (
        <div className="fixed bottom-5 right-6 z-50 bg-[#0B1736]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-[12px] shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)] border border-[#60A5FA]/35 flex items-center gap-2 text-[12px] font-medium animate-fade-up">
          <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[62px] glass-card glass-card-subtle rounded-[16px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h2 className="text-[17px] xl:text-[19px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
            Quản lý Nhà cung cấp
          </h2>
          <p className="text-[12px] text-[#475569] mt-[2px]">
            Quản lý danh sách đối tác cung ứng hàng hóa, thông tin liên hệ và trạng thái hợp tác
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-[34px] px-3.5 rounded-[10px] btn-blue-glow text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Nhà cung cấp</span>
        </button>
      </motion.section>

      {/* Filter Bar */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full min-h-[54px] glass-card rounded-[16px] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 relative z-20"
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="w-full sm:w-[300px] xl:w-[360px] h-[34px] rounded-[10px] border border-[#CBD5E1] hover:border-[#60A5FA] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] px-3 flex items-center gap-2 bg-white/90 transition-all">
            <Search className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo Mã NCC, Tên nhà cung cấp, SĐT..."
              className="w-full bg-transparent text-[12px] text-[#0F172A] placeholder:text-[#64748B] outline-none"
            />
          </div>

          <SelectField
            value={statusFilter}
            onChange={(val) =>
              setStatusFilter(val as 'all' | 'active' | 'inactive')
            }
            className="w-[190px]"
            heightClass="h-[34px]"
            options={[
              { value: 'all', label: 'Trạng thái: Tất cả' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Ngừng hợp tác' },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className="h-[34px] px-3.5 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer shrink-0"
        >
          Xóa bộ lọc
        </button>
      </motion.section>

      {/* Suppliers Table */}
      <motion.section
        variants={bentoItemVariants}
        className="w-full glass-card rounded-[16px] overflow-x-auto"
      >
        {filteredSuppliers.length === 0 ? (
          <div className="py-14 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-[14px] font-bold text-[#0F172A]">
              Không tìm thấy nhà cung cấp nào
            </p>
            <p className="text-[12px] text-[#64748B] mt-1">
              Thử từ khóa khác hoặc bấm Thêm Nhà cung cấp mới.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#EFF6FF]/90 border-b border-[#DBEAFE] text-left text-[12px] font-bold text-[#1E3A8A] h-[44px]">
                <th className="px-3.5 w-[104px]">Mã NCC</th>
                <th className="px-3.5">Tên nhà cung cấp</th>
                <th className="px-3.5 w-[120px]">Số điện thoại</th>
                <th className="px-3.5 w-[17%]">Email</th>
                <th className="px-3.5 w-[20%]">Địa chỉ</th>
                <th className="px-3.5 w-[124px]">Trạng thái</th>
                <th className="px-3.5 w-[128px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF6FF] text-[12px] bg-white/75">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-[#EFF6FF]/60 transition-colors h-[58px]">
                  <td className="px-4 font-mono font-bold text-[#1D4ED8]">
                    {sup.code}
                  </td>
                  <td className="px-4 font-semibold text-[#0F172A]">
                    {sup.name}
                  </td>
                  <td className="px-4 text-[#334155] tabular-nums">
                    {sup.phone}
                  </td>
                  <td className="px-4 text-[#334155] truncate max-w-[185px]">
                    {sup.email}
                  </td>
                  <td className="px-4 text-[#475569] truncate max-w-[215px]">
                    {sup.address || '—'}
                  </td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${
                        sup.isActive
                          ? 'bg-[#DCFCE7]/90 text-[#15803D] border-[#BBF7D0]'
                          : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                      }`}
                    >
                      {sup.isActive ? 'Đang hoạt động' : 'Ngừng hợp tác'}
                    </span>
                  </td>
                  <td className="px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(sup)}
                        className="h-[32px] px-3 rounded-[8px] btn-glass text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#2563EB]" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSupplierStatus(sup.id);
                          showToast(
                            `Đã chuyển trạng thái "${sup.name}" sang ${
                              sup.isActive ? 'Ngừng hợp tác' : 'Đang hoạt động'
                            }.`
                          );
                        }}
                        title={sup.isActive ? 'Ngừng hợp tác' : 'Kích hoạt lại'}
                        className="h-[32px] px-2.5 rounded-[8px] btn-glass text-[#475569] inline-flex items-center cursor-pointer"
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

      {/* Modal Thêm / Sửa Nhà cung cấp */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-[#0B1736]/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EXPO_EASE } }}
              exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.16 } }}
              className="w-full max-w-[740px] glass-popover rounded-[16px] overflow-hidden"
            >
            <div className="px-6 py-4 bg-[#EFF6FF]/80 border-b border-[#DBEAFE] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#0F172A]">
                {editingSupplier
                  ? 'Chỉnh sửa Thông tin Nhà cung cấp'
                  : 'Thêm mới Nhà cung cấp'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748B] hover:text-[#1D4ED8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white/90">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                    Mã nhà cung cấp <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setFormErrors((prev) => ({ ...prev, code: undefined }));
                    }}
                    placeholder="VD: NCC-VT04"
                    className={`w-full h-[38px] px-3 rounded-[10px] border font-mono uppercase text-[12px] outline-none transition-all ${
                      formErrors.code
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                        : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                    }`}
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-[11px] text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.code}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                    Tên nhà cung cấp <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Nhập tên công ty / NCC..."
                    className={`w-full h-[38px] px-3 rounded-[10px] border text-[12px] outline-none transition-all ${
                      formErrors.name
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                        : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                    Trạng thái hoạt động
                  </label>
                  <SelectField
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(val) => setIsActive(val === 'active')}
                    heightClass="h-[38px]"
                    options={[
                      { value: 'active', label: 'Đang hoạt động' },
                      { value: 'inactive', label: 'Ngừng hợp tác' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                    Số điện thoại liên hệ <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="VD: 0912345678"
                    className={`w-full h-[38px] px-3 rounded-[10px] border text-[12px] outline-none transition-all ${
                      formErrors.phone
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                        : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-[11px] text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                    Địa chỉ Email <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="contact@nhacungcap.vn"
                    className={`w-full h-[38px] px-3 rounded-[10px] border text-[12px] outline-none transition-all ${
                      formErrors.email
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]'
                        : 'border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-[11px] text-[#DC2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                    Địa chỉ kho / văn phòng
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ nhà cung cấp..."
                    className="w-full h-[38px] px-3 rounded-[10px] border border-[#CBD5E1] bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] text-[12px] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#DBEAFE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[38px] px-5 rounded-[10px] btn-glass text-[12px] font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-[10px] btn-blue-glow text-[12px] font-bold cursor-pointer"
                >
                  Lưu thay đổi
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
