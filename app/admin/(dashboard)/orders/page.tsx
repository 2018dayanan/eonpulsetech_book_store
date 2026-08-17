import connectToDatabase from 'lib/db/connect';
import Order from 'lib/models/Order';

export default async function AdminOrders() {
  await connectToDatabase();
  const orders = await Order.find().populate('userId', 'name email').populate('bookId', 'title price').sort({ createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Book</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {orders.map((order: any) => (
              <tr key={order._id.toString()}>
                <td className="px-6 py-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{order.userId?.name || 'Unknown'}</div>
                  <div className="text-xs text-neutral-500">{order.userId?.email || ''}</div>
                </td>
                <td className="px-6 py-4 font-medium">{order.bookId?.title || 'Unknown Book'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize">
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
