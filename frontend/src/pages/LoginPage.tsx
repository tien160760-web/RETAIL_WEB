import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Store,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { SIDEBAR_GROUPS, ROLES } from '../data/mockDashboardData';

const QUICK_ACCOUNTS = [
  { label: 'Admin', email: 'admin@retail.vn', password: '123', desc: 'Toàn quyền hệ thống' },
  { label: 'Quản lý CN', email: 'manager.hn@retail.vn', password: '123', desc: 'CN Hà Nội' },
  { label: 'NV Kho', email: 'warehouse.dn@retail.vn', password: '123', desc: 'CN Đà Nẵng' },
  { label: 'NV Bán hàng', email: 'sales.hcm@retail.vn', password: '123', desc: 'CN TP.HCM' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, staffAccounts } = useAdminContext();

  const [email, setEmail] = useState('admin@retail.vn');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const res = login(email, password);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Đăng nhập thất bại.');
      return;
    }

    const logged = staffAccounts.find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase()
    );
    const roleDef = ROLES.find((r) => r.id === logged?.role);
    const firstPath =
      SIDEBAR_GROUPS.flatMap((g) => g.items).find((item) =>
        roleDef?.allowedMenuIds.includes(item.id)
      )?.path ?? '/';
    navigate(firstPath, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F1F5F9]">
      <div className="w-full max-w-[420px] bg-white rounded-[12px] border border-[#CBD5E1] shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E2E8F0]">
          <div className="w-9 h-9 rounded-[8px] bg-[#2563EB] text-white flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#0F172A] leading-tight">
              Đăng nhập Quản trị (Demo)
            </h1>
            <p className="text-[12px] text-[#64748B]">
              Hệ thống quản lý bán hàng đa chi nhánh
            </p>
          </div>
        </div>

        {/* Quick account selector */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-[#475569] mb-2">
            Chọn nhanh tài khoản Demo:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ACCOUNTS.map((acc) => {
              const active = email.toLowerCase() === acc.email.toLowerCase();
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setErrorMsg(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-[8px] border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <p className="text-[12px] font-bold truncate">{acc.label}</p>
                  <p className="text-[10.5px] text-[#64748B] truncate">{acc.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[12px] text-[#991B1B]">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Email
            </label>
            <div className="h-[38px] rounded-[8px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] px-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="admin@retail.vn"
                className="w-full bg-transparent text-[13px] text-[#0F172A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Mật khẩu
            </label>
            <div className="h-[38px] rounded-[8px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] px-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#64748B] shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Nhập mật khẩu"
                className="w-full bg-transparent text-[13px] text-[#0F172A] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-[38px] rounded-[8px] btn-blue-glow text-[13px] font-semibold cursor-pointer"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Mật khẩu chung: <strong className="font-mono text-[#0F172A]">123</strong></span>
          <button
            type="button"
            onClick={() => {
              setEmail('locked@retail.vn');
              setPassword('123');
              setErrorMsg(null);
            }}
            className="text-[#2563EB] hover:underline cursor-pointer"
          >
            Test TK bị khóa
          </button>
        </div>
      </div>
    </div>
  );
}
