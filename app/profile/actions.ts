"use server";
import { getSession } from 'lib/auth';
import connectToDatabase from 'lib/db/connect';
import User from 'lib/models/User';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return "Unauthorized";

  const name = formData.get('name') as string;
  const profilePic = formData.get('profilePic') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!name) return "Name is required";

  await connectToDatabase();
  
  const updateData: any = { name, profilePic };
  
  if (newPassword && newPassword.trim().length > 0) {
    const bcrypt = require('bcryptjs');
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  await User.updateOne({ _id: session.userId }, updateData);

  revalidatePath('/profile');
  return "Success";
}
