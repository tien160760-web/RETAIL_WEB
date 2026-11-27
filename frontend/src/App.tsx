import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  LogOut,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AdminProvider, useAdminContext } from './context/AdminContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { UserRole } from './types/dashboard';
import { ROLES } from './data/mockDashboardData';

function RoleGuard({
  allowedRoles,
  featureName,
  actorRequiredLabel,
  children,
}: {
  allowedRoles: UserRole[];
  featureName: string;
  actorRequiredLabel: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAdminContext();
  const userRole = currentUser?.role ?? 'CUSTOMER';

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  const currentRoleLabel =
    userRole === 'CUSTOMER'
      ? 'Khách hàng (CUSTOMER)'
      : ROLES.find((r) => r.id === userRole)?.shortLabel ?? userRole;

  const fallbackPath =
    userRole === 'BRANCH_MANAGER' ? '/suppliers' : '/products';

  return (
    <div className="my-8 max-w-[560px] mx-auto polaris-card p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[11.5px] font-bold">
          403 Forbidden · Từ chối truy cập
        </span>
        <h2 className="text-[18px] font-bold text-[#09090B]">
          Bạn không có quyền sử dụng chức năng &ldquo;{featureName}&rdquo;
        </h2>
        <p className="text-[13px] text-[#52525B] leading-relaxed">
          Chức năng này chỉ dành cho vai trò:{' '}
          <strong className="text-[#09090B]">{actorRequiredLabel}</strong>. Tài khoản
          hiện tại của bạn (<strong className="font-mono">{currentUser?.email}</strong>) đang
          có vai trò <strong className="text-[#2563EB]">{currentRoleLabel}</strong>.
        </p>
      </div>
      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
        {userRole !== 'CUSTOMER' && (
          <button
            type="button"
            onClick={() => navigate(fallbackPath, { replace: true })}
            className="h-[36px] px-4 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay về màn hình được phân quyền</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="h-[36px] px-4 rounded-[8px] border border-[#E4E4E7] bg-white hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[#18181B] hover:text-[#DC2626] text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất &amp; Đổi tài khoản Admin</span>
        </button>
      </div>
    </div>
  );
}

function GlobalAuthBanner() {
  const { authAlert, clearAuthAlert } = useAdminContext();
  if (!authAlert) return null;

  return (
    <div className="mb-4 p-3.5 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-3 text-[13px] text-[#991B1B]">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
        <span>
          <strong>HTTP {authAlert.status}:</strong> {authAlert.message}
        </span>
      </div>
      <button
        type="button"
        onClick={clearAuthAlert}
        className="w-6 h-6 rounded hover:bg-[#FEE2E2] flex items-center justify-center cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { currentUser, isAuthChecking } = useAdminContext();

  // Mục 2.1: Đang xác thực token & vai trò với Backend (/api/v1/auth/me) khi mở trang hoặc nhập URL trực tiếp
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="polaris-card px-6 py-5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          <div className="text-left">
            <p className="text-[13.5px] font-semibold text-[#09090B]">
              Đang kiểm tra trạng thái đăng nhập &amp; phân quyền...
            </p>
            <p className="text-[11.5px] text-[#71717A]">
              Xác thực JWT Token với Backend API (/api/v1/auth/me)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> Bắt buộc chuyển về /login, lưu lại đường dẫn người dùng vừa nhập trực tiếp
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
              state={{ from: location.pathname }}
            />
          }
        />
      </Routes>
    );
  }

  // Mục 2.1 & Tiêu chí 4: Nếu tài khoản có vai trò CUSTOMER cố truy cập bất kỳ URL quản trị nào
  if (currentUser.role === 'CUSTOMER') {
    return (
      <AdminLayout pageTitle="Khu vực Quản trị (Hạn chế quyền truy cập)">
        <GlobalAuthBanner />
        <RoleGuard
          allowedRoles={['ADMIN']}
          featureName="Khu vực Quản trị (Admin Backoffice)"
          actorRequiredLabel="Quản trị viên (ADMIN)"
        >
          <div />
        </RoleGuard>
      </AdminLayout>
    );
  }

  const defaultRoute =
    currentUser.role === 'BRANCH_MANAGER' ? '/suppliers' : '/products';

  if (location.pathname === '/login') {
    return <Navigate to={defaultRoute} replace />;
  }

  let pageTitle = 'Quản lý Danh mục & Sản phẩm';
  if (location.pathname === '/products/new') {
    pageTitle = 'Thêm Sản phẩm mới';
  } else if (/^\/products\/[^/]+\/edit$/.test(location.pathname)) {
    pageTitle = 'Chỉnh sửa Sản phẩm';
  } else if (location.pathname.startsWith('/suppliers')) {
    pageTitle = 'Quản lý Nhà cung cấp';
  } else if (location.pathname.startsWith('/staff')) {
    pageTitle = 'Quản lý Tài khoản & Phân quyền Nhân viên';
  }

  return (
    <AdminLayout pageTitle={pageTitle}>
      <GlobalAuthBanner />
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/products" element={<CatalogPage />} />
        <Route
          path="/products/new"
          element={
            <RoleGuard
              allowedRoles={['ADMIN']}
              featureName="Thêm sản phẩm mới"
              actorRequiredLabel="Quản trị viên (ADMIN)"
            >
              <CatalogPage routeAction="create" />
            </RoleGuard>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <RoleGuard
              allowedRoles={['ADMIN']}
              featureName="Chỉnh sửa sản phẩm"
              actorRequiredLabel="Quản trị viên (ADMIN)"
            >
              <CatalogPage routeAction="edit" />
            </RoleGuard>
          }
        />
        <Route
          path="/suppliers"
          element={
            <RoleGuard
              allowedRoles={['ADMIN', 'BRANCH_MANAGER']}
              featureName="Quản lý Nhà cung cấp"
              actorRequiredLabel="Quản lý chi nhánh / Quản trị viên"
            >
              <SuppliersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/staff"
          element={
            <RoleGuard
              allowedRoles={['ADMIN']}
              featureName="Quản lý tài khoản và phân quyền nhân viên"
              actorRequiredLabel="Quản trị viên (Admin)"
            >
              <OrganizationPage />
            </RoleGuard>
          }
        />
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRoutes />
      </AdminProvider>
    </BrowserRouter>
  );
}
