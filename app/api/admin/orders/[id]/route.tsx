import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin privileges
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const id = params.id;

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, adminNotes } = body;

    // Update the status validation to include cancellation-related statuses
    if (!status || !["approved", "rejected", "cancelled", "rejected_cancellation"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    // Update the status change handling
    let updatedStatus = status;
    let updatedNotes = adminNotes || undefined;

    // Special handling for cancellation responses
    if (status === "rejected_cancellation") {
      // If rejecting cancellation, revert to previous status (stored in notes)
      const currentOrder = await prisma.productOrder.findUnique({
        where: { id },
        select: { status: true, adminNotes: true }
      });
      
      if (currentOrder?.status === "cancellation_requested") {
        // Extract the previous status from notes if possible, otherwise default to pending
        updatedStatus = "approved"; // Default to approved if we can't determine previous
        updatedNotes = `Cancellation rejected: ${adminNotes || "No reason provided"}`;
      }
    } else if (status === "cancelled") {
      // If approving cancellation
      updatedNotes = `Cancellation approved on ${new Date().toISOString()}. ${adminNotes || ""}`;
    }

    // Update order with the determined status and notes
    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: {
        status: updatedStatus,
        adminNotes: updatedNotes,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    
    // Handle not found error
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}