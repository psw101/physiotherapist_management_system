"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export default function AppointmentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setError("No payment information found");
      setLoading(false);
      return;
    }
    
    const processPayment = async () => {
      try {
        // First verify the session
        const verifyResponse = await axios.get(`/api/verify-checkout?session_id=${sessionId}`);
        
        if (!verifyResponse.data?.metadata?.orderDetails) {
          throw new Error("No order details found");
        }
        
        // Extract order details
        const orderDetails = JSON.parse(verifyResponse.data.metadata.orderDetails);
        
        if (orderDetails.type !== "appointment") {
          throw new Error("Invalid order type");
        }
        
        setAppointmentId(orderDetails.id);
        
        // Extract payment intent ID
        const paymentIntentId = typeof verifyResponse.data.payment_intent === 'object' 
          ? verifyResponse.data.payment_intent.id 
          : verifyResponse.data.payment_intent;
        
        // Update appointment status
        await axios.patch(`/api/appointments/${orderDetails.id}`, {
          status: "scheduled",
          paymentStatus: "paid"
        });
        
        // Create payment record
        await axios.post(`/api/payment/create`, {
          appointmentId: orderDetails.id,
          amount: verifyResponse.data.amount_total / 100,
          method: "card",
          status: "completed",
          transactionId: paymentIntentId,
          paymentType: "appointment",
          patientId: orderDetails.patientId
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error processing payment:", err);
        setError("There was a problem processing your payment. Please contact support.");
        setLoading(false);
      }
    };
    
    processPayment();
  }, [searchParams, router]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow-sm mt-8 text-center">
        <FaSpinner className="animate-spin h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-xl font-medium mb-2">Processing Your Payment</h2>
        <p className="text-gray-600">Please wait while we confirm your appointment...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow-sm mt-8 text-center">
        <FaExclamationTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-red-600 mb-2">Payment Processing Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/user/appointments/my-appointments" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View My Appointments
          </Link>
          <Link 
            href="/contact" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow-sm mt-8 text-center">
      <FaCheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
      <h2 className="text-2xl font-medium text-green-600 mb-2">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">
        Your appointment has been confirmed and your payment has been processed successfully.
      </p>
      <div className="flex justify-center gap-4">
        {appointmentId ? (
          <Link 
            href={`/appointments/${appointmentId}`} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Appointment
          </Link>
        ) : (
          <Link 
            href="/appointments/my-appointments" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View My Appointments
          </Link>
        )}
        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}