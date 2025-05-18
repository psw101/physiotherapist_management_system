import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  console.log("API verify-checkout: Received session_id:", sessionId);

  if (!sessionId) {
    return NextResponse.json(
      { error: "No session ID provided" },
      { status: 400 }
    );
  }

  try {
    console.log("API verify-checkout: Fetching session from Stripe...");
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    console.log("API verify-checkout: Session retrieved successfully:", {
      id: session.id,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("API verify-checkout: Error retrieving session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}