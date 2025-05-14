import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/client";import { z } from 'zod';



// Validation schema for patient updates
const updatePatientSchema = z.object({
  name: z.string().min(1, { message: "Full name is required" }).optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .optional(),
  age: z.number()
    .int({ message: "Age must be a whole number" })
    .positive({ message: "Age must be positive" })
    .max(120, { message: "Invalid age" })
    .optional(),
  contactNumber: z.string()
    .min(10, { message: "Contact number is too short" })
    .max(15, { message: "Contact number is too long" })
    .regex(/^[0-9+\-\s()]+$/, { message: "Invalid contact number format" })
    .optional(),
  email: z.string()
    .email({ message: "Invalid email address" })
    .optional(),
  area: z.string()
    .min(1, { message: "Area is required" })
    .optional(),
  nic: z.string()
    .min(1, { message: "NIC/Passport number is required" })
    .optional(),
  address: z.string()
    .min(5, { message: "Please provide a complete address" })
    .optional(),
});

// GET handler - Retrieve a specific patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT handler - Update a patient by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = updatePatientSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if username is unique if being updated
    if (body.username && body.username !== existingPatient.username) {
      const usernameExists = await prisma.patient.findFirst({
        where: {
          username: body.username,
          id: { not: id },
        },
      });

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Check if email is unique if being updated
    if (body.email && body.email !== existingPatient.email) {
      const emailExists = await prisma.patient.findFirst({
        where: {
          email: body.email,
          id: { not: id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    // Check if NIC is unique if being updated
    if (body.nic && body.nic !== existingPatient.nic) {
      const nicExists = await prisma.patient.findFirst({
        where: {
          nic: body.nic,
          id: { not: id },
        },
      });

      if (nicExists) {
        return NextResponse.json(
          { error: 'NIC number is already registered' },
          { status: 400 }
        );
      }
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a patient by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  try {
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Delete the patient
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Patient deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}