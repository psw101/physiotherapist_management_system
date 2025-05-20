import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { format } from "date-fns";
import { prisma } from "@/prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();
    
    if (!appointmentId) {
      console.error("Missing appointmentId in request body");
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    console.log("Creating checkout for appointment:", appointmentId);

    // Get the appointment details with related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        appointmentSlot: true,
      },
    });

    if (!appointment) {
      console.error("Appointment not found:", appointmentId);
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    console.log("Found appointment:", {
      id: appointment.id,
      patientId: appointment.patientId,
      date: appointment.appointmentDate,
      fee: appointment.fee
    });

    // Format the appointment date for display
    const appointmentDate = format(
      new Date(appointment.appointmentDate),
      "MMMM d, yyyy"
    );

    // Get the origin for the success and cancel URLs
    const origin = request.headers.get("origin") || 
                  process.env.NEXT_PUBLIC_APP_URL || 
                  "http://localhost:3000";

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: Math.round(appointment.fee * 100), // Convert to cents/paisa
            product_data: {
              name: "Physiotherapy Appointment",
              description: `Appointment on ${appointmentDate} at ${appointment.startTime}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout/appointment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/appointments/book-appointments`,
      metadata: {
        orderDetails: JSON.stringify({
          type: "appointment",
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          appointmentDate: appointmentDate,
          appointmentTime: appointment.startTime,
          duration: appointment.duration,
          reason: appointment.reason || "Physiotherapy session",
          slotId: appointment.slotId,
          totalFee: appointment.fee,
        }),
      },
    });

    console.log("Checkout session created:", {
      id: session.id,
      url: session.url
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { 
        error: "Failed to create checkout session", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}