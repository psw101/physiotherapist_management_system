import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import {prisma} from "@/prisma/client";


export async function POST(request: NextRequest) {
  const body = await request.json();
  const validaton = schema.safeParse(body);
  // if (!validaton.success) return NextResponse.json(validaton.error.format(), { status: 404 });

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
