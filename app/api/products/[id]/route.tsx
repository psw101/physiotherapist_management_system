import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { productSchema } from "../../validationSchemas";

// Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fix the params.id error by properly awaiting it
    const { id } = params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Log the product data to debug
    console.log("Product fetched:", {
      ...product,
      customOptions: product.customOptions || [],
    });

    // Ensure specification and customOptions are always arrays
    return NextResponse.json({
      ...product,
      specification: product.specification || [],
      customOptions: product.customOptions || [],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fix the params.id error
    const { id } = params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate request body with Zod
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Update the product with new fields
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        specification: body.specification,
        imageUrl: body.imageUrl,
        videoUrl: body.videoUrl,
        // Add new fields - preserve existing data if not provided
        customOptions: body.customOptions || existingProduct.customOptions,
        feedback: body.feedback || existingProduct.feedback,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);

    // Check for database constraints or other errors
    if (error.code === "P2002") {
      const field = error.meta?.target[0] || "field";
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fix the params.id error
    const { id } = params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

