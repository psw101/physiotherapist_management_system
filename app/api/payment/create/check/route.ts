import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const transactionId = url.searchParams.get("transactionId");
  
  if (!transactionId) {
    return NextResponse.json({ error: "No transaction ID provided" }, { status: 400 });
  }
  
  try {
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
    });
    
    return NextResponse.json({ 
      exists: !!payment, 
      payment: payment 
    });
  } catch (error: any) {
    console.error("API: Error checking payment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}