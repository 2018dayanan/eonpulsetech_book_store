import { getAdminSession, deleteAdminSession } from 'lib/admin-auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from 'components/admin/admin-sidebar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  async function handleLogout() {
    'use server';
    await deleteAdminSession();
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-black flex flex-col md:flex-row">
      <AdminSidebar email={session.email as string}>
        <form action={handleLogout}>
          <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition">
            Log Out
          </button>
        </form>
      </AdminSidebar>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
