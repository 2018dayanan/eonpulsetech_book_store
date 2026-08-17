'use client';

import { useActionState } from 'react';
import { adminLogin } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Admin Portal</h1>
          <p className="text-neutral-500">Sign in to manage the store</p>
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black dark:text-white">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="admin@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-black dark:text-white">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mt-4"
          >
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
