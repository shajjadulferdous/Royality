import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'
import { auth } from '@/lib/auth'

export async function POST(req) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const body = await req.json();
    console.log('Received request to create checkout session with body:', body)

    const data = await auth.api.getSession({
        headers: await headers()
    });
    const user = data?.user;
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('Creating checkout session for user:', user.email);
    const adjustable_quantity = {
      enabled: false,
    }
    const price_data = {
      currency: 'usd',
      product_data: {
        name : body?.productTitle,
      },
      unit_amount: body.price * 100, 
    }
    const metadata = {
        productId :body?.productId,
        productTitle:body?.productTitle,
        phone:body?.phone,
        address:body?.address
    }
     const session = await stripe.checkout.sessions.create({
      metadata:metadata,
      customer_email: user.email,
      line_items: [
        { adjustable_quantity: adjustable_quantity,
          price_data: price_data,
          quantity: 1,
         
        },
      ],
      mode: 'payment',
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