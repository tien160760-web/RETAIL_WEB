import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  Search,
  X,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { SupplierItem } from '../types/dashboard';

const AVATAR_PALETTES = [
  'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  'bg-[#F3E8FF] text-[#6D28D9] border-[#DDD6FE]',
  'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
];

function getAvatarStyle(seed: string) {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_PALETTES[sum % AVATAR_PALETTES.length];
}

function getSupplierInitials(name: string) {
  const cleaned = name
    .replace(/^(Công ty|CTCP|TNHH|CP|Dệt May)\s+/gi, '')
    .trim();
  const words = (cleaned || name).split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, toggleSupplierStatus } =
    useAdminContext();

  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formErr, setFormErr] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const activeCount = useMemo(
    () => suppliers.filter((s) => s.isActive).length,
    [suppliers]
  );
  const inactiveCount = suppliers.length - activeCount;

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (statusTab === 'active' && !s.isActive) return false;
      if (statusTab === 'inactive' && s.isActive) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [suppliers, searchQuery, statusTab]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setCode(`NCC-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsActive(true);
    setFormErr(null);
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
    setFormErr(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanCode || !cleanName || !cleanPhone) {
      setFormErr('Vui lòng nhập đầy đủ Mã NCC, Tên nhà cung cấp và Số điện thoại.');
      return;
    }

    const duplicate = suppliers.some(
      (s) => s.code.toUpperCase() === cleanCode && s.id !== editingSupplier?.id
    );
    if (duplicate) {
      setFormErr(`Mã nhà cung cấp "${cleanCode}" đã tồn tại.`);
      return;
    }

    const payload = {
      code: cleanCode,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || 'contact@supplier.vn',
      address: address.trim() || 'Việt Nam',
      isActive,
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, payload);
      showToast(`Đã cập nhật nhà cung cấp "${cleanName}".`);
    } else {
      addSupplier(payload);
      showToast(`Đã thêm nhà cung cấp mới "${cleanName}".`);
    }

    setIsModalOpen(false);
  };

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
            Đối tác &amp; Nhà cung cấp
          </h1>
          <p className="text-[13px] text-[#71717A] mt-0.5">
            Quản lý hồ sơ công ty cung ứng, thông tin liên hệ và trạng thái hợp tác nhập hàng
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-[36px] px-4 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhà cung cấp</span>
        </button>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Tổng nhà cung cấp</span>
            <Building2 className="w-4 h-4 text-[#71717A]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {suppliers.length}
          </p>
          <p className="text-[11.5px] text-[#71717A] mt-0.5">
            Đối tác phân phối toàn hệ thống
          </p>
        </div>

        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Đang hợp tác</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {activeCount}
          </p>
          <p className="text-[11.5px] text-[#15803D] font-medium mt-0.5">
            Sẵn sàng lập đơn nhập kho (PO)
          </p>
        </div>

        <div className="polaris-card p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#71717A]">
            <span>Tạm ngừng giao dịch</span>
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          </div>
          <p className="text-[22px] font-bold text-[#09090B] tabular-nums mt-1.5">
            {inactiveCount}
          </p>
          <p className="text-[11.5px] text-[#71717A] mt-0.5">
            Đã khóa tạo đơn đặt hàng mới
          </p>
        </div>
      </div>

      {/* Unified Polaris Table Card */}
      <div className="polaris-card overflow-hidden">
        {/* Integrated Filter Toolbar */}
        <div className="px-4 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {(
              [
                { id: 'all', label: `Tất cả (${suppliers.length})` },
                { id: 'active', label: `Đang hợp tác (${activeCount})` },
                { id: 'inactive', label: `Ngừng giao dịch (${inactiveCount})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStatusTab(t.id)}
                className={`h-[30px] px-3 rounded-[7px] text-[12.5px] font-medium transition-all cursor-pointer ${
                  statusTab === t.id
                    ? 'bg-[#18181B] text-white font-semibold shadow-2xs'
                    : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-[34px] w-full sm:w-[260px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] px-2.5 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã NCC, tên công ty, SĐT..."
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[720px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#71717A] h-[40px]">
                <th className="px-5">Nhà cung cấp</th>
                <th className="px-4">Mã đối tác</th>
                <th className="px-4">Thông tin liên hệ</th>
                <th className="px-4">Trụ sở / Địa chỉ</th>
                <th className="px-4 text-center">Trạng thái</th>
                <th className="px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7]/80 text-[13px]">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-[13.5px] font-semibold text-[#18181B]">
                      Không tìm thấy nhà cung cấp phù hợp
                    </p>
                    <p className="text-[12.5px] text-[#71717A] mt-1">
                      Thử kiểm tra lại từ khóa hoặc thêm đối tác mới.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => {
                  const avatarStyle = getAvatarStyle(sup.code + sup.name);
                  return (
                    <tr
                      key={sup.id}
                      className="hover:bg-[#FAFAFA] transition-colors h-[64px]"
                    >
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-[8px] border flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarStyle}`}
                          >
                            {getSupplierInitials(sup.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#09090B] leading-snug">
                              {sup.name}
                            </p>
                            <p className="text-[11.5px] text-[#71717A]">
                              Đối tác cung ứng hàng hóa
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#F4F4F5] border border-[#E4E4E7] font-mono text-[12px] font-semibold text-[#18181B]">
                          {sup.code}
                        </span>
                      </td>

                      <td className="px-4">
                        <div className="space-y-0.5">
                          <p className="text-[12.5px] font-medium text-[#18181B] flex items-center gap-1.5 tabular-nums">
                            <Phone className="w-3.5 h-3.5 text-[#71717A]" />
                            <span>{sup.phone}</span>
                          </p>
                          <p className="text-[12px] text-[#71717A] flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#A1A1AA]" />
                            <span>{sup.email}</span>
                          </p>
                        </div>
                      </td>

                      <td className="px-4 text-[#52525B] max-w-[220px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#71717A] shrink-0 mt-0.5" />
                          <span className="truncate text-[12.5px]">{sup.address}</span>
                        </div>
                      </td>

                      <td className="px-4 text-center">
                        {sup.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-[11.5px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                            <span>Đang hợp tác</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[11.5px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                            <span>Ngừng giao dịch</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(sup)}
                            className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-medium text-[#18181B] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#52525B]" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toggleSupplierStatus(sup.id);
                              showToast(`Đã đổi trạng thái đối tác "${sup.name}".`);
                            }}
                            className="h-[30px] px-2.5 rounded-[7px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12px] font-medium text-[#52525B] hover:text-[#09090B] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{sup.isActive ? 'Khóa' : 'Mở'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between text-[12px] text-[#71717A]">
            <span>
              Hiển thị <strong className="text-[#18181B]">{filteredSuppliers.length}</strong> /{' '}
              <strong className="text-[#18181B]">{suppliers.length}</strong> nhà cung cấp
            </span>
            <span>Dữ liệu đồng bộ chuỗi cung ứng</span>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[470px] rounded-[12px] border border-[#E4E4E7] shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#09090B]">
                  {editingSupplier ? 'Cập nhật Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                </h3>
                <p className="text-[12px] text-[#71717A]">
                  Thông tin pháp nhân và đầu mối liên hệ nhập hàng
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-[6px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formErr && (
                <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-[12.5px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Mã NCC *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="NCC-01"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] font-mono outline-none focus:border-[#18181B]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Tên nhà cung cấp *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Công ty TNHH Thương mại Việt"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@ncc.vn"
                    className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1">
                  Địa chỉ trụ sở / kho
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 10 Nguyễn Trãi, Thanh Xuân, Hà Nội"
                  className="w-full h-[38px] rounded-[8px] border border-[#E4E4E7] px-3 text-[13px] outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[12.5px] font-medium text-[#18181B] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[12.5px] font-semibold cursor-pointer"
                >
                  {editingSupplier ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
