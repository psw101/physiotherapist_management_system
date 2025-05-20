import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Create a new order
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to place an order" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { productId, quantity, totalPrice, customizations } = body;

    // Validate required fields
    if (!productId || !quantity || !totalPrice) {
      return NextResponse.json(
        { error: "Product ID, quantity, and total price are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create the order
    const order = await prisma.productOrder.create({
      data: {
        userId: session.user.id,
        productId: productId,
        quantity: quantity,
        totalPrice: totalPrice,
        customizations: customizations || {},
        status: "pending", // Default status
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// Get all orders for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view orders" },
        { status: 401 }
      );
    }

    // Check if we need to filter by status
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Prepare filter conditions
    const where = {
      userId: session.user.id,
      ...(status ? { status } : {}),
    };

    // Get orders for current user
    const orders = await prisma.productOrder.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}