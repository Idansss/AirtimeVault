"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

const STORAGE_KEY = "av-sidebar-open";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setOpen(saved === "true");
  }, []);

  function toggle() {
    setOpen((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] dark:bg-[#0D1117] flex">
      <DashboardSidebar isOpen={open} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar onToggleSidebar={toggle} sidebarOpen={open} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
