import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/prisma/client';

// Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log("Finding cart for userId:", userId);
    
    // Find the user's cart
    let userCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    
    // If no cart exists yet, return empty cart
    if (!userCart) {
      return NextResponse.json({ cart: [] });
    }
    
    // Transform database objects to match CartItem interface
    const cart = userCart.items.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      option: item.option,
    }));
    
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Detailed cart error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cart', details: String(error) },
      { status: 500 }
    );
  }
}

// Update user's cart
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { cart } = await request.json();
    
    if (!Array.isArray(cart)) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }
    
    // Find or create user's cart
    let userCart = await prisma.cart.findUnique({
      where: { userId }
    });
    
    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId }
      });
    }
    
    // Delete existing cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: userCart.id }
    });
    
    // Add new cart items if cart is not empty
    if (cart.length > 0) {
      // Create items one by one to handle potential errors better
      for (const item of cart) {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || '',
            option: item.option,
          }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: String(error) },
      { status: 500 }
    );
  }
}