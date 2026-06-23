import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'
import { auth } from '@/lib/auth'

export async function POST() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const data = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    });
    const user = data?.user;
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log('Creating checkout session for user:', user.email)
    // Create Checkout Sessions from body params.
     const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: 'price_1TlWOPRTPEHhYAt8P6LxpfQY',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    });
    console.log('Checkout session created:', session)
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}