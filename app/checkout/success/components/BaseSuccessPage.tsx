"use client";

import { useEffect, useState, useRef } from "react"; // Add useRef
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Link from "next/link";

export interface SuccessPageProps {
  sessionId: string | null;
  verifyPayment: (sessionData: any, orderDetails: any) => Promise<void>;
  getSuccessLink: () => string;
  getSuccessMessage: () => string;
}

export default function BaseSuccessPage({
  sessionId,
  verifyPayment,
  getSuccessLink,
  getSuccessMessage
}: SuccessPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const hasProcessed = useRef(false); // Add a ref to track if we've processed payment

  useEffect(() => {
    // Skip if already processed or no session ID
    if (hasProcessed.current || !sessionId) return;
    
    const verifyCheckout = async () => {
      try {
        console.log("Starting checkout verification with session ID:", sessionId);
        
        // Mark as processed immediately to prevent duplicate runs
        hasProcessed.current = true;

        // Verify the session with your backend
        console.log("Fetching session data from API...");
        const response = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Session data received:", data);
        setSessionData(data);
        
        // Process the payment based on order type
        if (data.metadata?.orderDetails) {
          try {
            console.log("Order details found in metadata:", data.metadata.orderDetails);
            const orderDetails = JSON.parse(data.metadata.orderDetails);
            console.log("Parsed order details:", orderDetails);
            
            await verifyPayment(data, orderDetails);
            setSuccess(true);
          } catch (err: any) {
            console.error("Error processing order after payment:", err);
            console.error("Error details:", err.response?.data || err.message);
            setError(`Your payment was successful, but there was an error processing your order. Please contact support with this reference: ${data.payment_intent || "unknown"} - Error: ${err.message}`);
          }
        } else {
          console.log("No order details found in metadata");
          setError("No order details found in the payment. Please contact support.");
        }
      } catch (err: any) {
        console.error("Error verifying checkout:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError(err.message || "An error occurred while verifying your payment");
      } finally {
        setLoading(false);
      }
    };

    verifyCheckout();
  }, [sessionId]); // Remove verifyPayment from dependencies

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-green-50 p-8 rounded-lg shadow-sm text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-4xl mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              {getSuccessMessage()}
              {sessionData?.amount_total && (
                <span className="block font-medium mt-2">
                  Amount paid: Rs. {(sessionData.amount_total / 100).toLocaleString()}
                </span>
              )}
            </p>
            {success ? (
              <Link href={getSuccessLink()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
                View Details
              </Link>
            ) : (
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
                Return to Home
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}