"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format, addDays } from "date-fns";
import { Card, Button, Text, Flex, Box } from "@radix-ui/themes";
import { CalendarIcon, ClockIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";

interface AppointmentSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM format
  isAvailable: boolean;
  activeAppointments: number;
}

export default function MakeAppointment() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);
  const [bookingSlot, setBookingSlot] = useState<AppointmentSlot | null>(null);
  const [error, setError] = useState("");

  // Fetch available slots when component mounts
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        // For demo purposes, generate one slot per day for the next 10 days
        const mockSlots: AppointmentSlot[] = [];
        
        // Create one slot per day for the next 10 days
        for (let i = 0; i < 10; i++) {
          const date = addDays(new Date(), i);
          const formattedDate = format(date, "yyyy-MM-dd");
          // Generate a fixed time for each day (e.g., 10:00 AM)
          const time = "10:00";
          
          mockSlots.push({
            id: `slot-${i}`,
            date: formattedDate,
            time,
            isAvailable: Math.random() > 0.3, // 70% chance of being available
            activeAppointments: Math.floor(Math.random() * 3) // 0-2 active appointments
          });
        }
        
        setAppointmentSlots(mockSlots);
        setError("");
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        setError("Failed to load available appointment slots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableSlots();
  }, []);

  // Handle booking an appointment
  const handleBookAppointment = async (slot: AppointmentSlot) => {
    try {
      setBookingSlot(slot);
      
      // Get patientId from localStorage and ensure it's a number
      let patientId = 6; // Default to your test patient ID
      
      const storedId = localStorage.getItem("patientId");
      if (storedId) {
        patientId = Number(storedId);
      }
      
      const appointmentData = {
        appointmentDate: slot.date,
        startTime: slot.time,
        duration: 60,
        status: "pending",
        reason: "Physiotherapy session",
        patientId: patientId
      };
      
      console.log("Sending appointment data:", appointmentData);
      
      // Add explicit error handling for the appointment creation
      const response = await axios.post("/api/appointments", appointmentData);
      
      console.log("Appointment created:", response.data);
      
      // Get the appointment ID from the response
      const appointmentId = response.data.id;
      
      if (!appointmentId) {
        throw new Error("No appointment ID returned from server");
      }
      
      // Redirect to payment page with the appointment ID
      router.push(`/appointments/payment/${appointmentId}`);
    } catch (err) {
      console.error("Failed to book appointment:", err);
      
      // Show detailed error message
      if (axios.isAxiosError(err) && err.response) {
        console.error("Error response:", err.response.data);
        alert(`Booking failed: ${err.response.data.error || err.response.data.details || err.message}`);
      } else {
        alert(`Failed to book appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setBookingSlot(null);
    }
  };

  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Available Appointments</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      
      {/* Appointment slots list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : appointmentSlots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointmentSlots.map((slot) => (
            <Card key={slot.id} className={`p-4 ${!slot.isAvailable ? 'opacity-60' : ''}`}>
              <Flex justify="between" align="center">
                <Flex direction="column" gap="1">
                  <Flex align="center" gap="2">
                    <CalendarIcon />
                    <Text weight="medium">{format(new Date(slot.date), "MMM dd, yyyy")}</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <ClockIcon />
                    <Text>{format(new Date(slot.date), "EEEE").toUpperCase()} {slot.time}</Text>
                  </Flex>
                  
                  <Text size="1" color="gray" className="mt-1">
                    Active Appointments: {slot.activeAppointments}
                  </Text>
                </Flex>
                
                <Flex direction="column" align="end" gap="2">
                  <Flex align="center" gap="1">
                    {slot.isAvailable ? (
                      <CheckCircledIcon className="text-green-500" />
                    ) : (
                      <CrossCircledIcon className="text-red-500" />
                    )}
                    <Text color={slot.isAvailable ? "green" : "red"} weight="medium">
                      {slot.isAvailable ? "Available" : "Booked"}
                    </Text>
                  </Flex>
                  
                  <Button 
                    disabled={!slot.isAvailable || !!bookingSlot} 
                    onClick={() => handleBookAppointment(slot)}
                    color="indigo"
                    size="2"
                  >
                    {bookingSlot?.id === slot.id ? "Booking..." : "Book"}
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </div>
      ) : (
        <Box className="p-8 text-center bg-gray-50 rounded-lg">
          <Text size="3" color="gray">No available appointments at this time. Please check back later.</Text>
        </Box>
      )}
    </div>
  );
}