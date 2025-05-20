"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe outside of component render to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Create checkout session on the server
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // You can add data here if needed
        }),
      });
      
      // Check if the response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const session = await response.json();
      
      if (!session || !session.id) {
        throw new Error('Failed to create checkout session');
      }
      
      // Get Stripe.js instance
      const stripe = await stripePromise;
      
      // Redirect to Checkout
      const { error } = await stripe!.redirectToCheckout({
        sessionId: session.id,
      });
      
      // If `redirectToCheckout` fails due to a browser or network error, display the error
      if (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-8 max-w-md text-center">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
