import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { patientSchema } from "../validationSchemas";
import bcrypt from "bcrypt";

// Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = patientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() }, 
        { status: 400 }
      );
    }
    bcrypt.hash(body.password, 10);
    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        username: body.username,
        age: body.age,
        contactNumber: body.contactNumber,
        email: body.email,
        area: body.area,
        nic: body.nic,
        address: body.address,
      },
    });
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        hashedPassword
      },
    });


    return NextResponse.json(patient, { status: 201 });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    
    // // Check for unique constraint violations
    // if (error.code === 'P2002') {
    //   const field = error.meta?.target[0] || 'field'; 
    //   return NextResponse.json(
    //     { error: `A patient with this ${field} already exists` }, 
    //     { status: 409 }
    //   );
    // }
    
    return NextResponse.json(
      { error: "Failed to create patient" }, 
      { status: 500 }
    );
  }
}

// Get all patients
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        age: true,
        contactNumber: true,
        email: true,
        area: true,
        nic: true,
        address: true,
        // Exclude password for security
      },
    });
    
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" }, 
      { status: 500 }
    );
  }
}