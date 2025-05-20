import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Add feedback to a product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to leave feedback" },
        { status: 401 }
      );
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { feedback: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify user has purchased this product
    const hasOrdered = await prisma.productOrder.findFirst({
      where: {
        userId: session.user.id,
        productId,
        status: "completed",
      },
    });

    if (!hasOrdered) {
      return NextResponse.json(
        { error: "You can only leave feedback for products you've purchased" },
        { status: 403 }
      );
    }

    // Create feedback entry
    const newFeedback = {
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      rating,
      comment: comment || "",
      date: new Date().toISOString(),
    };

    // Update product with new feedback
    const updatedFeedback = Array.isArray(product.feedback)
      ? [...product.feedback, newFeedback]
      : [newFeedback];

    await prisma.product.update({
      where: { id: productId },
      data: {
        feedback: updatedFeedback,
      },
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error("Error adding feedback:", error);
    return NextResponse.json(
      { error: "Failed to add feedback" },
      { status: 500 }
    );
  }
}

// Get all feedback for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Get product with feedback
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { feedback: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product.feedback || []);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}