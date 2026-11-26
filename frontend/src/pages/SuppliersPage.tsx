import { useMemo, useState } from 'react';
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
import { useAdminContext } from '../context/AdminContext';
import { SupplierItem } from '../types/dashboard';

export function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, toggleSupplierStatus } =
    useAdminContext();

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

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

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
    <div className="space-y-4">
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-[8px] shadow-md flex items-center gap-2 text-[12.5px]">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-[#0F172A]">
            Danh sách Nhà cung cấp ({suppliers.length})
          </h2>
          <p className="text-[12.5px] text-[#64748B]">
            Thêm mới và quản lý thông tin đối tác cung cấp hàng hóa
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-[36px] px-3.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhà cung cấp</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-[#64748B] shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã, tên nhà cung cấp hoặc số điện thoại..."
          className="w-full text-[13px] text-[#0F172A] outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[680px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11.5px] font-bold text-[#475569] h-[40px]">
              <th className="px-4">Mã NCC</th>
              <th className="px-4">Tên nhà cung cấp</th>
              <th className="px-4">Số điện thoại</th>
              <th className="px-4">Email</th>
              <th className="px-4">Địa chỉ</th>
              <th className="px-4 text-center">Trạng thái</th>
              <th className="px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
            {filteredSuppliers.map((sup) => (
              <tr key={sup.id} className="hover:bg-[#F8FAFC] h-[52px]">
                <td className="px-4 font-mono text-[12px] font-semibold text-[#2563EB]">
                  {sup.code}
                </td>
                <td className="px-4 font-semibold text-[#0F172A]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#64748B] shrink-0" />
                    <span>{sup.name}</span>
                  </div>
                </td>
                <td className="px-4 text-[#334155]">{sup.phone}</td>
                <td className="px-4 text-[#475569]">{sup.email}</td>
                <td className="px-4 text-[#475569] max-w-[200px] truncate">
                  {sup.address}
                </td>
                <td className="px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      sup.isActive
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}
                  >
                    {sup.isActive ? 'Đang hợp tác' : 'Ngừng giao dịch'}
                  </span>
                </td>
                <td className="px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(sup)}
                      className="h-[28px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-medium text-[#334155] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggleSupplierStatus(sup.id);
                        showToast(`Đã đổi trạng thái NCC "${sup.name}".`);
                      }}
                      className="h-[28px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-medium text-[#475569] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{sup.isActive ? 'Khóa' : 'Mở'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[460px] rounded-[10px] border border-[#CBD5E1] shadow-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {editingSupplier ? 'Sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              {formErr && (
                <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Mã NCC *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="NCC-01"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Tên nhà cung cấp *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Công ty TNHH May Mặc Việt"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@ncc.vn"
                    className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 10 Nguyễn Trãi, Hà Nội"
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] px-3 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[36px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[12.5px] font-semibold text-[#334155] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-semibold cursor-pointer"
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
