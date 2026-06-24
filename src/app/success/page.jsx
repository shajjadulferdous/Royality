import { redirect } from 'next/navigation';
import Link from 'next/link';
import { stripe } from '../../lib/stripe';
import { FiCheckCircle, FiMail, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { Button } from '@heroui/react';

export default async function Success({ searchParams }) {
  // In Next.js 15+, searchParams is a promise
  const { session_id } = await searchParams;

  if (!session_id) {
    throw new Error('Please provide a valid session_id (`cs_test_...`)');
  }
  
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  });
  const {status, customer_email: customerEmail} = session;
  if (status === 'open') {
    return redirect('/');
  }
   
  console.log('Checkout session details:', session);
  if (status === 'complete') {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
           transactionId: session.payment_intent?.id,
           customerEmail,
           productId: session.metadata.productId,
           productTitle: session.metadata.productTitle,
           amount: session.amount_total / 100, // Convert cents to dollars
           currency: session.currency,
           paymentStatus: session.payment_status  
      })
    }).catch((error) => {
      console.error('Error recording order in the database:', error);
      throw new Error('Failed to record order in the database');    
      });

    if (!response.ok) {
      throw new Error('Failed to record order in the database');
    }

    return (
      <section id="success" className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          
          {/* Decorative Top Accent */}
          <div className="h-3 w-full bg-gradient-to-r from-[#35858E] to-[#4ab3be]"></div>

          <div className="p-8 sm:p-10 text-center flex flex-col items-center">
            
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle className="w-10 h-10 text-green-500" />
            </div>

            {/* Typography */}
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-slate-500 text-lg mb-8">
              We appreciate your business. Your order is currently being processed.
            </p>

            {/* Email Confirmation Box */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#35858E]">
                <FiMail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">An order confirmation has been sent to:</p>
                <p className="text-base font-bold text-slate-900 break-all">{customerEmail}</p>
              </div>
            </div>

            {/* Support Info */}
            <p className="text-sm text-slate-500 mb-8">
              If you have any questions or need assistance, please email us at{' '}
              <a href="mailto:orders@example.com" className="font-semibold text-[#35858E] hover:underline">
                orders@example.com
              </a>.
            </p>

            {/* Actions */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/buyer/my-orders" className="flex-1">
                <Button 
                  className="w-full h-12 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <FiShoppingBag className="mr-2 w-4 h-4" />
                  View Orders
                </Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button 
                  className="w-full h-12 bg-[#35858E] text-white font-bold rounded-xl hover:bg-[#2b6d75] transition-all shadow-lg shadow-[#35858E]/20"
                >
                  Continue Shopping
                  <FiArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    );
  }

  // Fallback state if status is somehow not open or complete
  return redirect('/');
}