import { cookies } from 'next/headers';
import Link from 'next/link';
import connectToDatabase from 'lib/db/connect';
import Cart from 'lib/models/Cart';
import { getSession } from 'lib/auth';

export default async function CheckoutPage() {
  const cartId = (await cookies()).get('cartId')?.value;
  const session = await getSession();

  if (cartId) {
    await connectToDatabase();
    
    const cart = await Cart.findById(cartId).lean();
    if (cart && session?.userId) {
      const bookIds = cart.lines.map((line: any) => line.merchandiseId);
      
      const User = require('lib/models/User').default;
      await User.findByIdAndUpdate(session.userId, {
        $addToSet: { purchasedBooks: { $each: bookIds } }
      });
    }

    await Cart.findByIdAndDelete(cartId);
  }

  return (
    <div className="mx-auto max-w-2xl p-8 mt-24 text-center">
      <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-neutral-500 mb-8 text-lg">
        Thank you for your purchase. Since this is a demo, we skipped the payment gateway.
      </p>
      <Link href={session ? "/profile" : "/"} className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition">
        {session ? "View My Books" : "Return to Home"}
      </Link>
    </div>
  );
}
