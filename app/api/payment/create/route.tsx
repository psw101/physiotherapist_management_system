import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(request: NextRequest) {
  console.log("API: Payment creation started");
  
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log("API: Payment request body:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("API: Failed to parse request body:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const {
      appointmentId,
      productOrderId,
      amount,
      method,
      status,
      transactionId,
      paymentType, // Important! Keep this field
      patientId,
      isAdvancePayment = false
    } = body;
    
    // Extract the payment intent ID from the object if needed
    const paymentIntentId = typeof transactionId === 'object' ? 
      transactionId.id || transactionId : transactionId;
    
    console.log("API: Extracted payment intent ID:", paymentIntentId);
    
    // Prepare safe data for Prisma
    let paymentData: any = {
      amount: parseFloat(amount.toString()),
      method,
      status,
      transactionId: paymentIntentId,
      paymentType: paymentType || "product", // Provide a default value
      isAdvancePayment: Boolean(isAdvancePayment)
    };
    
    // Add relationships with proper type conversion
    if (appointmentId) {
      paymentData = {
        ...paymentData,
        appointmentId: appointmentId.toString(),
        paymentType: paymentType || "appointment" // Set default based on relationship
      };
    }
    
    if (productOrderId) {
      // Support both string IDs (CUID) and numeric IDs
      let parsedId;
      try {
        if (typeof productOrderId === 'string' && /^[a-z0-9]+$/.test(productOrderId)) {
          // This is a CUID string ID
          parsedId = productOrderId;
        } else {
          // Try to convert to number for numeric IDs
          parsedId = parseInt(productOrderId.toString());
          if (Number.isNaN(parsedId)) {
            parsedId = productOrderId;
          }
        }
      } catch (e) {
        console.error("API: Failed to parse productOrderId:", e);
        parsedId = productOrderId;
      }
      
      paymentData = {
        ...paymentData,
        productOrderId: parsedId,
        paymentType: paymentType || "product" // Set default based on relationship
      };
    }
    
    if (patientId) {
      // Try to parse to integer, if it fails use null
      let parsedId;
      try {
        parsedId = parseInt(patientId.toString());
      } catch (e) {
        console.error("API: Failed to parse patientId:", e);
        parsedId = null;
      }
      
      paymentData = {
        ...paymentData,
        patientId: Number.isNaN(parsedId) ? null : parsedId
      };
    }
    
    console.log("API: Creating payment with data:", JSON.stringify(paymentData, null, 2));
    
    // Create the payment record
    const payment = await prisma.payment.create({
      data: paymentData
    });
    
    console.log("API: Payment created successfully:", payment);
    
    // Update related records based on payment type
    if (appointmentId) {
      try {
        console.log("API: Updating appointment status for ID:", appointmentId);
        const updatedAppointment = await prisma.appointment.update({
          where: { id: appointmentId.toString() },
          data: {
            status: "scheduled",
            paymentStatus: "paid"
          }
        });
        console.log("API: Appointment updated successfully:", updatedAppointment);
      } catch (updateError) {
        console.error("API: Failed to update appointment:", updateError);
        // Continue even if update fails, we already have the payment
      }
    } else if (productOrderId) {
      try {
        // Use the same ID handling as above for consistency
        let parsedOrderId;
        if (typeof productOrderId === 'string' && /^[a-z0-9]+$/.test(productOrderId)) {
          parsedOrderId = productOrderId;
        } else {
          parsedOrderId = parseInt(productOrderId.toString());
          if (Number.isNaN(parsedOrderId)) {
            parsedOrderId = productOrderId;
          }
        }
        
        console.log("API: Updating product order status for ID:", parsedOrderId);
        console.log("API: ID type:", typeof parsedOrderId);
        
        const updatedOrder = await prisma.productOrder.update({
          where: { id: parsedOrderId },
          data: {
            status: isAdvancePayment ? "advance_paid" : "paid"
          }
        });
        console.log("API: Product order updated successfully:", updatedOrder);
      } catch (updateError) {
        console.error("API: Failed to update product order:", updateError);
        console.error("API: Error details:", updateError);
        
        // Add more detailed logging
        if (updateError instanceof Error && 'code' in updateError && updateError.code === 'P2025') {
          console.error("API: Record not found - Product order ID may be in incorrect format");
          console.error("API: Current ID value:", productOrderId);
          console.error("API: Expected ID type according to schema:", "Check your Prisma schema");
        }
        
        // Continue even if update fails, we already have the payment
      }
    }
    
    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error: any) {
    console.error("API: Unexpected error:", error);
    console.error("API: Error stack:", error.stack);
    
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}