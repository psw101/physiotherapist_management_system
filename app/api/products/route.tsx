import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import { prisma } from "@/prisma/client";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const validaton = schema.safeParse(body);
    if (!validaton.success) return NextResponse.json(validaton.error.errors, { status: 400 });

    const product = await prisma.products.create({
        data: {
            productName: body.productName,
            price: body.price,
            description: body.description,
            specification: body.specification,
            imageURL:body.imageURL

        }
    })

    return NextResponse.json(product, { status: 201 });
  }