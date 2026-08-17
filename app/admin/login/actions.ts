'use server';

import { cookies } from 'next/headers';
import { encryptAdmin } from 'lib/admin-auth';
import connectToDatabase from 'lib/db/connect';
import Admin from 'lib/models/Admin';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function adminLogin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  await connectToDatabase();
  const admin = await Admin.findOne({ email }).lean();

  if (!admin) {
    return { error: 'Invalid credentials.' };
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return { error: 'Invalid credentials.' };
  }

  const sessionData = { adminId: admin._id.toString(), email: admin.email };
  const encryptedSessionData = await encryptAdmin(sessionData);

  (await cookies()).set('adminSession', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  redirect('/admin');
}
