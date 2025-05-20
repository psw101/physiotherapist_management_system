"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Card, Button, Text, Flex, Box, Heading } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

interface AppointmentDetails {
  id: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  status: string;
  reason: string;
  paymentStatus: string;
  fee: number;
  patientId: string;
  slotId: string;
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
  
  // Handle payment through Stripe
  const handlePayment = async () => {
    if (!appointment) return;
    
    try {
      setProcessing(true);
      setError("");
      
      // Create Stripe checkout session
      const response = await axios.post('/api/checkout', {
        items: [{
          name: "Physiotherapy Appointment",
          price: appointment.fee,
          quantity: 1,
          description: `Appointment on ${format(new Date(appointment.appointmentDate), "MMMM d, yyyy")} at ${appointment.startTime}`
        }],
        orderDetails: {
          type: "appointment",
          id: appointment.id,
          patientId: appointment.patientId,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.startTime,
          duration: appointment.duration,
          reason: appointment.reason,
          slotId: appointment.slotId,
          fee: appointment.fee
        }
      });
      
      // Redirect to Stripe checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: response.data.id });
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setError("Payment failed. Please try again later.");
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
          <Button onClick={() => router.push("/appointments/book-appointments")}>
            Book a New Appointment
          </Button>
        </div>
      </Box>
    );
  }
  
  // Don't show payment form if already paid
  if (appointment.paymentStatus === "paid") {
    return (
      <div className="p-6 bg-slate-50 max-w-3xl mx-auto">
        <Heading size="6" className="mb-6">Payment for Appointment</Heading>
        
        <Card className="p-4 mb-6 bg-green-50">
          <Heading size="3" className="mb-4">Already Paid</Heading>
          <Text>This appointment has already been paid for. No further payment is required.</Text>
          <Button className="mt-4" onClick={() => router.push("/appointments/my-appointments")}>
            View My Appointments
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-slate-50 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeftIcon />
        </Button>
        <Heading size="6">Payment for Appointment</Heading>
      </div>
      
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
      
      <Card className="p-6 ">
        
        {error && (
          <Box className="p-3 mb-4 bg-red-50 text-red-600 rounded">
            {error}
          </Box>
        )}
        
        <Button 
          onClick={handlePayment}
          disabled={processing}
          size="3"
          className="w-full mt-2 "
        >
          {processing ? "Processing..." : `Pay Rs. ${appointment.fee.toLocaleString()}`}
        </Button>
        
      </Card>
    </div>
  );
}