import { NextRequest, NextResponse } from 'next/server';

// This is a simplified version just to make the API work
// Add your database code once the route is working
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { message: 'Missing transactionId parameter' },
        { status: 400 }
      );
    }

    console.log(`Checking for payment with transaction ID: ${transactionId}`);

    // Return a simple response - we'll add database checks later
    return NextResponse.json({
      exists: false,
      payment: null
    });
  } catch (error: any) {
    console.error('Error checking payment:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred while checking payment' },
      { status: 500 }
    );
  }
}