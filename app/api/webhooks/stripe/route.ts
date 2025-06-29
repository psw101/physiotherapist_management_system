import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil", 
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // Get the raw body as buffer for signature verification
    const rawBody = await req.text();
    
    // Validate the signature from Stripe
    let event: Stripe.Event;
    try {
      const signature = req.headers.get('stripe-signature');
      if (!signature || !webhookSecret) {
        return NextResponse.json({ error: 'Webhook signature missing or secret not configured' }, { status: 400 });
      }
      
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
    
    // Handle the specific event type
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Processing checkout session:", session.id);
      
      // Extract order details from metadata
      if (!session.metadata?.orderDetails) {
        console.error("No order details found in session metadata");
        return NextResponse.json({ error: "No order details found" }, { status: 400 });
      }
      
      try {
        const orderDetails = JSON.parse(session.metadata.orderDetails);
        console.log("Order type:", orderDetails.type);
        
        if (orderDetails.type === 'appointment') {
          await handleAppointmentPayment(session, orderDetails);
        } else {
          await handleProductPayment(session, orderDetails);
        }
        
        return NextResponse.json({ received: true, type: event.type });
      } catch (error) {
        console.error("Error processing webhook payment:", error);
        return NextResponse.json({ error: "Error processing payment" }, { status: 500 });
      }
    }
    
    return NextResponse.json({ received: true, type: event.type });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handleAppointmentPayment(session: Stripe.Checkout.Session, orderDetails: any) {
  try {
    const { id: appointmentId, patientId } = orderDetails;
    
    if (!appointmentId) {
      throw new Error('Missing appointment ID');
    }
    
    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'scheduled',
        paymentStatus: 'paid'
      }
    });
    
    // Extract payment intent ID
    const paymentIntentId = typeof session.payment_intent === 'object' 
      ? (session.payment_intent as any).id 
      : session.payment_intent;
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amount: session.amount_total! / 100,
        method: 'card',
        status: 'completed', // Normalized to lowercase
        transactionId: paymentIntentId,
        paymentType: 'appointment',
        patientId: parseInt(patientId)
      }
    });
    
    console.log(`Appointment payment created:`, payment);
  } catch (error) {
    console.error('Error processing appointment payment:', error);
    throw error;
  }
}

async function handleProductPayment(session: Stripe.Checkout.Session, orderDetails: any) {
  try {
    const { productId, quantity = 1, customizations } = orderDetails;
    
    if (!productId) {
      throw new Error('Missing product ID');
    }
    
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    // Find user ID from the session if needed
    const totalPrice = (product.price || 0) * quantity;
    
    // Get user ID from the email if possible
    let userId = null;
    if (session.customer_details?.email) {
      const user = await prisma.user.findFirst({
        where: { email: session.customer_details.email }
      });
      userId = user?.id;
    }
    
    if (!userId) {
      throw new Error('Unable to find user for product order');
    }
    
    // Create product order
    const productOrder = await prisma.productOrder.create({
      data: {
        userId,
        productId: parseInt(productId),
        quantity,
        totalPrice,
        customizations: customizations || {},
        status: 'paid' // Set directly to paid
      }
    });
    
    // Extract payment intent ID
    const paymentIntentId = typeof session.payment_intent === 'object' 
      ? (session.payment_intent as any).id 
      : session.payment_intent;
    
    // Find patient ID from user if possible
    let patientId = null;
    const patient = await prisma.patient.findFirst({
      where: { userId }
    });
    patientId = patient?.id;
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        productOrderId: productOrder.id,
        amount: session.amount_total! / 100,
        method: 'card',
        status: 'completed', // Normalized to lowercase
        transactionId: paymentIntentId,
        paymentType: 'product',
        patientId
      }
    });
    
    console.log(`Product payment created:`, payment);
  } catch (error) {
    console.error('Error processing product payment:', error);
    throw error;
  }
}

// This empty export is needed for Next.js to recognize this route
export const config = {
  runtime: 'edge',
};
