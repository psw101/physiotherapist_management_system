import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { format, startOfDay, endOfDay, addMonths } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    console.log("API: Fetching available slots...");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    // Add includeAll parameter to fetch all slots without date filtering if needed
    const includeAll = searchParams.get("includeAll") === "true";
    
    console.log("API: Date filter:", date, "Include all:", includeAll);
    
    // First check if any slots exist at all
    const slotCount = await prisma.appointmentSlot.count();
    console.log(`API: Total slots in database: ${slotCount}`);
    
    if (slotCount === 0) {
      console.log("API: No slots found in database!");
      return NextResponse.json([]);
    }
    
    // Prepare filters
    const where: any = {
      isAvailable: true
    };
    
    if (date) {
      const dateObj = new Date(date);
      const start = startOfDay(dateObj);
      const end = endOfDay(dateObj);
      
      where.date = {
        gte: start,
        lte: end
      };
    } else if (!includeAll) {
      // Default to future dates only - using a broader range
      const today = new Date();
      const futureDate = addMonths(today, 3); // Look up to 3 months ahead
      
      where.date = {
        gte: startOfDay(today),
        lte: futureDate
      };
    }
    
    console.log("API: Using where clause:", JSON.stringify(where, null, 2));
    
    // Get all slots first to debug
    const allSlots = await prisma.appointmentSlot.findMany({
      take: 5, // Just get a few to see what's in the database
      orderBy: [
        { date: "desc" },
      ]
    });
    
    console.log(`API: Sample from database:`, allSlots.map(s => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      isAvailable: s.isAvailable
    })));
    
    try {
      // Get available slots - using explicit try/catch to debug any Prisma errors
      const slots = await prisma.appointmentSlot.findMany({
        where,
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          capacity: true,
          bookedCount: true,
          isAvailable: true,
          physiotherapistId: true,
          // Safer way to include relationships with optional checks
          physiotherapist: {
            select: {
              name: true
            }
          },
          // Count appointments instead of including them all
          _count: {
            select: {
              appointments: true
            }
          }
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" }
        ]
      });
      
      console.log(`API: Found ${slots.length} slots`);
      
      // If no slots found with filter, fallback to returning all slots
      if (slots.length === 0 && !includeAll) {
        console.log("API: No slots found with filter, falling back to all slots");
        return NextResponse.json({
          error: "No available slots found for the current filter",
          message: "Try adding ?includeAll=true to see all slots"
        }, { status: 404 });
      }
      
      // Transform to exact format required by the UI
      const transformedSlots = slots.map(slot => ({
        id: String(slot.id),
        date: format(new Date(slot.date), "yyyy-MM-dd"),
        time: slot.startTime,
        isAvailable: slot.isAvailable && slot.bookedCount < slot.capacity,
        activeAppointments: slot.bookedCount || slot._count.appointments
      }));
      
      console.log(`API: Returning ${transformedSlots.length} slots`);
      
      return NextResponse.json(transformedSlots);
    } catch (prismaError) {
      console.error("Prisma query error:", prismaError);
      return NextResponse.json(
        { error: "Database query failed", details: String(prismaError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots", details: String(error) },
      { status: 500 }
    );
  }
}