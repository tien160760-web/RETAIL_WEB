import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AdminProvider, useAdminContext } from './context/AdminContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { SIDEBAR_GROUPS } from './data/mockDashboardData';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { VouchersPage } from './pages/VouchersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { ProcurementPage } from './pages/ProcurementPage';
import { InventoryPage } from './pages/InventoryPage';
import { WarehouseTicketsPage } from './pages/WarehouseTicketsPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

const ALL_MENU_ITEMS = SIDEBAR_GROUPS.flatMap((g) => g.items);

function RoleProtected({
  menuId,
  children,
}: {
  menuId: string;
  children: React.ReactNode;
}) {
  const { roleConfig } = useAdminContext();
  if (!roleConfig.allowedMenuIds.includes(menuId)) {
    const item = ALL_MENU_ITEMS.find((m) => m.id === menuId) ?? ALL_MENU_ITEMS[0];
    return <PlaceholderPage menuItem={item} />;
  }
  return <>{children}</>;
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

  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  let pageTitle = ALL_MENU_ITEMS[0].pageTitle;
  if (location.pathname === '/catalog/new') {
    pageTitle = 'Thêm Sản phẩm mới';
  } else if (/^\/catalog\/[^/]+\/edit$/.test(location.pathname)) {
    pageTitle = 'Chỉnh sửa Sản phẩm & Biến thể';
  } else {
    const matched = ALL_MENU_ITEMS.find((item) => item.path === location.pathname);
    if (matched) pageTitle = matched.pageTitle;
  }

  return (
    <AdminLayout pageTitle={pageTitle}>
      <Routes>
        <Route
          path="/"
          element={
            <RoleProtected menuId="dashboard">
              <DashboardPage />
            </RoleProtected>
          }
        />
        <Route
          path="/catalog"
          element={
            <RoleProtected menuId="catalog">
              <CatalogPage />
            </RoleProtected>
          }
        />
        <Route
          path="/catalog/new"
          element={
            <RoleProtected menuId="catalog">
              <ProductFormPage />
            </RoleProtected>
          }
        />
        <Route
          path="/catalog/:id/edit"
          element={
            <RoleProtected menuId="catalog">
              <ProductFormPage />
            </RoleProtected>
          }
        />
        <Route
          path="/vouchers"
          element={
            <RoleProtected menuId="vouchers">
              <VouchersPage />
            </RoleProtected>
          }
        />
        <Route
          path="/suppliers"
          element={
            <RoleProtected menuId="suppliers">
              <SuppliersPage />
            </RoleProtected>
          }
        />
        <Route
          path="/procurement"
          element={
            <RoleProtected menuId="procurement">
              <ProcurementPage />
            </RoleProtected>
          }
        />
        <Route
          path="/inventory"
          element={
            <RoleProtected menuId="inventory">
              <InventoryPage />
            </RoleProtected>
          }
        />
        <Route
          path="/warehouse-tickets"
          element={
            <RoleProtected menuId="warehouse-tickets">
              <WarehouseTicketsPage />
            </RoleProtected>
          }
        />
        <Route
          path="/orders"
          element={
            <RoleProtected menuId="orders">
              <OrdersPage />
            </RoleProtected>
          }
        />
        <Route
          path="/organization"
          element={
            <RoleProtected menuId="organization">
              <OrganizationPage />
            </RoleProtected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
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
