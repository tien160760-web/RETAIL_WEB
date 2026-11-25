import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  pageTitle: string;
  children: React.ReactNode;
}

export function AdminLayout({ pageTitle, children }: AdminLayoutProps) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Topbar
        pageTitle={pageTitle}
        isSidebarCollapsed={desktopCollapsed}
        isMobileMenuOpen={mobileDrawerOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar
          collapsed={desktopCollapsed}
          mobileOpen={mobileDrawerOpen}
          onToggleCollapse={() => setDesktopCollapsed((prev) => !prev)}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden admin-scroll p-3 sm:p-4">
          <div className="w-full max-w-[1360px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
