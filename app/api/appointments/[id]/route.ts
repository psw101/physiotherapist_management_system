import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

// Define extended user interface for type safety
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  role?: string;
  patientId?: number;
  hasPatientProfile?: boolean;
}

// Get single appointment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Use type assertion for session user
    const user = session.user as ExtendedUser;
    
    const appointmentId = params.id;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
      }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" }, 
        { status: 404 }
      );
    }
    
    // Check if this appointment belongs to current user
    if (appointment.patient.email !== user.email && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" }, 
      { status: 500 }
    );
  }
}

// Update appointment (e.g. cancel)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Use type assertion for session user
    const user = session.user as ExtendedUser;
    
    const appointmentId = params.id;
    const data = await request.json();
    
    // Find appointment first to check ownership
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
    
    // Verify current user owns this appointment or is admin
    if (appointment.patient.email !== user.email && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus,
        notes: data.notes
      }
    });
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" }, 
      { status: 500 }
    );
  }
}