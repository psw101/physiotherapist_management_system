import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

// This endpoint is just for development/testing to populate test payment data
export async function GET(request: NextRequest) {
  try {
    // Check if there are already payments
    const existingPayments = await prisma.payment.count();
    
    if (existingPayments > 0) {
      return NextResponse.json({
        message: `Database already has ${existingPayments} payments. No test data added.`
      });
    }
    
    // Find or create a test patient
    let patient = await prisma.patient.findFirst();
    
    if (!patient) {
      // Check if there's a user with patient role
      const patientUser = await prisma.user.findFirst({
        where: { role: "PATIENT" }
      });
      
      if (patientUser) {
        patient = await prisma.patient.create({
          data: {
            name: patientUser.name || "Test Patient",
            username: patientUser.username || "testpatient",
            dateOfBirth: new Date("1990-01-01"),
            contactNumber: "1234567890",
            email: patientUser.email || "test@example.com",
            area: "Test Area",
            nic: "123456789X",
            address: "123 Test Street",
            userId: patientUser.id
          }
        });
      }
    }
    
    // Find or create a product
    let product = await prisma.product.findFirst();
    
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: "Test Product",
          price: 1000,
          description: "Test product for payment testing",
          imageUrl: "https://via.placeholder.com/150"
        }
      });
    }
    
    // Create test product order 
    const productOrder = await prisma.productOrder.create({
      data: {
        userId: patient?.userId || "unknown",
        productId: product.id,
        quantity: 1,
        totalPrice: product.price || 1000,
        status: "pending"
      }
    });
    
    // Create test appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient?.id || 1,
        appointmentDate: new Date(),
        startTime: "10:00",
        duration: 60,
        status: "scheduled",
        fee: 2500
      }
    });
    
    // Create test payments
    const payments = await Promise.all([
      // Product payment (completed)
      prisma.payment.create({
        data: {
          amount: product.price || 1000,
          method: "Credit Card",
          status: "completed",
          transactionId: "test-tx-1",
          paymentType: "product",
          productOrderId: productOrder.id,
          patientId: patient?.id
        }
      }),
      // Appointment payment (completed)
      prisma.payment.create({
        data: {
          amount: 2500,
          method: "Cash",
          status: "completed",
          transactionId: "test-tx-2",
          paymentType: "appointment",
          appointmentId: appointment.id,
          patientId: patient?.id
        }
      }),
      // Pending payment
      prisma.payment.create({
        data: {
          amount: 1500,
          method: "Bank Transfer",
          status: "pending",
          transactionId: "test-tx-3",
          paymentType: "product",
          patientId: patient?.id
        }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      message: `Created ${payments.length} test payments`,
      data: {
        patient,
        product,
        productOrder,
        appointment,
        payments
      }
    });
    
  } catch (error) {
    console.error("Failed to seed test data:", error);
    return NextResponse.json(
      { error: "Failed to seed test data" },
      { status: 500 }
    );
  }
}
