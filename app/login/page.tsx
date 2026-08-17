"use client";
import { useActionState } from 'react';
import { login } from './actions';
import Link from 'next/link';

export default function LoginPage() {
  const [errorMessage, formAction] = useActionState(login, undefined);

  return (
    <div className="mx-auto max-w-md p-8 bg-white border border-neutral-200 rounded-xl mt-12 dark:bg-black dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6">Log In</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input name="password" type="password" required className="w-full border rounded-lg p-2 dark:bg-neutral-900 dark:border-neutral-800" />
        </div>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition">
          Log In
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-neutral-500">
        Don't have an account? <Link href="/register" className="text-blue-600">Register</Link>
      </p>
    </div>
  );
}
