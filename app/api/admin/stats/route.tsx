import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

export async function GET() {
  try {
    // Get session and verify admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get counts from database
    const [
      usersCount,
      patientsCount,
      physiotherapistsCount,
      appointmentsCount,
      productsCount,
      appointments,
      payments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.physiotherapist.count(),
      prisma.appointment.count(),
      prisma.product.count(),
      prisma.appointment.findMany({
        select: {
          status: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: "completed",
        },
        select: {
          amount: true,
        },
      }),
    ]);

    // Calculate derived statistics
    const pendingAppointments = appointments.filter(
      (app) => app.status === "pending" || app.status === "scheduled"
    ).length;
    
    const completedAppointments = appointments.filter(
      (app) => app.status === "completed"
    ).length;
    
    const revenueTotal = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return NextResponse.json({
      usersCount,
      patientsCount,
      physiotherapistsCount,
      appointmentsCount,
      productsCount,
      pendingAppointments,
      completedAppointments,
      revenueTotal,
    });
    
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}