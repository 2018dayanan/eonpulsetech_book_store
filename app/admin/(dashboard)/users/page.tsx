import connectToDatabase from 'lib/db/connect';
import User from 'lib/models/User';

export default async function AdminUsers() {
  await connectToDatabase();
  const users = await User.find().sort({ createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium">Purchased Books</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {users.map((user: any) => (
              <tr key={user._id.toString()}>
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-neutral-500">{user.email}</td>
                <td className="px-6 py-4 text-neutral-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-neutral-500">{user.purchasedBooks?.length || 0}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
