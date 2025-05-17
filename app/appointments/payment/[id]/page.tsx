"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { Card, Button, Text, Flex, Box, Heading } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import PaymentForm, { PaymentDetails } from "@/components/PaymentForm";

interface AppointmentDetails {
  id: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  status: string;
  reason: string;
  paymentStatus: string;
  fee: number;
}

export default function AppointmentPayment() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  
  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/appointments/${appointmentId}`);
        setAppointment(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
        setError("Failed to load appointment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);
  
  // Handle payment submission
  const handlePayment = async (paymentDetails: PaymentDetails) => {
    if (!appointment) return;
    
    try {
      setProcessing(true);
      setError("");
      
      // In a real app, you would integrate with a payment processor here
      // For demo, we'll just simulate a payment
      await axios.post(`/api/appointments/${appointmentId}/payment`, {
        amount: appointment.fee,
        ...paymentDetails
      });
      
      // Update appointment status
      await axios.patch(`/api/appointments/${appointmentId}`, {
        status: "scheduled",
        paymentStatus: "paid"
      });
      
      // Show success and redirect
      alert("Payment successful! Your appointment is confirmed.");
      router.push("/appointments");
    } catch (err) {
      console.error("Payment failed:", err);
      setError("Payment failed. Please check your card details and try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <Box className="p-8 text-center">
        <Text size="5" color="red">Appointment not found</Text>
        <div className="mt-4">
          <Button onClick={() => router.push("/appointments/make-appointments")}>
            Book a New Appointment
          </Button>
        </div>
      </Box>
    );
  }
  
  return (
    <div className="p-6 bg-slate-50 max-w-3xl mx-auto">
      
      <Heading size="6" className="mb-6">Payment for Appointment</Heading>
      
      <Card className="p-4 mb-6">
        <Heading size="3" className="mb-4">Appointment Details</Heading>
        <Flex direction="column" gap="2">
          <Flex justify="between">
            <Text weight="medium">Date:</Text>
            <Text>{format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}</Text>
          </Flex>
          <Flex justify="between">
            <Text weight="medium">Time:</Text>
            <Text>{appointment.startTime}</Text>
          </Flex>
          <Flex justify="between">
            <Text weight="medium">Duration:</Text>
            <Text>{appointment.duration} minutes</Text>
          </Flex>
          <Flex justify="between">
            <Text weight="medium">Reason:</Text>
            <Text>{appointment.reason}</Text>
          </Flex>
          <Flex justify="between" className="mt-2">
            <Text weight="medium">Amount Due:</Text>
            <Text weight="bold" color="indigo" size="4">Rs. {appointment.fee.toLocaleString()}</Text>
          </Flex>
        </Flex>
      </Card>
      
      <PaymentForm 
        amount={appointment.fee}
        onSubmit={handlePayment}
        processing={processing}
        error={error}
      />
    </div>
  );
}