"use server";
import { createSession } from 'lib/auth';
import connectToDatabase from 'lib/db/connect';
import User from 'lib/models/User';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) return "Missing email or password";

  await connectToDatabase();
  
  const user = await User.findOne({ email });
  if (!user) return "Invalid email or password";

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return "Invalid email or password";

  await createSession(user._id.toString());
  redirect('/profile');
}
