import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { UserRole } from '../types/dashboard';

const DEMO_ACCOUNTS = [
  {
    role: 'Quản trị viên (Admin)',
    email: 'admin@retail.vn',
    password: '123',
    scope: 'Toàn hệ thống',
    badgeClass: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  },
  {
    role: 'Quản lý Chi nhánh',
    email: 'manager.hn@retail.vn',
    password: '123',
    scope: 'CN Hà Nội',
    badgeClass: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  },
  {
    role: 'Nhân viên Kho',
    email: 'warehouse.dn@retail.vn',
    password: '123',
    scope: 'CN Đà Nẵng',
    badgeClass: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  },
  {
    role: 'Nhân viên Bán hàng',
    email: 'sales.hcm@retail.vn',
    password: '123',
    scope: 'CN TP.HCM',
    badgeClass: 'bg-[#F3E8FF] text-[#6D28D9] border-[#DDD6FE]',
  },
];

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
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ email và mật khẩu.');
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
      setErrorMsg('Email này đã tồn tại trong danh sách nhân sự.');
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
    setSuccessMsg('Tạo tài khoản mới thành công! Thông tin đã được điền sẵn để đăng nhập.');
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Subtle Top Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-[10px] bg-[#18181B] text-white flex items-center justify-center shadow-sm mb-3">
          <Store className="w-5 h-5" />
        </div>
        <div className="inline-flex items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-tight text-[#09090B]">
            RETAIL_WEB
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[11px] font-mono font-medium text-[#52525B]">
            Backoffice
          </span>
        </div>
        <p className="text-[13px] text-[#71717A] mt-1">
          Hệ thống quản trị Sản phẩm, Nhà cung cấp và Nhân sự đa chi nhánh
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[12px] border border-[#E4E4E7] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Segmented Control Tabs */}
        <div className="p-3 bg-[#FAFAFA] border-b border-[#E4E4E7]">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-[9px] bg-[#E4E4E7]/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`h-[34px] rounded-[7px] text-[12.5px] font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#09090B] shadow-2xs'
                  : 'text-[#52525B] hover:text-[#09090B]'
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
              className={`h-[34px] rounded-[7px] text-[12.5px] font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#09090B] shadow-2xs'
                  : 'text-[#52525B] hover:text-[#09090B]'
              }`}
            >
              Đăng ký tài khoản
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-[12.5px] text-[#991B1B]">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5 text-[12.5px] text-[#166534]">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-medium text-[#18181B] mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] focus-within:ring-2 focus-within:ring-[#18181B]/10 px-3 flex items-center gap-2.5 transition-all">
                  <Mail className="w-4 h-4 text-[#71717A] shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="admin@retail.vn"
                    className="w-full bg-transparent text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12.5px] font-medium text-[#18181B]">
                    Mật khẩu
                  </label>
                  <span className="text-[11px] text-[#71717A]">
                    Mặc định: <code className="font-mono font-semibold text-[#18181B]">123</code>
                  </span>
                </div>
                <div className="h-[38px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] focus-within:ring-2 focus-within:ring-[#18181B]/10 px-3 flex items-center gap-2.5 transition-all">
                  <Lock className="w-4 h-4 text-[#71717A] shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-transparent text-[13px] text-[#09090B] placeholder:text-[#A1A1AA] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[#71717A] hover:text-[#09090B] cursor-pointer"
                    title="Hiện/ẩn mật khẩu"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-[38px] rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Đăng nhập vào hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                  Họ và tên nhân sự *
                </label>
                <div className="h-[36px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] px-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#71717A] shrink-0" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-transparent text-[13px] text-[#09090B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                    Email công việc *
                  </label>
                  <div className="h-[36px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] px-2.5 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@retail.vn"
                      className="w-full bg-transparent text-[12.5px] text-[#09090B] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                    Số điện thoại *
                  </label>
                  <div className="h-[36px] rounded-[8px] border border-[#E4E4E7] bg-white focus-within:border-[#18181B] px-2.5 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full bg-transparent text-[12.5px] text-[#09090B] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                  Vai trò phân quyền
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full h-[36px] rounded-[8px] border border-[#E4E4E7] bg-white px-2.5 text-[12.5px] text-[#09090B] outline-none focus:border-[#18181B]"
                >
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                  <option value="BRANCH_MANAGER">Quản lý chi nhánh</option>
                  <option value="WAREHOUSE_STAFF">Nhân viên kho</option>
                  <option value="SALES_STAFF">Nhân viên bán hàng</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 3 ký tự"
                    className="w-full h-[36px] rounded-[8px] border border-[#E4E4E7] bg-white px-3 text-[12.5px] text-[#09090B] outline-none focus:border-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full h-[36px] rounded-[8px] border border-[#E4E4E7] bg-white px-3 text-[12.5px] text-[#09090B] outline-none focus:border-[#18181B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-[38px] rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-semibold transition-colors cursor-pointer mt-1"
              >
                Tạo tài khoản mới
              </button>
            </form>
          )}
        </div>

        {/* Footer: Quick Demo Account Picker */}
        {mode === 'login' && (
          <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E4E4E7]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Chọn nhanh tài khoản Demo</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('locked@retail.vn');
                  setPassword('123');
                  setErrorMsg(null);
                }}
                className="text-[11px] font-medium text-[#71717A] hover:text-[#DC2626] hover:underline cursor-pointer"
              >
                Thử TK bị khóa
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const selected = email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                      setErrorMsg(null);
                    }}
                    className={`p-2 rounded-[8px] border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-white border-[#18181B] ring-1 ring-[#18181B]/10 shadow-2xs'
                        : 'bg-white border-[#E4E4E7] hover:border-[#A1A1AA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11.5px] font-semibold text-[#09090B] truncate">
                        {acc.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <span className="text-[10.5px] font-mono text-[#71717A] truncate">
                        {acc.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
