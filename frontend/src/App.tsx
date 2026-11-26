import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
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
  const { currentUser } = useAdminContext();
  const userRole = currentUser?.role ?? 'SALES_STAFF';

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  const currentRoleLabel =
    ROLES.find((r) => r.id === userRole)?.shortLabel ?? userRole;

  const fallbackPath =
    userRole === 'BRANCH_MANAGER' ? '/suppliers' : '/products';

  return (
    <div className="my-8 max-w-[540px] mx-auto polaris-card p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] text-[11.5px] font-bold">
          Từ chối truy cập
        </span>
        <h2 className="text-[18px] font-bold text-[#09090B]">
          Bạn không có quyền truy cập chức năng &ldquo;{featureName}&rdquo;
        </h2>
        <p className="text-[13px] text-[#52525B] leading-relaxed">
          Chức năng này chỉ dành cho vai trò:{' '}
          <strong className="text-[#09090B]">{actorRequiredLabel}</strong>. Tài khoản
          hiện tại của bạn đang đăng nhập với vai trò{' '}
          <strong className="text-[#2563EB]">{currentRoleLabel}</strong>.
        </p>
      </div>
      <div className="pt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => navigate(fallbackPath, { replace: true })}
          className="h-[36px] px-4 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay về màn hình được phân quyền</span>
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { currentUser } = useAdminContext();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const defaultRoute =
    currentUser.role === 'BRANCH_MANAGER' ? '/suppliers' : '/products';

  if (location.pathname === '/login') {
    return <Navigate to={defaultRoute} replace />;
  }

  let pageTitle = 'Quản lý Danh mục & Sản phẩm';
  if (location.pathname.startsWith('/suppliers')) {
    pageTitle = 'Quản lý Nhà cung cấp';
  } else if (location.pathname.startsWith('/staff')) {
    pageTitle = 'Quản lý Tài khoản & Phân quyền Nhân viên';
  }

  return (
    <AdminLayout pageTitle={pageTitle}>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/products" element={<CatalogPage />} />
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
