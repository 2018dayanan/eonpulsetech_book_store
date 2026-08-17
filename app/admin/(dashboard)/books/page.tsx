import connectToDatabase from 'lib/db/connect';
import Book from 'lib/models/Book';
import Category from 'lib/models/Category';
import Link from 'next/link';
import { createBook, deleteBook, updateBook } from './actions';

export default async function AdminBooks({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page, edit } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  await connectToDatabase();

  const totalBooks = await Book.countDocuments();
  const totalPages = Math.ceil(totalBooks / limit);

  const booksRaw = await Book.find()
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const books = JSON.parse(JSON.stringify(booksRaw));

  const categoriesRaw = await Category.find().sort({ name: 1 }).lean();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  let editingBook = null;
  if (edit && typeof edit === 'string') {
    const rawBook = await (Book as any).findById(edit).lean();
    if (rawBook) {
      editingBook = JSON.parse(JSON.stringify(rawBook));
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Books</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{editingBook ? 'Update Book' : 'Add New Book'}</h2>
            <form action={editingBook ? updateBook.bind(null, editingBook._id) : createBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" defaultValue={editingBook?.title} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="categoryId" defaultValue={editingBook?.categoryId?.toString()} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent">
                  <option value="">Select a category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id.toString()} value={cat._id.toString()}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (INR)</label>
                <input type="number" name="price" defaultValue={editingBook?.price} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                <input type="url" name="coverImage" defaultValue={editingBook?.coverImage} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PDF URL</label>
                <input type="url" name="pdfUrl" defaultValue={editingBook?.pdfUrl} required className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" defaultValue={editingBook?.description} required rows={3} className="w-full px-4 py-2 rounded-lg border dark:border-neutral-700 bg-transparent" />
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg">{editingBook ? 'Update' : 'Add Book'}</button>
                {editingBook && (
                  <Link href={`/admin/books?page=${currentPage}`} className="flex items-center justify-center px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg">Cancel</Link>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden mb-4">
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
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/books?page=${currentPage}&edit=${book._id}`} className="text-blue-500 hover:underline">Edit</Link>
                        <form action={async () => {
                          'use server';
                          await deleteBook(book._id.toString());
                        }}>
                          <button className="text-red-500 hover:underline">Delete</button>
                        </form>
                      </div>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
              <Link
                href={currentPage > 1 ? `/admin/books?page=${currentPage - 1}` : '#'}
                className={`px-4 py-2 rounded-lg border ${currentPage > 1 ? 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'border-neutral-200 text-neutral-400 cursor-not-allowed dark:border-neutral-800 dark:text-neutral-600'}`}
              >
                Previous
              </Link>
              <span className="text-sm font-medium text-neutral-500">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={currentPage < totalPages ? `/admin/books?page=${currentPage + 1}` : '#'}
                className={`px-4 py-2 rounded-lg border ${currentPage < totalPages ? 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800' : 'border-neutral-200 text-neutral-400 cursor-not-allowed dark:border-neutral-800 dark:text-neutral-600'}`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
