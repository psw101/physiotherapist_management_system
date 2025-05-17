import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    
    // Prepare filters
    const where: any = {
      isAvailable: true
    };
    
    // Only show slots where bookedCount < capacity
    where.bookedCount = {
      lt: prisma.appointmentSlot.fields.capacity
    };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else {
      // Default to future dates only
      where.date = {
        gte: new Date()
      };
    }
    
    // Get available slots
    const slots = await prisma.appointmentSlot.findMany({
      where,
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ]
    });
    console.log(JSON.stringify(slots, null, 2));
    // Add remaining capacity information
    const enhancedSlots = slots.map(slot => ({
      ...slot,
      remainingCapacity: slot.capacity - slot.bookedCount,
      isFull: slot.bookedCount >= slot.capacity
    }));
    
    // console.log(JSON.stringify(enhancedSlots, null, 2));
    return NextResponse.json(enhancedSlots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}