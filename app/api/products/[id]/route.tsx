import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";


interface Props {
    params : Promise<{id: string}>
}


//for getting product by ID
export async function GET(request: NextRequest, {params} : Props) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt((await params).id) },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

