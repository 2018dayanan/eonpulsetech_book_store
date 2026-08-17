import { getSession, deleteSession } from 'lib/auth';
import connectToDatabase from 'lib/db/connect';
import User from 'lib/models/User';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Name</h3>
            <p className="text-lg">{user.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Email</h3>
            <p className="text-lg">{user.email}</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">My Books</h2>
          <p className="text-neutral-500">You haven't purchased any books yet.</p>
          <div className="mt-4">
            <Link href="/search" className="text-blue-600 hover:underline">Browse Books &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
