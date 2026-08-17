import { getSession } from 'lib/auth';
import CheckoutClient from './checkout-client';

export default async function CheckoutPage() {
  const session = await getSession();

  return (
    <CheckoutClient hasSession={!!session} />
  );
}
