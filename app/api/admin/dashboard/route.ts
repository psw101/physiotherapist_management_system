import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET() {
  try {
    // Fetch statistics from the database
    const usersCount = await prisma.user.count();
    const patientsCount = await prisma.patient.count();
    const appointmentsCount = await prisma.appointment.count();
    const productsCount = await prisma.product.count();
    const revenueTotal = await prisma.payment.aggregate({
      _sum: { amount: true },
    });
    
    // Count appointments by status
    const pendingAppointments = await prisma.appointment.count({
      where: { status: "pending" },
    });
    const completedAppointments = await prisma.appointment.count({
      where: { status: "completed" },
    });

    // Return the statistics as JSON with data property
    return NextResponse.json({
      data: {
        usersCount,
        patientsCount,
        appointmentsCount,
        productsCount,
        revenueTotal: revenueTotal._sum.amount || 0,
        pendingAppointments,
        completedAppointments,
      },
      error: null
    });
  } catch (error) {
    console.error("Failed to fetch dashboard statistics:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
