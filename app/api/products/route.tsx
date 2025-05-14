import { NextRequest, NextResponse } from "next/server";
import {productSchema} from "../validationSchemas";
import {prisma} from "@/prisma/client";


export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = productSchema.safeParse(body);
  // if (!validation.success) return NextResponse.json(validation.error.format(), { status: 404 });

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name || null,
        price: parseInt(body.price )|| null,
        description: body.description || null,
        specification: body.specification || null,
        imageURL: body.imageUrl || null,
        videoURL: body.videoUrl || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product record in database:", error);
    return NextResponse.json({ error: "Failed to create product in the database" }, { status: 510 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const product = await prisma.product.findMany();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}