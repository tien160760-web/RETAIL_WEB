import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Store,
  User,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { UserRole } from '../types/dashboard';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, staffAccounts, addStaffAccount } = useAdminContext();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('admin@retail.vn');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const res = login(email, password);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Đăng nhập thất bại.');
      return;
    }

    navigate('/products', { replace: true });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !regPassword) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, email, số điện thoại và mật khẩu.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    const exists = staffAccounts.some(
      (s) => s.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      setErrorMsg('Email này đã được đăng ký trong hệ thống.');
      return;
    }

    addStaffAccount({
      fullName: cleanName,
      email: cleanEmail,
      password: regPassword,
      phone: cleanPhone,
      role: regRole,
      branchId: regRole === 'ADMIN' ? null : 'cn-hn',
      isActive: true,
    });

    setEmail(cleanEmail);
    setPassword(regPassword);
    setMode('login');
    setSuccessMsg('Đăng ký tài khoản thành công! Bạn có thể bấm Đăng nhập ngay.');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F1F5F9]">
      <div className="w-full max-w-[440px] bg-white rounded-[10px] border border-[#CBD5E1] shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-[8px] bg-[#2563EB] text-white flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-[#0F172A] leading-tight">
              RETAIL_WEB — Bản Demo
            </h1>
            <p className="text-[12px] text-[#64748B]">
              Hệ thống Quản lý Sản phẩm, Nhà cung cấp &amp; Nhân viên
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs: Đăng nhập / Đăng ký */}
        <div className="mt-4 grid grid-cols-2 gap-1 p-1 rounded-[8px] bg-[#F1F5F9] border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`h-[34px] rounded-[6px] text-[13px] font-semibold transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`h-[34px] rounded-[6px] text-[13px] font-semibold transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[12.5px] text-[#991B1B]">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-2.5 rounded-[8px] bg-[#F0FDF4] border border-[#86EFAC] flex items-start gap-2 text-[12.5px] text-[#166534]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#0F172A] mb-1">
                Email đăng nhập
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
              <label className="block text-[12.5px] font-semibold text-[#0F172A] mb-1">
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
              className="w-full h-[38px] rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold cursor-pointer"
            >
              Đăng nhập
            </button>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11.5px] text-[#64748B]">
              <span>
                TK mẫu: <strong className="text-[#0F172A]">admin@retail.vn</strong> / MK: <strong className="text-[#0F172A]">123</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@retail.vn');
                  setPassword('123');
                  setErrorMsg(null);
                }}
                className="text-[#2563EB] hover:underline font-medium cursor-pointer"
              >
                Điền nhanh
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Họ và tên *
              </label>
              <div className="h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] px-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#64748B] shrink-0" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-transparent text-[13px] text-[#0F172A] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Email *
                </label>
                <div className="h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] px-2.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@retail.vn"
                    className="w-full bg-transparent text-[12.5px] text-[#0F172A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Số điện thoại *
                </label>
                <div className="h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] px-2.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full bg-transparent text-[12.5px] text-[#0F172A] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Vai trò tài khoản
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-2.5 text-[12.5px] text-[#0F172A] outline-none focus:border-[#2563EB]"
              >
                <option value="ADMIN">Quản trị viên (Admin)</option>
                <option value="BRANCH_MANAGER">Quản lý chi nhánh</option>
                <option value="WAREHOUSE_STAFF">Nhân viên kho</option>
                <option value="SALES_STAFF">Nhân viên bán hàng</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[12.5px] text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Xác nhận MK *
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full h-[36px] rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[12.5px] text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[38px] rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold cursor-pointer mt-1"
            >
              Hoàn tất Đăng ký
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
