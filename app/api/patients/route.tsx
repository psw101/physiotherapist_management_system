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
    
    // First check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: body.username },
          { email: body.email }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this username or email already exists" }, 
        { status: 409 }
      );
    }
    
    // Hash password once
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Use a transaction to ensure both records are created or none
    const result = await prisma.$transaction(async (tx) => {
      // Create patient record
      const patient = await tx.patient.create({
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
      
      // Create user record with proper relation to patient
      const user = await tx.user.create({
        data: {
          name: body.name,
          username: body.username,
          email: body.email,
          hashedPassword,
          // Use the proper relation field based on your schema
          // Either this way:
          patientProfile: {
            connect: {
              id: patient.id
            }
          }
          // DO NOT use patientId directly as it's not in your schema
        },
      });
      
      return { patient, user };
    });
    
    // Return both created records
    return NextResponse.json({
      patient: result.patient,
      user: result.user
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating patient:", error);
    
    // Check for unique constraint violations
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const prismaError = error as { meta?: { target: string[] } };
      const field = prismaError.meta?.target[0] || 'field'; 
      return NextResponse.json(
        { error: `A patient with this ${field} already exists` }, 
        { status: 409 }
      );
    }
    
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