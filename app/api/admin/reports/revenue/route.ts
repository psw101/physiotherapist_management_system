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
    
    // Debug output
    console.log(`Found ${payments.length} payments between ${start.toISOString()} and ${end.toISOString()}`);
    if (payments.length > 0) {
      console.log("Sample payment:", JSON.stringify(payments[0], null, 2));
    } else {
      // If no payments found, let's look for any payments without date filtering
      const allPayments = await prisma.payment.count();
      console.log(`Total payments in database without date filter: ${allPayments}`);
    }

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
    // Log payment statuses for debugging
    console.log("Payment statuses found:", payments.map(p => p.status));
    
    // Include any status that indicates completion (case-insensitive check)
    const completedPayments = payments.filter(p => 
      ["completed", "paid", "success", "successful"].includes(p.status.toLowerCase())
    );
    
    // Debug log payment amounts
    console.log("Payment amounts:", payments.map(p => ({ 
      id: p.id, 
      amount: p.amount,
      status: p.status,
      isCompleted: ["completed", "paid", "success", "successful"].includes(p.status.toLowerCase())
    })));
    
    console.log(`Found ${completedPayments.length} completed payments out of ${payments.length} total`);
    
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const appointmentRevenue = completedPayments
      .filter(payment => payment.appointmentId !== null)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const productRevenue = completedPayments
      .filter(payment => payment.productOrderId !== null)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingPayments = payments
      .filter(payment => ["pending", "processing", "awaiting"].includes(payment.status.toLowerCase()))
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
        }
      },
    });
    
    // Filter completed payments manually for case-insensitive matching
    const previousCompletedPayments = previousPeriodPayments.filter(p => 
      ["completed", "paid", "success", "successful"].includes(p.status.toLowerCase())
    );

    // Log for debugging purposes
    console.log(`Found ${previousPeriodPayments.length} previous period payments, ${previousCompletedPayments.length} completed`);

    const lastPeriodRevenue = previousCompletedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
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
