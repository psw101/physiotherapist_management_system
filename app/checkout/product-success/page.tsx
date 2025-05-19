"use client";

import { useSearchParams } from "next/navigation";
import axios from "axios";
import BaseSuccessPage from "../success/components/BaseSuccessPage";

export default function ProductSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const handleVerifyPayment = async (sessionData: any, orderDetails: any) => {
    console.log("Processing product order payment...");
    
    // Extract transaction ID for idempotency check
    const transactionId = typeof sessionData.payment_intent === 'object' ? 
      sessionData.payment_intent.id : sessionData.payment_intent;
    
    console.log("Transaction ID:", transactionId);
    
    try {
      // First check if payment with this transaction ID already exists
      const checkUrl = `/api/payment/check?transactionId=${transactionId}`;
      console.log("Checking payment at URL:", checkUrl);
      
      try {
        const checkResponse = await axios.get(checkUrl);
        console.log("Check response:", checkResponse.data);
        
        if (checkResponse.data.exists) {
          console.log("Payment already exists, skipping processing");
          return;
        }
      } catch (checkError: any) {
        console.error("Error checking payment:", checkError.message);
        console.error("Response:", checkError.response?.data);
        // Continue anyway to create the payment
      }
      
      // Create the order
      const orderData = {
        productId: parseInt(orderDetails.productId),
        quantity: parseInt(orderDetails.quantity || "1"),
        totalPrice: parseFloat((sessionData.amount_total / 100).toFixed(2)),
        customizations: orderDetails.customizations || {},
        status: "pending"
      };
      
      const orderUrl = "/api/orders";
      console.log("Creating order at URL:", orderUrl);
      console.log("Order data:", orderData);
      
      const orderResp = await axios.post(orderUrl, orderData);
      console.log("Order created:", orderResp.data);
      
      // Create payment record
      const paymentData = {
        productOrderId: orderResp.data.id,
        amount: parseFloat((sessionData.amount_total / 100).toFixed(2)),
        method: "card",
        status: "completed",
        transactionId: transactionId,
        paymentType: "product"
      };
      
      const paymentUrl = "/api/payment/create";
      console.log("Creating payment at URL:", paymentUrl);
      console.log("Payment data:", paymentData);
      
      const paymentResp = await axios.post(paymentUrl, paymentData);
      console.log("Payment created:", paymentResp.data);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      console.error("Error response:", error.response?.data);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  };

  const getSuccessLink = () => "/orders";
  
  const getSuccessMessage = () => "Thank you for your payment. Your order has been placed.";
  
  return (
    <BaseSuccessPage
      sessionId={sessionId}
      verifyPayment={handleVerifyPayment}
      getSuccessLink={getSuccessLink}
      getSuccessMessage={getSuccessMessage}
    />
  );
}