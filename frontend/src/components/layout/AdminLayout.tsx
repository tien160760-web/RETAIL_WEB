import React, { useState } from 'react';
import { TitleBar } from './TitleBar';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { useAdminContext } from '../../context/AdminContext';

interface AdminLayoutProps {
  pageTitle: string;
  children: React.ReactNode;
}

export function AdminLayout({ pageTitle, children }: AdminLayoutProps) {
  const { roleConfig, selectedBranchId, getBranchLabel } = useAdminContext();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const contextBadge = `${roleConfig.shortLabel} · ${
    selectedBranchId === 'all' ? 'Tất cả chi nhánh' : getBranchLabel(selectedBranchId)
  }`;

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="relative w-full max-w-[1360px] mx-auto h-screen flex flex-col overflow-hidden glass-canvas shadow-[0_0_0_1px_rgba(191,219,254,0.9),0_24px_60px_-20px_rgba(15,23,42,0.18)]">
      {/* Drifting ambient blue light orbs for genuine glassmorphism refraction */}
      <div className="pointer-events-none absolute -top-24 left-[18%] w-[380px] h-[380px] rounded-full bg-[#3B82F6]/16 blur-[80px] orb-drift-1 z-0" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[8%] w-[420px] h-[420px] rounded-full bg-[#0EA5E9]/16 blur-[90px] orb-drift-2 z-0" />

      <div className="relative z-20">
        <TitleBar title={pageTitle} contextBadge={contextBadge} />
        <Topbar
          isSidebarCollapsed={desktopCollapsed}
          isMobileMenuOpen={mobileDrawerOpen}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>

      <div className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        <Sidebar
          collapsed={desktopCollapsed}
          mobileOpen={mobileDrawerOpen}
          onToggleCollapse={() => setDesktopCollapsed((prev) => !prev)}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden admin-scroll px-3 sm:px-4 py-3.5">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
