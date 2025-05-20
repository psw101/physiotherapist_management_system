"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, Transition } from '@headlessui/react';

// Load Stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AppointmentSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM format
  isAvailable: boolean;
  activeAppointments: number;
}

export default function MakeAppointment() {
  const router = useRouter();
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSlot, setBookingSlot] = useState<AppointmentSlot | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Add state for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

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
  }, []);
  
  // Handle initiating booking process
  const handleInitiateBooking = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
    setConfirmDialogOpen(true);
  };

  // Handle booking an appointment after confirmation
  const handleBookAppointment = async () => {
    if (!selectedSlot) return;
    
    try {
      setBookingSlot(selectedSlot);
      setIsProcessingPayment(true);
      setConfirmDialogOpen(false);
      
      // Get patientId from localStorage and ensure it's a number
      let patientId = 6; // Default to your test patient ID
      
      const storedId = localStorage.getItem("patientId");
      if (storedId) {
        patientId = Number(storedId);
      }
      
      // Make sure slotId is correctly formatted as a number if possible
      const slotId = typeof selectedSlot.id === 'string' ? parseInt(selectedSlot.id) : selectedSlot.id;
      
      if (isNaN(slotId)) {
        throw new Error(`Invalid slot ID: ${selectedSlot.id}`);
      }
      
      // Generate a unique reference for this booking
      const bookingRef = `APT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Skip temporary appointment creation and go straight to checkout
      const checkoutResponse = await axios.post("/api/checkout", {
        items: [
          {
            name: `Physiotherapy Appointment - ${format(new Date(selectedSlot.date), "MMM dd, yyyy")} at ${selectedSlot.time}`,
            description: "60-minute physiotherapy session",
            price: 2500, // LKR 2,500
            quantity: 1
          }
        ],
        orderId: bookingRef,
        orderDetails: {
          type: "appointment",
          appointmentDate: selectedSlot.date,
          appointmentTime: selectedSlot.time,
          slotId: slotId,
          patientId: patientId,
          duration: 60,
          reason: "Physiotherapy session",
          fee: 2500
        }
      });
      
      // Get the Stripe checkout session
      const { id: checkoutSessionId } = checkoutResponse.data;
      
      if (!checkoutSessionId) {
        throw new Error("Failed to create checkout session");
      }
      
      console.log("Redirecting to Stripe checkout...");
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionId
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
    } catch (err) {
      console.error("Failed to process appointment booking:", err);
      
      // Show detailed error message
      if (axios.isAxiosError(err) && err.response) {
        console.error("Error response:", err.response.data);
        alert(`Booking failed: ${err.response.data.error || err.response.data.details || err.message}`);
      } else {
        alert(`Failed to book appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setBookingSlot(null);
      setIsProcessingPayment(false);
    }
  };

  // Render your page components
  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Available Appointments</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          <p>{error}</p>
          <div className="mt-3">
            <button 
              onClick={() => setLoading(true)} 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Refresh Appointments
            </button>
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
            <div key={slot.id} className={`p-4 rounded-lg shadow bg-white ${!slot.isAvailable ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{format(new Date(slot.date), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{format(new Date(slot.date), "EEEE").toUpperCase()} {slot.time}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Active Appointments: {slot.activeAppointments}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {slot.isAvailable ? "Available" : "Booked"}
                    </span>
                  </div>
                  
                  <button 
                    disabled={!slot.isAvailable || !!bookingSlot || isProcessingPayment} 
                    onClick={() => handleInitiateBooking(slot)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {bookingSlot?.id === slot.id ? "Processing..." : "Book Appointment"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !error ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">No available appointments at this time.</p>
          <button 
            onClick={() => setLoading(true)} 
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Refresh Appointments
          </button>
        </div>
      ) : null}
      
      {/* Confirmation Dialog */}
      <Transition appear show={confirmDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setConfirmDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Your Appointment
                  </Dialog.Title>
                  
                  {selectedSlot && (
                    <div className="mt-4">
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Date:</span>
                          <span>{format(new Date(selectedSlot.date), "MMMM dd, yyyy")}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Day:</span>
                          <span>{format(new Date(selectedSlot.date), "EEEE")}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Time:</span>
                          <span>{selectedSlot.time}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Duration:</span>
                          <span>60 minutes</span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-blue-100">
                          <span className="font-bold">Fee:</span>
                          <span className="font-bold">LKR 2,500.00</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4">
                        By clicking "Confirm & Pay", you agree to our terms and conditions for appointments. 
                        Payment is required to secure your booking.
                      </p>
                      
                      <div className="mt-6 flex justify-between gap-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none"
                          onClick={() => setConfirmDialogOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                          onClick={handleBookAppointment}
                        >
                          Confirm & Pay
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}