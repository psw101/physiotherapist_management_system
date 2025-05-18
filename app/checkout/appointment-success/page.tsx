"use client";

import { useSearchParams } from "next/navigation";
import axios from "axios";
import BaseSuccessPage from "../success/components/BaseSuccessPage";

export default function AppointmentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const handleVerifyPayment = async (sessionData: any, orderDetails: any) => {
    console.log("Processing appointment payment...");
    
    if (!orderDetails.patientId) {
      throw new Error("Patient ID is missing from the order details");
    }
    
    // First create or get the appointment
    const appointmentResp = await axios.post("/api/appointments/create", {
      appointmentDate: orderDetails.appointmentDate,
      startTime: orderDetails.appointmentTime,
      duration: parseInt(orderDetails.duration || "60"), 
      reason: orderDetails.reason || "Physiotherapy session",
      patientId: parseInt(orderDetails.patientId),
      slotId: parseInt(orderDetails.slotId),
      fee: sessionData.amount_total / 100,
      status: "scheduled" // Mark as scheduled since payment is completed
    });
    
    console.log("Appointment created successfully:", appointmentResp.data);
    
    // Then create the payment record
    const paymentResp = await axios.post("/api/payment/create", {
      appointmentId: appointmentResp.data.id,
      amount: sessionData.amount_total / 100,
      method: "card",
      status: "completed",
      transactionId: sessionData.payment_intent,
      paymentType: "appointment"
    });
    
    console.log("Payment record created successfully:", paymentResp.data);
  };

  const getSuccessLink = () => "/appointments/my-appointments";
  
  const getSuccessMessage = () => "Thank you for your payment. Your appointment has been scheduled.";
  
  return (
    <BaseSuccessPage
      sessionId={sessionId}
      verifyPayment={handleVerifyPayment}
      getSuccessLink={getSuccessLink}
      getSuccessMessage={getSuccessMessage}
    />
  );
}