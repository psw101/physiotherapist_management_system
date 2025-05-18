import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Create a new order
export async function POST(request: NextRequest) {
  try {
    console.log("API: Order creation started");
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create an order" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    // Parse the request body
    const body = await request.json();
    console.log("API: Order request body:", body);
    
    const { productId, quantity, totalPrice, customizations, status = "pending" } = body;
    
    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }
    
    // Create the order
    const order = await prisma.productOrder.create({
      data: {
        userId,
        productId: parseInt(productId.toString()),
        quantity: quantity || 1,
        totalPrice: totalPrice || 0,
        customizations: customizations || {},
        status
      },
    });
    
    console.log("API: Order created:", order);
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("API: Error creating order:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
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