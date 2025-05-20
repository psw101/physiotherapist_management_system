// pages/api/checkout_sessions.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use a currently supported API version
  apiVersion: "2025-04-30.basil", // Updated to a currently supported version
});

export async function POST(request: NextRequest) {
  try {
    // Get request body to accept dynamic product details
    const body = await request.json();
    const { items, orderId, orderDetails } = body || {
      items: [
        {
          name: "Sample Product",
          price: 2000,
          quantity: 1,
        },
      ],
    };

    // Get origin for success/cancel URLs
    const origin = request.headers.get("origin") || request.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: Array.isArray(items)
        ? items.map((item) => ({
            price_data: {
              currency: "lkr", // Changed to LKR (Sri Lankan Rupee)
              product_data: {
                name: item.name || "Product",
                // Add optional description if available
                ...(item.description ? { description: item.description } : {}),
              },
              unit_amount: Math.round(item.price * 100), // Convert to lowest denomination (cents)
            },
            quantity: item.quantity || 1,
          }))
        : [
            {
              price_data: {
                currency: "lkr", // Changed to LKR (Sri Lankan Rupee)
                product_data: {
                  name: "Sample Product",
                },
                unit_amount: 2000 * 100, // LKR 2,000.00 (converted to cents)
              },
              quantity: 1,
            },
          ],
      // Add metadata for order tracking
      metadata: {
        ...(orderId ? { orderId: orderId } : {}),
        ...(orderDetails ? { orderDetails: JSON.stringify(orderDetails) } : {}),
      },
      success_url:
        orderDetails?.type === "appointment"
          ? `${origin}/checkout/appointment-success?session_id={CHECKOUT_SESSION_ID}`
          : `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    // Return JSON response with session ID
    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
