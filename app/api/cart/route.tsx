import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/prisma/client';

// Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
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
      try {
        // Check if the user exists in the User table
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true }
        });
        
        if (!userExists) {
          // Use the patient ID if available to create a temporary mapping
          if (session.user.patientId) {
            // Create or update the User record
            await prisma.user.upsert({
              where: { id: userId },
              update: {}, // No updates needed
              create: {
                id: userId,
                name: session.user.name || 'User',
                email: session.user.email || '',
                role: 'PATIENT'
              }
            });
          } else {
            return NextResponse.json(
              { error: 'User does not exist in database' },
              { status: 400 }
            );
          }
        }
        
        // Now create cart after confirming user exists
        userCart = await prisma.cart.create({
          data: { userId }
        });
      } catch (createError) {
        console.error('Error creating cart:', createError);
        // If we fail here, use client-side storage instead as fallback
        return NextResponse.json({ 
          error: 'Unable to save cart to database, using local storage instead',
          useLocalStorage: true 
        }, { status: 200 });
      }
    }
    
    // Delete existing cart items if we have a valid cart
    if (userCart && userCart.id) {
      await prisma.cartItem.deleteMany({
        where: { cartId: userCart.id }
      });
      
      // Add new cart items if cart is not empty
      if (cart.length > 0) {
        try {
          // Create all items one by one instead of using transaction
          for (const item of cart) {
            await prisma.cartItem.create({
              data: {
                cartId: userCart.id,
                productId: item.id || 0,
                name: item.name || 'Unknown Product',
                price: item.price || 0,
                quantity: item.quantity || 1,
                imageUrl: item.imageUrl || '',
                option: item.option || null,
              }
            });
          }
        } catch (itemError) {
          console.error('Error saving cart items:', itemError);
          return NextResponse.json({ 
            error: 'Unable to save cart items, using local storage instead',
            useLocalStorage: true 
          }, { status: 200 });
        }
      }
      
      return NextResponse.json({ success: true });
    } else {
      // Fallback to local storage if we couldn't create a cart
      return NextResponse.json({ 
        error: 'Unable to create server-side cart, using local storage instead',
        useLocalStorage: true 
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update cart, using local storage instead',
        useLocalStorage: true,
        details: String(error)
      },
      { status: 200 } // Return 200 so the client knows to use local storage
    );
  }
}