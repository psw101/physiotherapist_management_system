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

    // Validate status
    if (!status || !["pending", "approved", "rejected", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (pending, approved, rejected, completed)" },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || undefined,
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