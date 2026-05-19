import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900">
          <h1 className="text-slate-100 font-semibold">Admin Dashboard</h1>
          <span className="text-slate-400 text-sm">AirtimeVault Admin</span>
        </header>
        <main className="flex-1 p-6 overflow-auto text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
