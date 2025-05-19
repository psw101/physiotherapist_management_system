import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/client";  
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Use type assertion to access patientId from session
    const user = session!.user as any;
    const patientId = user.patientId;
    
    console.log("Fetching appointments for patientId:", patientId);
    
    if (!patientId) {
      return NextResponse.json(
        { error: "Patient profile not found" }, 
        { status: 404 }
      );
    }
    
    // Get all appointments for the patient
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientId
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });
    
    console.log(`Found ${appointments.length} appointments`);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" }, 
      { status: 500 }
    );
  }
}