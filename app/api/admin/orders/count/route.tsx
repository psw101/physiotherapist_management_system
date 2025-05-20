import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Get count of orders by status (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin privileges
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters for status
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Prepare filter conditions
    const where = status ? { status } : {};

    // Get count
    const count = await prisma.productOrder.count({ where });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching order count:", error);
    return NextResponse.json(
      { error: "Failed to fetch order count" },
      { status: 500 }
    );
  }
}