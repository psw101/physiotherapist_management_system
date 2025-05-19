import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Parse request data first
    const data = await request.json();
    console.log("Received appointment data:", data);
    
    // Get session after parsing data to avoid timing issues
    const session = await getServerSession(authOptions);
    
    // Allow both authenticated and unauthenticated requests (for testing)
    let patientId = data.patientId;

    if (session?.user) {
      // Use type assertion to access patientId from session
      patientId = (session.user as any).patientId || data.patientId;
    }
    
    // Convert patientId to a number and validate
    const numericPatientId = Number(patientId);
    
    if (!numericPatientId || isNaN(numericPatientId)) {
      console.error("Invalid patientId:", patientId);
      return NextResponse.json(
        { error: "Valid patient ID is required" }, 
        { status: 400 }
      );
    }
    
    // Validate slotId - this is required to connect appointment to slot
    if (!data.slotId) {
      console.error("Missing slotId in request");
      return NextResponse.json(
        { error: "Appointment slot ID is required" },
        { status: 400 }
      );
    }
    
    // Convert slotId to a number if it's a string
    const slotId = typeof data.slotId === 'string' ? parseInt(data.slotId) : data.slotId;
    
    if (isNaN(slotId)) {
      console.error("Invalid slotId format:", data.slotId);
      return NextResponse.json(
        { error: "Invalid appointment slot ID format" },
        { status: 400 }
      );
    }
    
    // Verify the slot exists and is available
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id: slotId }
    });
    
    if (!slot) {
      console.error("Slot not found:", slotId);
      return NextResponse.json(
        { error: "Appointment slot not found" },
        { status: 404 }
      );
    }
    
    if (!slot.isAvailable) {
      console.error("Slot is not available:", slotId);
      return NextResponse.json(
        { error: "This appointment slot is no longer available" },
        { status: 400 }
      );
    }
    
    if (slot.bookedCount >= slot.capacity) {
      console.error("Slot is at full capacity:", slotId);
      return NextResponse.json(
        { error: "This appointment slot is fully booked" },
        { status: 400 }
      );
    }
    
    // Set default fee
    const fee = Number(data.fee || 2500);
    
    // Validate appointment date
    let appointmentDate;
    console.log(JSON.stringify(data, null, 2));
    try {
      appointmentDate = new Date(data.appointmentDate);
      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (err) {
      console.error("Invalid appointment date:", data.appointmentDate);
      return NextResponse.json(
        { error: "Invalid appointment date format" }, 
        { status: 400 }
      );
    }
    
    console.log("Creating appointment with data:", {
      patientId: numericPatientId,
      slotId: slotId,
      appointmentDate: appointmentDate.toISOString(),
      startTime: data.startTime,
      duration: Number(data.duration || 60),
      status: data.status || "pending",
      reason: data.reason || "Physiotherapy session",
      fee
    });
    
    // Use a transaction to create the appointment and update the slot's bookedCount
    const [appointment, updatedSlot] = await prisma.$transaction([
      // Create the appointment with explicit type conversions
      prisma.appointment.create({
        data: {
          patientId: numericPatientId,
          appointmentDate,
          startTime: data.startTime || "10:00",
          duration: Number(data.duration || 60),
          status: data.status || "pending",
          reason: data.reason || "Physiotherapy session",
          paymentStatus: "unpaid",
          fee,
          
          // Connect to the appointment slot using the correct field name
          // from your Prisma schema (likely "slotId")
          slotId: slotId,
          
          // Also connect to physiotherapist if available from slot
          physiotherapistId: slot.physiotherapistId
        }
      }),
      
      // Increment the bookedCount of the slot
      prisma.appointmentSlot.update({
        where: { id: slotId },
        data: {
          bookedCount: {
            increment: 1
          },
          // If we reach capacity, can also mark as unavailable
          isAvailable: slot.bookedCount + 1 < slot.capacity
        }
      })
    ]);
    
    console.log("Created appointment:", appointment);
    console.log("Updated slot:", updatedSlot);
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to create appointment:", error);
    
    // Return detailed error for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      // Log Prisma errors more specifically
      if (error.name === 'PrismaClientKnownRequestError') {
        console.error("Prisma error code:", (error as any).code);
        console.error("Prisma error meta:", (error as any).meta);
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create appointment", 
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}