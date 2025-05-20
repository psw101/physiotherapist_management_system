import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to cancel an order" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const id = params.id;

    // Parse request body for cancellation reason
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 }
      );
    }

    // Find the order and verify ownership
    const order = await prisma.productOrder.findUnique({
      where: { id },
      select: { userId: true, status: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to cancel this order" },
        { status: 403 }
      );
    }

    // Check if order can be canceled (only pending or approved orders)
    if (order.status !== "pending" && order.status !== "approved") {
      return NextResponse.json(
        { error: "Only pending or approved orders can be canceled" },
        { status: 400 }
      );
    }

    // Update the order status to "cancellation_requested"
    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: {
        status: "cancellation_requested",
        adminNotes: `Cancellation requested by user. Reason: ${reason}`
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error cancelling order:", error);
    
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}