'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

export function AdminSidebar({ email, children }: { email: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Manage Books', href: '/admin/books' },
    { name: 'Manage Categories', href: '/admin/categories' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Orders', href: '/admin/orders' },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <h2 className="text-xl font-bold tracking-tight">Store Admin</h2>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-neutral-600 dark:text-neutral-300">
          {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Store Admin</h2>
            <p className="text-sm text-neutral-500 truncate w-48 md:w-auto">{email}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 -mr-2 text-neutral-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-neutral-200 dark:border-neutral-800">
          {children}
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
