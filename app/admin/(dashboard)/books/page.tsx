import connectToDatabase from 'lib/db/connect';
import Book from 'lib/models/Book';
import Category from 'lib/models/Category';
import { createBook, deleteBook } from './actions';

export default async function AdminBooks() {
  await connectToDatabase();
  const books = await Book.find().populate('categoryId', 'name').sort({ createdAt: -1 }).lean();
  const categories = await Category.find().sort({ name: 1 }).lean();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Books</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <form action={createBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="categoryId" required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent">
                  <option value="">Select a category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id.toString()} value={cat._id.toString()}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (INR)</label>
                <input type="number" name="price" required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                <input type="url" name="coverImage" required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PDF URL</label>
                <input type="url" name="pdfUrl" required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" required rows={3} className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>
              
              <button className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg">Add Book</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Book</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {books.map((book: any) => (
                  <tr key={book._id.toString()}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={book.coverImage} alt={book.title} className="w-10 h-10 object-cover rounded bg-neutral-100" />
                        <span className="font-medium">{book.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{book.categoryId?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-neutral-500">₹{book.price}</td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        'use server';
                        await deleteBook(book._id.toString());
                      }}>
                        <button className="text-red-500 hover:underline">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No books found.</td>
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
