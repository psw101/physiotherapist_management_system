import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema
const slotSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format").optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format").optional(),
  capacity: z.number().int().min(1).optional(),
  isAvailable: z.boolean().optional(),
});

// Get a specific slot
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Get slot with appointment information
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
                contactNumber: true
              }
            }
          }
        }
      }
    });
    
    if (!slot) {
      return NextResponse.json(
        { error: "Appointment slot not found" },
        { status: 404 }
      );
    }
    
    // Add computed properties
    const enhancedSlot = {
      ...slot,
      isFull: slot.bookedCount >= slot.capacity,
      remainingCapacity: Math.max(0, slot.capacity - slot.bookedCount)
    };
    
    return NextResponse.json(enhancedSlot);
  } catch (error) {
    console.error("Error fetching slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment slot" },
      { status: 500 }
    );
  }
}

// Update a specific slot
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Get existing slot
    const existingSlot = await prisma.appointmentSlot.findUnique({
      where: { id },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    });
    
    if (!existingSlot) {
      return NextResponse.json(
        { error: "Appointment slot not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validation = slotSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    
    // Check capacity vs. existing bookings
    if (body.capacity !== undefined && body.capacity < existingSlot._count.appointments) {
      return NextResponse.json(
        { error: "Cannot reduce capacity below current booking count" },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (body.date) updateData.date = new Date(body.date);
    if (body.startTime) updateData.startTime = body.startTime;
    if (body.endTime) updateData.endTime = body.endTime;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
    
    // Update slot
    const updatedSlot = await prisma.appointmentSlot.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json(
      { error: "Failed to update appointment slot" },
      { status: 500 }
    );
  }
}

// Delete a specific slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Check if slot has appointments
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    });
    
    if (!slot) {
      return NextResponse.json(
        { error: "Appointment slot not found" },
        { status: 404 }
      );
    }
    
    if (slot._count.appointments > 0) {
      return NextResponse.json(
        { error: "Cannot delete slot with existing appointments" },
        { status: 400 }
      );
    }
    
    // Delete slot
    await prisma.appointmentSlot.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Appointment slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment slot" },
      { status: 500 }
    );
  }
}