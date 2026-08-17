'use client';

import { useState } from 'react';
import { placeOrder } from './actions';
import Link from 'next/link';

export default function CheckoutClient({ hasSession }: { hasSession: boolean }) {
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | null>(null);
  const [onlineGateway, setOnlineGateway] = useState<string | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gateways = [
    { id: 'stripe', name: 'Credit Card (Stripe)' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'razorpay', name: 'Razorpay' },
    { id: 'esewa', name: 'eSewa' }
  ];

  async function handlePlaceOrder() {
    if (!paymentMethod) return;
    if (paymentMethod === 'online' && !onlineGateway) return;

    setIsSubmitting(true);
    const result = await placeOrder();
    if (result.success) {
      setIsPlaced(true);
    }
    setIsSubmitting(false);
  }

  if (isPlaced) {
    return (
      <div className="mx-auto max-w-2xl p-8 mt-24 text-center">
        <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-neutral-500 mb-8 text-lg">
          Thank you for your purchase. You selected {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}. 
          Since this is a demo, no actual payment was processed.
        </p>
        <Link href={hasSession ? "/profile" : "/"} className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition">
          {hasSession ? "View My Books" : "Return to Home"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8 mt-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setPaymentMethod('online')}
            className={`p-4 border rounded-lg text-left transition ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'}`}
          >
            <div className="font-bold text-lg mb-1">Online Payment</div>
            <div className="text-sm text-neutral-500">Pay securely using popular gateways.</div>
          </button>
          
          <button 
            onClick={() => setPaymentMethod('cod')}
            className={`p-4 border rounded-lg text-left transition ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'}`}
          >
            <div className="font-bold text-lg mb-1">Cash on Delivery</div>
            <div className="text-sm text-neutral-500">Pay when you receive the product.</div>
          </button>
        </div>
      </div>

      {paymentMethod === 'online' && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold mb-4">Select Online Gateway (Mock)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gateways.map((g) => (
              <button
                key={g.id}
                onClick={() => setOnlineGateway(g.id)}
                className={`p-4 border rounded-lg text-center transition font-medium ${onlineGateway === g.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 mt-8">
        <button
          onClick={handlePlaceOrder}
          disabled={!paymentMethod || (paymentMethod === 'online' && !onlineGateway) || isSubmitting}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Place Order Now'}
        </button>
      </div>
    </div>
  );
}
