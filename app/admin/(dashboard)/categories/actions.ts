'use server';

import connectToDatabase from 'lib/db/connect';
import Category from 'lib/models/Category';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;

  if (!name || !slug) return;

  await connectToDatabase();
  try {
    await Category.create({ name, slug, description });
    revalidatePath('/admin/categories');
  } catch (error: any) {
    console.error(error);
  }
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  await (Category as any).findByIdAndDelete(id);
  revalidatePath('/admin/categories');
}
