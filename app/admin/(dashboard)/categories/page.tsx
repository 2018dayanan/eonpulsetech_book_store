import Link from 'next/link';
import connectToDatabase from 'lib/db/connect';
import Category from 'lib/models/Category';
import { createCategory, deleteCategory, updateCategory } from './actions';

export default async function AdminCategories({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { edit } = await searchParams;
  await connectToDatabase();
  const categoriesRaw = await Category.find().sort({ createdAt: -1 }).lean();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  let editingCategory = null;
  if (edit) {
    editingCategory = categories.find((c: any) => c._id === edit);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Update Category' : 'Add New Category'}</h2>
            <form action={editingCategory ? updateCategory.bind(null, editingCategory._id) : createCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" defaultValue={editingCategory?.name} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input name="slug" defaultValue={editingCategory?.slug} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" defaultValue={editingCategory?.description} className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg">{editingCategory ? 'Update' : 'Add Category'}</button>
                {editingCategory && (
                  <Link href="/admin/categories" className="flex items-center justify-center px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg">Cancel</Link>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {categories.map((cat: any) => (
                  <tr key={cat._id.toString()}>
                    <td className="px-6 py-4 font-medium">{cat.name}</td>
                    <td className="px-6 py-4 text-neutral-500">{cat.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/categories?edit=${cat._id}`} className="text-blue-500 hover:underline">Edit</Link>
                        <form action={async () => {
                          'use server';
                          await deleteCategory(cat._id.toString());
                        }}>
                          <button className="text-red-500 hover:underline">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
