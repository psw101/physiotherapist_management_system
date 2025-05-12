"use client";
import React, { useState } from "react";
import { TextField, Text, Button } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";

interface AppointmentForm {
  name: string;
  age: number;
  contactNumber: string;
  email: string;
  address: string;
  nic: string;
}

const MakeAppointmentPagePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<AppointmentForm>();

  const onSubmit = async (data: AppointmentForm) => {
    console.log("Form submitted", data);
    try {
      const response = await axios.post("/api/appointments", data);
      console.log(response.data);
      router.push("/appointments/make-appointments");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form className="max-w-xl space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <Text>Name</Text>
        <TextField.Root placeholder="Enter your name" {...register("name")} />
        <Text>Age</Text>
        <TextField.Root type="number" placeholder="35" {...register("age")} />
        <Text>Contact Number</Text>
        <TextField.Root placeholder="07xxxxxxxx" {...register("contactNumber")} />
        <Text>Email (Optional)</Text>
        <TextField.Root placeholder="Ex: abc@abc.com" {...register("email")} />
        <Text>NIC</Text>
        <TextField.Root placeholder="2222222222" {...register("nic")} />
        <Text>Address</Text>
        <TextField.Root placeholder="221B Baker Street" {...register("address")} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Make Appointment"}
        </Button>
      </form>
    </div>
  );
};

export default MakeAppointmentPagePage;
