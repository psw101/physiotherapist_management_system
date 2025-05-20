import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      appointmentDate,
      startTime,
      duration,
      reason,
      patientId,
      slotId,
      fee,
      paymentId,
      status
    } = body;

    // Validate the required fields
    if (!appointmentDate || !startTime || !patientId || !slotId) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create the appointment directly with confirmed status
    const appointment = await prisma.appointment.create({
      data: {
        appointmentDate: new Date(appointmentDate),
        startTime: startTime,
        duration: duration || 60,
        status: status || "confirmed",
        reason: reason || "Physiotherapy session",
        patientId: patientId,
        slotId: slotId,
        fee: fee || 2500,
        paymentStatus: paymentId ? "paid" : "pending",
        paymentId: paymentId || null
      },
    });

    // Update slot availability - FIXED MODEL NAME HERE
    await prisma.appointmentSlot.update({
      where: { id: slotId },
      data: { 
        isAvailable: false,
        bookedCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error("Failed to create appointment:", error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}