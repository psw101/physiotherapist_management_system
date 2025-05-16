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
    
    // Set default fee
    const fee = Number(data.fee || 2500);
    
    // Validate appointment date
    let appointmentDate;
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
      appointmentDate: appointmentDate.toISOString(),
      startTime: data.startTime,
      duration: Number(data.duration || 60),
      status: data.status || "pending",
      reason: data.reason || "Physiotherapy session",
      fee
    });
    
    // Create the appointment with explicit type conversions
    const appointment = await prisma.appointment.create({
      data: {
        patientId: numericPatientId,
        appointmentDate,
        startTime: data.startTime || "10:00",
        duration: Number(data.duration || 60),
        status: data.status || "pending",
        reason: data.reason || "Physiotherapy session",
        paymentStatus: "unpaid",
        fee
      }
    });
    
    console.log("Created appointment:", appointment);
    
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