import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/client";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const appointmentId = params.id;
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" }, 
        { status: 404 }
      );
    }
    
    // Verify the appointment belongs to the current user
    if (appointment.patient.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // In a real app, you would process payment here
    // For demo, we'll just mark it as paid
    
    const paymentData = await request.json();
    
    // Update appointment payment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: "paid",
        status: "scheduled"
      }
    });
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amount: appointment.fee,
        method: "card",
        status: "completed",
        transactionId: `txn_${Date.now()}`
      }
    });
    
    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      payment
    });
  } catch (error) {
    console.error("Payment failed:", error);
    return NextResponse.json(
      { error: "Payment processing failed" }, 
      { status: 500 }
    );
  }
}