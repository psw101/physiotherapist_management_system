"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heading, Text, Button, Card, Flex } from "@radix-ui/themes";
import AppointmentCard from "@/components/AppointmentCard";

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  status: string;
  reason: string;
  paymentStatus: string;
  fee: number;
  physiotherapist?: {
    name: string;
    specialization: string;
  };
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("Fetching appointments...");
        const response = await axios.get("/api/patients/appointments");
        console.log("Appointments response:", response.data);
        
        // Filter to only include paid appointments
        const paidAppointments = response.data.filter(
          (appointment: Appointment) => appointment.paymentStatus === "paid"
        );
        
        setAppointments(paidAppointments);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError("Failed to load your appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchAppointments();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleCancelAppointment = async (id: string) => {
    try {
      setCancellingId(id);
      
      // Call API to cancel appointment
      await axios.patch(`/api/appointments/${id}`, {
        status: "cancelled"
      });
      
      // Update the appointment in state - keep the same order
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === id 
            ? { ...appointment, status: "cancelled" } 
            : appointment
        )
      );
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  // Get upcoming appointments (only showing scheduled appointments)
  const getUpcomingAppointments = () => {
    // Create a copy of the array to avoid modifying the original
    const sortedAppointments = [...appointments];

    // Sort by date (most recent first)
    sortedAppointments.sort((a, b) => {
      // Convert strings to Date objects for comparison
      const dateA = new Date(`${a.appointmentDate} ${a.startTime}`);
      const dateB = new Date(`${b.appointmentDate} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime(); // Chronological order
    });

    // Only return appointments with status "pending" or "scheduled"
    return sortedAppointments.filter(a => 
      ["pending", "scheduled"].includes(a.status.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-8 text-center">
        <Heading size="5" className="mb-4">Please sign in to view your appointments</Heading>
        <Button onClick={() => router.push("/login")}>
          Sign In
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-4 mb-6 bg-red-50 border border-red-200">
          <Text color="red">{error}</Text>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Get upcoming appointments
  const upcomingAppointments = getUpcomingAppointments();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="6">My Appointments</Heading>
        <Button onClick={() => router.push("/user/appointments/book-appointments")}>
          Book New Appointment
        </Button>
      </Flex>
      
      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Text size="5" className="mb-4">You have no upcoming appointments</Text>
        </div>
      ) : (
        <div>
          <Heading size="4" className="mb-4">Upcoming Appointments</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancelAppointment}
                isCancelling={cancellingId === appointment.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}