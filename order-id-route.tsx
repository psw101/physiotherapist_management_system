import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Get a single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view order details" },
        { status: 401 }
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

    // Get order with product details
    const order = await prisma.productOrder.findUnique({
      where: { 
        id,
        userId: session.user.id // Ensure the order belongs to the current user
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            customOptions: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// Update order (e.g. cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update an order" },
        { status: 401 }
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

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this order" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, adminNotes } = body;

    // Check if order can be cancelled (only pending or approved orders)
    if (status === "cancelled" && order.status !== "pending" && order.status !== "approved") {
      return NextResponse.json(
        { error: "Only pending or approved orders can be cancelled" },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.productOrder.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || undefined
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
