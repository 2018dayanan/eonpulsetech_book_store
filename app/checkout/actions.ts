'use server';

import { getSession } from 'lib/auth';
import connectToDatabase from 'lib/db/connect';
import Cart from 'lib/models/Cart';
import User from 'lib/models/User';
import { cookies } from 'next/headers';

export async function placeOrder() {
  const cartId = (await cookies()).get('cartId')?.value;
  const session = await getSession();

  if (cartId) {
    await connectToDatabase();

    const cart = await Cart.findById(cartId).lean();
    if (cart && session?.userId) {
      const bookIds = cart.lines.map((line: any) => line.merchandiseId);

      await (User as any).findByIdAndUpdate(session.userId, {
        $addToSet: { purchasedBooks: { $each: bookIds } }
      });

      const Order = require('lib/models/Order').default;
      for (const bookId of bookIds) {
        await Order.create({
          userId: session.userId,
          bookId: bookId,
          paymentStatus: 'completed'
        });
      }
    }

    await Cart.findByIdAndDelete(cartId);
  }

  // Redirect to a success page or return success state
  return { success: true };
}
