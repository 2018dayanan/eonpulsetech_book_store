import connectToDatabase from 'lib/db/connect';
import Book from 'lib/models/Book';
import User from 'lib/models/User';
import Category from 'lib/models/Category';

export default async function AdminDashboardOverview() {
  await connectToDatabase();

  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalCategories = await Category.countDocuments();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Total Books</h3>
          <p className="text-4xl font-bold">{totalBooks}</p>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{totalUsers}</p>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Total Categories</h3>
          <p className="text-4xl font-bold">{totalCategories}</p>
        </div>
      </div>
    </div>
  );
}
