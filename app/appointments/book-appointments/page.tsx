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
  const [retryCount, setRetryCount] = useState(0);

  // Fetch available slots when component mounts
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Call the API for available slots with parameters to show all slots
        const response = await axios.get("/api/slots/available?includeAll=true");
        console.log("API response:", response.data);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Use the data from the API
          setAppointmentSlots(response.data);
        } else {
          // No slots available
          setError("No available appointment slots found. Please check back later.");
          setAppointmentSlots([]);
        }
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        
        if (axios.isAxiosError(err)) {
          const statusCode = err.response?.status;
          const errorMessage = err.response?.data?.error || err.message;
          
          if (statusCode === 404) {
            setError("No appointment slots are currently available. Please check back later.");
          } else {
            setError(`Error loading appointments: ${errorMessage}`);
          }
        } else {
          setError("Failed to load available appointment slots. Please try again later.");
        }
        
        setAppointmentSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableSlots();
  }, [retryCount]);
  
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
      
      // Make sure slotId is correctly formatted as a number if possible
      // Backend expects it as a number, but frontend may have it as a string
      const slotId = typeof slot.id === 'string' ? parseInt(slot.id) : slot.id;
      
      if (isNaN(slotId)) {
        throw new Error(`Invalid slot ID: ${slot.id}`);
      }
      
      const appointmentData = {
        appointmentDate: slot.date,
        startTime: slot.time,
        duration: 60,
        status: "pending",
        reason: "Physiotherapy session",
        patientId: patientId,
        slotId: slotId,
        fee: 2500 // Include standard fee
      };
      
      console.log("Sending appointment data:", appointmentData);
      
      // Disable the button for this slot during the API call
      setBookingSlot(slot);
      
      // Add explicit error handling for the appointment creation
      const response = await axios.post("/api/appointments", appointmentData);
      
      console.log("Appointment created:", response.data);
      
      // Get the appointment ID from the response
      const appointmentId = response.data.id;
      
      if (!appointmentId) {
        throw new Error("No appointment ID returned from server");
      }
      
      // After successful booking, update local state to mark slot as booked
      setAppointmentSlots(prev => 
        prev.map(s => 
          s.id === slot.id 
            ? { ...s, isAvailable: false, activeAppointments: s.activeAppointments + 1 }
            : s
        )
      );
      
      // Show success message
      alert("Appointment booked successfully! Redirecting to payment page...");
      
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

  // Handler to manually refresh the data
  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Available Appointments</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          <p>{error}</p>
          <div className="mt-3">
            <Button 
              onClick={handleRefresh} 
              variant="soft" 
              color="gray" 
              size="2"
            >
              Refresh Appointments
            </Button>
          </div>
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
      ) : !error ? (
        <Box className="p-8 text-center bg-gray-50 rounded-lg">
          <Text size="3" color="gray">No available appointments at this time.</Text>
          <Button 
            onClick={handleRefresh} 
            variant="soft" 
            color="gray" 
            className="mt-4"
          >
            Refresh Appointments
          </Button>
        </Box>
      ) : null}
    </div>
  );
}