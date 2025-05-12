'use client'
import React, { useState } from 'react'
import { TextField, Text, Button } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface AppointmentForm {
  name: string;
  // Add other fields when you're ready
}

const MakeAppointmentPagePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {register, handleSubmit, formState: { errors }} = useForm<AppointmentForm>();
  
  const onSubmit = async (data: AppointmentForm) => {
    console.log("Form submitted", data);
    setIsSubmitting(true);
    
    try {
      // Create a minimal payload
      const payload = {
        name: data.name
      };
      
      console.log("Sending payload:", payload);
      
      // Add explicit headers
      const response = await axios.post('/api/appointments', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response:", response.data);
      alert("Appointment created successfully!");
      router.push("/appointments");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert("Error: " + (error.response?.data?.message || error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Make an Appointment</h1>
      
      {/* The key part is explicitly specifying onSubmit={handleSubmit(onSubmit)} */}
      <form className="max-w-xl space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Text as="label" size="2">Name</Text>
          <TextField.Root 
            placeholder="Enter your name" 
            {...register("name", { required: "Name is required" })} 
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        {/* Make sure the button is type="submit" */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Make Appointment"}
        </Button>
      </form>
    </div>
  )
}

export default MakeAppointmentPagePage