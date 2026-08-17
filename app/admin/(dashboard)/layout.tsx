import { getAdminSession, deleteAdminSession } from 'lib/admin-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold tracking-tight">Store Admin</h2>
          <p className="text-sm text-neutral-500">{session.email}</p>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Dashboard
          </Link>
          <Link href="/admin/books" className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Manage Books
          </Link>
          <Link href="/admin/categories" className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Manage Categories
          </Link>
          <Link href="/admin/users" className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Users
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Orders
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-neutral-200 dark:border-neutral-800 absolute bottom-0 w-64 hidden md:block">
          <form action={handleLogout}>
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition">
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="md:hidden flex justify-end mb-4">
           <form action={handleLogout}>
            <button className="text-sm font-medium text-red-600">Log Out</button>
          </form>
        </div>
        {children}
      </main>
    </div>
  );
}
