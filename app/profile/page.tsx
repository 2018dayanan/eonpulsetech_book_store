import { deleteSession, getSession } from 'lib/auth';
import connectToDatabase from 'lib/db/connect';
import User from 'lib/models/User';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import ProfileForm from 'components/profile/profile-form';

import Book from 'lib/models/Book';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  await connectToDatabase();
  const user = await User.findOne({ _id: session.userId } as any).lean();

  if (!user) {
    redirect('/login');
  }

  let purchasedBooks: any[] = [];
  if (user.purchasedBooks && user.purchasedBooks.length > 0) {
    purchasedBooks = await Book.find({ _id: { $in: user.purchasedBooks } } as any).lean();
  }

  async function logout() {
    "use server";
    await deleteSession();
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-4xl p-8 mt-12">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <form action={logout}>
            <button className="text-red-500 hover:text-red-600 font-medium">Log Out</button>
          </form>
        </div>

        <ProfileForm user={user} />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">My Books</h2>
          {purchasedBooks.length === 0 ? (
            <>
              <p className="text-neutral-500">You haven't purchased any books yet.</p>
              <div className="mt-4">
                <Link href="/search" className="text-blue-600 hover:underline">Browse Books &rarr;</Link>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {purchasedBooks.map((book) => (
                <div key={book._id.toString()} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex flex-col">
                  <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-900">
                    <img src={book.coverImage} alt={book.title} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold mb-2">{book.title}</h3>
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{book.description}</p>
                    <div className="mt-auto">
                      <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                        Read PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
