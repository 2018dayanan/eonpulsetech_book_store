"use server";
import { createSession } from 'lib/auth';
import connectToDatabase from 'lib/db/connect';
import User from 'lib/models/User';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function register(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!name || !email || !password) return "All fields are required";

  await connectToDatabase();
  
  const existingUser = await User.findOne({ email });
  if (existingUser) return "Email already in use";

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  await createSession(user._id.toString());
  redirect('/profile');
}
