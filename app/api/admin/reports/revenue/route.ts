import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end date parameters are required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include the entire end day

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Get all payments within the date range
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        appointment: {
          select: {
            id: true,
          }
        },
        productOrder: {
          select: {
            id: true,
            product: {
              select: {
                name: true
              }
            }
          }
        },
        patient: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data for the frontend
    const revenueData = payments.map(payment => {
      // Determine source (Appointment or Product)
      const source = payment.appointmentId ? "Appointment" : "Product";
      const sourceDetails = payment.appointmentId 
        ? `Appointment #${payment.appointmentId.substring(0, 8)}` 
        : payment.productOrder?.product.name || "Unknown Product";

      return {
        id: payment.id,
        date: payment.createdAt.toISOString().split('T')[0],
        source,
        sourceDetails,
        amount: payment.amount,
        paymentMethod: payment.method,
        status: payment.status.toLowerCase(),
        patientName: payment.patient?.name || "N/A"
      };
    });

    // Calculate summary data
    const completedPayments = payments.filter(p => p.status.toLowerCase() === "completed");
    
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const appointmentRevenue = completedPayments
      .filter(payment => payment.appointmentId !== null)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const productRevenue = completedPayments
      .filter(payment => payment.productOrderId !== null)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingPayments = payments
      .filter(payment => payment.status.toLowerCase() === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate monthly growth (comparing to previous period of same length)
    const periodLength = end.getTime() - start.getTime();
    const previousPeriodStart = new Date(start.getTime() - periodLength);
    const previousPeriodEnd = new Date(start);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

    // Get previous period payments
    const previousPeriodPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
        status: "COMPLETED",
      },
    });

    const lastPeriodRevenue = previousPeriodPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate growth percentage
    let monthlyGrowth = 0;
    if (lastPeriodRevenue > 0) {
      monthlyGrowth = ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100;
    } else if (totalRevenue > 0) {
      monthlyGrowth = 100; // If previous period had 0 revenue but current has some
    }

    return NextResponse.json({
      data: {
        revenueData,
        summary: {
          totalRevenue,
          appointmentRevenue,
          productRevenue,
          pendingPayments,
          lastPeriodRevenue,
          monthlyGrowth
        }
      },
      error: null
    });

  } catch (error) {
    console.error("Failed to fetch revenue reports:", error);
    return NextResponse.json(
      { data: null, error: "Failed to fetch revenue reports" },
      { status: 500 }
    );
  }
}
