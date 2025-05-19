import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema
const slotSchema = z.object({
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Invalid date format" }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  capacity: z.number().int().min(1).default(1),
  isAvailable: z.boolean().default(true),
});

// Get all slots with optional filters
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const available = searchParams.get("available");
    
    // Prepare filters
    const where: any = {};
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    
    if (available) {
      where.isAvailable = available === "true";
    }
    
    // Get slots with booking information, including appointments data
    const slots = await prisma.appointmentSlot.findMany({
      where,
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ],
      include: {
        physiotherapist: {
          select: {
            name: true,
            specialization: true
          }
        },
        _count: {
          select: { appointments: true }
        },
        // Include appointments to count by status
        appointments: {
          select: {
            id: true,
            status: true,
            paymentStatus: true
          }
        }
      }
    });
    
    // Format response for easier consumption
    const formattedSlots = slots.map(slot => {
      // Count pending appointments
      const pendingAppointments = slot.appointments.filter(
        appointment => appointment.status.toLowerCase() === "pending"
      ).length;
      
      // Count scheduled appointments
      const scheduledAppointments = slot.appointments.filter(
        appointment => appointment.status.toLowerCase() === "scheduled"
      ).length;
      
      // Count appointments by payment status
      const unpaidAppointments = slot.appointments.filter(
        appointment => appointment.paymentStatus.toLowerCase() === "unpaid"
      ).length;
      
      return {
        ...slot,
        isFull: slot.bookedCount >= slot.capacity,
        appointmentCount: slot._count.appointments,
        pendingAppointments,
        scheduledAppointments,
        activeAppointments: pendingAppointments + scheduledAppointments,
        unpaidAppointments,
        physiotherapistName: slot.physiotherapist?.name || "Unassigned",
        remainingCapacity: Math.max(0, slot.capacity - slot.bookedCount)
      };
    });
    
    return NextResponse.json(formattedSlots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment slots" },
      { status: 500 }
    );
  }
}

// Create a new slot
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    
    // Parse the date string to a Date object
    const dateObj = new Date(body.date);
    
    // Check if slot already exists
    const existingSlot = await prisma.appointmentSlot.findFirst({
      where: {
        date: {
          gte: new Date(dateObj.setHours(0, 0, 0, 0)),
          lt: new Date(dateObj.setHours(23, 59, 59, 999)),
        },
        startTime: body.startTime
      }
    });
    
    if (existingSlot) {
      return NextResponse.json(
        { error: "A slot with this date and start time already exists" },
        { status: 409 }
      );
    }
    
    // Create new slot
    const newSlot = await prisma.appointmentSlot.create({
      data: {
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        capacity: body.capacity,
        isAvailable: body.isAvailable,
        bookedCount: 0
      }
    });
    
    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error("Error creating slot:", error);
    return NextResponse.json(
      { error: "Failed to create appointment slot" },
      { status: 500 }
    );
  }
}