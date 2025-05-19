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
    
    try {
      // First check if payment with this transaction ID already exists
      const checkResponse = await axios.get(`/api/payment/check?transactionId=${transactionId}`);
      
      if (checkResponse.data.exists) {
        console.log("Payment already processed:", checkResponse.data.payment);
        return; // Exit early if payment already exists
      }
      
      // Continue with order creation since this is a new payment
      console.log("Creating product order with data:", {
        productId: orderDetails.productId,
        quantity: orderDetails.quantity || 1,
        totalPrice: orderDetails.totalPrice || sessionData.amount_total / 100,
        customizations: orderDetails.customizations || {},
        status: "pending"
      });
      
      // Create the order
      const orderResp = await axios.post("/api/orders", {
        productId: parseInt(orderDetails.productId),
        quantity: parseInt(orderDetails.quantity || "1"),
        totalPrice: parseFloat((sessionData.amount_total / 100).toFixed(2)),
        customizations: orderDetails.customizations || {},
        status: "pending"
      });
      
      console.log("Product order created successfully:", orderResp.data);
      const orderId = orderResp.data.id;
      
      // Create the payment record
      const paymentResp = await axios.post("/api/payment/create", {
        productOrderId: orderId,
        amount: parseFloat((sessionData.amount_total / 100).toFixed(2)),
        method: "card",
        status: "completed",
        transactionId: transactionId,
        paymentType: "product",
        isAdvancePayment: Boolean(orderDetails.advancePayment)
      });
      
      console.log("Payment record created successfully:", paymentResp.data);
    } catch (error: any) {
      console.error("Error processing payment:", error);
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