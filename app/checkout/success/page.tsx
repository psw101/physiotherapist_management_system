"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  useEffect(() => {
    const verifyCheckout = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          setError("No session ID found");
          setLoading(false);
          return;
        }

        // Verify the session with your backend
        const response = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setSessionData(data);
        
        // Check if the order is for an appointment
        if (data.metadata?.orderDetails) {
          try {
            const orderDetails = JSON.parse(data.metadata.orderDetails);
            
            if (orderDetails.type === "appointment") {
              // Create the appointment directly
              await axios.post("/api/appointments/create", {
                appointmentDate: orderDetails.appointmentDate,
                startTime: orderDetails.appointmentTime,
                duration: 60, // default duration
                reason: "Physiotherapy session",
                patientId: orderDetails.patientId,
                slotId: orderDetails.slotId,
                fee: data.amount_total / 100, // Convert from cents
                paymentId: data.paymentIntent,
                status: "confirmed" // Directly confirmed since payment is complete
              });
              
              setAppointmentCreated(true);
            }
          } catch (err) {
            console.error("Error creating appointment:", err);
            setError("Your payment was successful, but we couldn't create your appointment. Please contact support.");
          }
        }
      } catch (err: any) {
        console.error("Error verifying checkout:", err);
        setError(err.message || "An error occurred while verifying your payment");
      } finally {
        setLoading(false);
      }
    };

    verifyCheckout();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-gray-200 h-24 w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <p className="mt-6 text-gray-600">Processing your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <div className="bg-red-50 p-8 rounded-lg shadow-sm text-center">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <h1 className="text-2xl font-bold text-red-700 mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <Link 
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-green-50 p-8 rounded-lg shadow-sm text-center">
        <svg 
          className="w-16 h-16 text-green-500 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        
        <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your payment. 
          {appointmentCreated 
            ? " Your appointment has been confirmed." 
            : " Your transaction has been completed successfully."
          }
          
          {sessionData?.amount_total && (
            <span className="block mt-2">
              Amount Paid: LKR {(sessionData.amount_total / 100).toFixed(2)}
            </span>
          )}
          {sessionData?.payment_intent && (
            <span className="block mt-1 text-sm text-gray-500">
              Transaction ID: {sessionData.payment_intent}
            </span>
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {appointmentCreated ? (
            <Link 
              href="/appointments"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Appointments
            </Link>
          ) : (
            <Link 
              href="/orders"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Orders
            </Link>
          )}
          <Link 
            href="/"
            className="px-6 py-3 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}