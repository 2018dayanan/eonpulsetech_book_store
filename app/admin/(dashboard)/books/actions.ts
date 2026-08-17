'use server';

import connectToDatabase from 'lib/db/connect';
import Book from 'lib/models/Book';
import { revalidatePath } from 'next/cache';

export async function createBook(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const coverImage = formData.get('coverImage') as string;
  const pdfUrl = formData.get('pdfUrl') as string;
  const categoryId = formData.get('categoryId') as string;

  if (!title || !description || !price || !coverImage || !pdfUrl || !categoryId) {
    return;
  }

  await connectToDatabase();
  try {
    await Book.create({
      title,
      description,
      price,
      coverImage,
      pdfUrl,
      categoryId
    });
    revalidatePath('/admin/books');
  } catch (error: any) {
    console.error(error);
  }
}

export async function deleteBook(id: string) {
  await connectToDatabase();
  await (Book as any).findByIdAndDelete(id);
  revalidatePath('/admin/books');
}

export async function updateBook(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const coverImage = formData.get('coverImage') as string;
  const pdfUrl = formData.get('pdfUrl') as string;
  const categoryId = formData.get('categoryId') as string;

  if (!title || !description || !price || !coverImage || !pdfUrl || !categoryId) {
    return;
  }

  await connectToDatabase();
  try {
    await (Book as any).findByIdAndUpdate(id, {
      title,
      description,
      price,
      coverImage,
      pdfUrl,
      categoryId
    });
    revalidatePath('/admin/books');
  } catch (error: any) {
    console.error(error);
  }
  
  const { redirect } = await import('next/navigation');
  redirect('/admin/books');
}
