"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    const detectOrderTypeAndRedirect = async () => {
      try {
        if (!sessionId) {
          setError("No session ID found");
          setLoading(false);
          return;
        }

        // Fetch session data to determine order type
        const response = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if order details exist
        if (data.metadata?.orderDetails) {
          try {
            const orderDetails = JSON.parse(data.metadata.orderDetails);
            
            // Determine order type and redirect accordingly
            if (orderDetails.type === "appointment") {
              console.log("Redirecting to appointment success page...");
              setRedirecting(true);
              router.push(`/checkout/appointment-success?session_id=${sessionId}`);
            } else if (orderDetails.type === "product") {
              console.log("Redirecting to product success page...");
              setRedirecting(true);
              router.push(`/user/checkout/product-success?session_id=${sessionId}`);
            } else {
              // Unknown order type
              setError(`Unknown order type: ${orderDetails.type}`);
              setLoading(false);
            }
          } catch (err) {
            console.error("Error parsing order details:", err);
            setError("Invalid order details format");
            setLoading(false);
          }
        } else {
          setError("No order details found in the payment");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error detecting order type:", err);
        setError("An error occurred while processing your payment");
        setLoading(false);
      }
    };

    detectOrderTypeAndRedirect();
  }, [searchParams, router]);

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-green-50 p-8 rounded-lg shadow-sm text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">
              {redirecting ? "Redirecting to the right page..." : "Verifying your payment..."}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4">
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
                Return to Home
              </Link>
              <Link href="/support" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md">
                Contact Support
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-4xl mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. We're processing your order.
            </p>
            <div className="flex gap-4">
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
                Return to Home
              </Link>
              <Link href="/account/orders" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md">
                My Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Example code for reference:
// For appointment checkout
const appointmentSession = await stripe.checkout.sessions.create({
  // ...other options
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/appointment-success?session_id={CHECKOUT_SESSION_ID}`,
  // ...
});

// For product checkout
const productSession = await stripe.checkout.sessions.create({
  // ...other options
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/product-success?session_id={CHECKOUT_SESSION_ID}`,
  // ...
});
*/