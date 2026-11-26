import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AdminProvider, useAdminContext } from './context/AdminContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { OrganizationPage } from './pages/OrganizationPage';

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

  if (location.pathname === '/login') {
    return <Navigate to="/products" replace />;
  }

  let pageTitle = 'Quản lý Sản phẩm';
  if (location.pathname.startsWith('/suppliers')) {
    pageTitle = 'Quản lý Nhà cung cấp';
  } else if (location.pathname.startsWith('/staff')) {
    pageTitle = 'Quản lý Nhân viên';
  }

  return (
    <AdminLayout pageTitle={pageTitle}>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<CatalogPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/staff" element={<OrganizationPage />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
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
