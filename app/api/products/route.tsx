import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { productSchema } from "../validationSchemas";

// Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() }, 
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        specification: body.specification,
        imageUrl: body.imageUrl,
        videoUrl: body.videoUrl,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    
    // Check for database constraints or other errors
    if (error.code === 'P2002') {
      const field = error.meta?.target[0] || 'field'; 
      return NextResponse.json(
        { error: `A product with this ${field} already exists` }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create product" }, 
      { status: 500 }
    );
  }
}

// Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        specification: true,
        imageUrl: true,
        videoUrl: true,
      },
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" }, 
      { status: 500 }
    );
  }
}