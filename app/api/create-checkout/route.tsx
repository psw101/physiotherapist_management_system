import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { format } from 'date-fns';
import { prisma } from '@/prisma/client';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();
    
    console.log("Creating checkout for appointment:", appointmentId);
    
    // Get the appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { 
        patient: {
          include: {
            user: true
          }
        },
        appointmentSlot: true
      }
    });
    
    if (!appointment) {
      console.error("Appointment not found:", appointmentId);
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    
    console.log("Found appointment:", {
      id: appointment.id,
      date: appointment.appointmentDate,
      time: appointment.startTime,
      fee: appointment.fee
    });
    
    // Payment amount is the full appointment fee
    const paymentAmount = appointment.fee;
    
    // Format the appointment date for display
    const appointmentDate = format(
      new Date(appointment.appointmentDate), 
      'MMMM d, yyyy'
    );
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Physiotherapy Appointment',
              description: `Appointment on ${appointmentDate} at ${appointment.startTime}`,
            },
            unit_amount: Math.round(paymentAmount * 100), // Convert to paisa (cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/appointment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointments/book-appointments`,
      metadata: {
        orderDetails: JSON.stringify({
          type: 'appointment',
          appointmentId: appointment.id,
          totalFee: paymentAmount
        })
      },
    });
    
    console.log("Checkout session created:", {
      sessionId: session.id,
      url: session.url
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { 
        error: "Failed to create checkout session", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}