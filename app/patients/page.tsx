"use client";
import React, { useState } from "react";
import { Button, Text, TextArea, TextField } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "../api/validationSchemas";
import {z} from "zod";

type PatientForm = z.infer<typeof patientSchema>;

interface PatientFormData {
  name: string;
  username: string;
  password: string;
  age: number;
  contactNumber: string;
  email: string;
  area: string;
  nic: string;
  address: string;
}

const Patients = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({resolver: zodResolver(patientSchema)});

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Form submitted:", data);
      // Uncomment when API endpoint is ready
      // await axios.post("/api/patients", data);
      // router.push("/patients/view");
      setError("");
      reset(); // Clear form after successful submission
    } catch (error) {
      console.error("Error submitting patient data:", error);
      setError("An unexpected error occurred while saving patient data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Patient</h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Patient Name
          </Text>
          <TextField.Root placeholder="Enter patient's full name" {...register("name")} />
          {errors.name && (
            <Text color="red" size="1">
              {errors.name.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Username
          </Text>
          <TextField.Root placeholder="Create a username" {...register("username")} />
          {errors.username && (
            <Text color="red" size="1">
              {errors.username.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Password
          </Text>
          <TextField.Root type="password" placeholder="Create a password" {...register("password", { required: "Password is required" })} />
          {errors.password && (
            <Text color="red" size="1">
              {errors.password.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Age
          </Text>
          <TextField.Root
            type="number"
            placeholder="Enter patient's age"
            {...register("age", {
              valueAsNumber: true,
              required: "Age is required",
              min: { value: 0, message: "Age cannot be negative" },
            })}
          />
          {errors.age && (
            <Text color="red" size="1">
              {errors.age.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Contact Number
          </Text>
          <TextField.Root placeholder="Enter contact number" {...register("contactNumber", { required: "Contact number is required" })} />
          {errors.contactNumber && (
            <Text color="red" size="1">
              {errors.contactNumber.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Email
          </Text>
          <TextField.Root
            type="email"
            placeholder="Enter email address"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <Text color="red" size="1">
              {errors.email.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Area
          </Text>
          <TextField.Root placeholder="Enter residential area" {...register("area", { required: "Area is required" })} />
          {errors.area && (
            <Text color="red" size="1">
              {errors.area.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            NIC / Passport
          </Text>
          <TextField.Root placeholder="Enter NIC or passport number" {...register("nic", { required: "NIC/Passport number is required" })} />
          {errors.nic && (
            <Text color="red" size="1">
              {errors.nic.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Address
          </Text>
          <TextArea placeholder="Enter full address" {...register("address", { required: "Address is required" })} />
          {errors.address && (
            <Text color="red" size="1">
              {errors.address.message}
            </Text>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Patient"}
          </Button>
          <Button type="button" variant="soft" color="gray" onClick={() => reset()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Patients;
