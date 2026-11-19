import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  UserCheck,
} from 'lucide-react';
import { useAdminContext } from '../context/AdminContext';
import { SIDEBAR_GROUPS } from '../data/mockDashboardData';
import { ROLES } from '../data/mockDashboardData';
import { EXPO_EASE } from '../components/ui/MotionPrimitives';

const QUICK_ACCOUNTS = [
  { label: 'Quản trị viên (Admin)', email: 'admin@retail.vn', password: '123', badge: 'Toàn hệ thống' },
  { label: 'Quản lý chi nhánh', email: 'manager.hn@retail.vn', password: '123', badge: 'CN Hà Nội' },
  { label: 'Nhân viên kho', email: 'warehouse.dn@retail.vn', password: '123', badge: 'CN Đà Nẵng' },
  { label: 'Nhân viên bán hàng', email: 'sales.hcm@retail.vn', password: '123', badge: 'CN TP.HCM' },
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
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ email và mật khẩu.');
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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 bg-[#07142E]">
      {/* Animated ambient blue radial lights */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#2563EB]/30 blur-[110px] orb-drift-1" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 w-[520px] h-[520px] rounded-full bg-[#0EA5E9]/25 blur-[120px] orb-drift-2" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: EXPO_EASE }}
        className="relative z-10 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-12 rounded-[24px] overflow-hidden border border-white/20 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(96,165,250,0.2)]"
      >
        {/* Left Brand Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0F2454] via-[#15357B] to-[#1D4ED8] p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#38BDF8]/25 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-[12px] bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.2)]">
                <Store className="w-5 h-5 text-white" />
              </span>
              <div>
                <p className="text-[16px] font-extrabold tracking-tight leading-none">
                  RETAIL_WEB
                </p>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Hệ thống Quản trị Đa chi nhánh
                </p>
              </div>
            </div>

            <h1 className="mt-8 text-[24px] font-extrabold leading-snug tracking-[-0.02em]">
              Đăng nhập cổng quản trị vận hành
            </h1>
            <p className="mt-2.5 text-[12.5px] text-blue-100/90 leading-relaxed">
              Quản lý đồng bộ doanh thu, tồn kho, nhập hàng, điều chuyển liên chi nhánh, đơn hàng và phân quyền nhân viên theo thời gian thực.
            </p>
          </div>

          <div className="relative z-10 mt-8 space-y-2.5">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-blue-200/90 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Chọn nhanh tài khoản theo vai trò</span>
            </p>
            <div className="space-y-1.5">
              {QUICK_ACCOUNTS.map((acc) => {
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
                    className={`w-full px-3 py-2 rounded-[10px] border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selected
                        ? 'bg-white/20 border-white/50 shadow-[0_4px_14px_rgba(0,0,0,0.18)]'
                        : 'bg-white/8 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-white truncate">
                        {acc.label}
                      </p>
                      <p className="text-[10.5px] font-mono text-blue-200 truncate">
                        {acc.email}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold text-blue-50 shrink-0">
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="md:col-span-7 bg-white/95 backdrop-blur-xl p-8 flex flex-col justify-center">
          <div className="max-w-[390px] w-full mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Xác thực nội bộ</span>
            </div>

            <h2 className="text-[22px] font-extrabold text-[#0F172A] tracking-[-0.02em]">
              Chào mừng quay trở lại
            </h2>
            <p className="text-[12.5px] text-[#64748B] mt-1">
              Nhập email và mật khẩu được cấp để truy cập hệ thống quản trị.
            </p>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[12px] text-[#991B1B]"
              >
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                  Email đăng nhập
                </label>
                <div className="h-[42px] rounded-[11px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] px-3 flex items-center gap-2.5 transition-all">
                  <Mail className="w-4 h-4 text-[#3B82F6] shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="admin@retail.vn"
                    className="w-full bg-transparent text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">
                  Mật khẩu
                </label>
                <div className="h-[42px] rounded-[11px] border border-[#CBD5E1] bg-white focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] px-3 flex items-center gap-2.5 transition-all">
                  <Lock className="w-4 h-4 text-[#3B82F6] shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Nhập mật khẩu..."
                    className="w-full bg-transparent text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[#64748B] hover:text-[#2563EB] cursor-pointer"
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[42px] rounded-[11px] btn-blue-glow text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Đăng nhập vào hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Mật khẩu mặc định: <strong className="font-mono text-[#0F172A]">123</strong></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('locked@retail.vn');
                  setPassword('123');
                  setErrorMsg(null);
                }}
                className="text-[#2563EB] hover:underline font-medium cursor-pointer"
              >
                Thử tài khoản bị khóa
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
