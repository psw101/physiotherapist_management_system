"use client";
import React, { useState } from "react";
import { Button, Text, TextArea, TextField, Callout } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "../api/validationSchemas";
import { z } from "zod";
import { CheckCircledIcon } from "@radix-ui/react-icons";

// Extended schema with confirm password
const extendedPatientSchema = patientSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PatientFormData = z.infer<typeof patientSchema> & { confirmPassword: string };

const Patients = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PatientFormData>({
    resolver: zodResolver(extendedPatientSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Remove confirmPassword before API submission
      const { confirmPassword, ...apiData } = data;

      // Submit to API
      await axios.post("/api/patients", apiData);

      // Show success message
      setSuccess(true);
      reset();

      // Redirect to home page after a delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting patient data:", error);
      setError("An unexpected error occurred while saving patient data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {error && (
          <Callout.Root color="red" className="mb-6">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {success && (
          <Callout.Root color="green" className="mb-6">
            <Callout.Icon>
              <CheckCircledIcon />
            </Callout.Icon>
            <Callout.Text>Registration successful! Redirecting to home page...</Callout.Text>
          </Callout.Root>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Name
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
          <TextField.Root type="password" placeholder="Create a password" {...register("password")} />
          {errors.password && (
            <Text color="red" size="1">
              {errors.password.message}
            </Text>
          )}
        </div>

        {/* New confirm password field */}
        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Confirm Password
          </Text>
          <TextField.Root type="password" placeholder="Confirm your password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <Text color="red" size="1">
              {errors.confirmPassword.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Contact Number
          </Text>
          <TextField.Root placeholder="Enter contact number" {...register("contactNumber")} />
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
          <TextField.Root type="email" placeholder="Enter email address" {...register("email")} />
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
          <TextField.Root placeholder="Enter residential area" {...register("area")} />
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
          <TextField.Root placeholder="Enter NIC or passport number" {...register("nic")} />
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
          <TextArea placeholder="Enter full address" {...register("address")} />
          {errors.address && (
            <Text color="red" size="1">
              {errors.address.message}
            </Text>
          )}
        </div>
   
        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Date of Birth
          </Text>
          <input 
            type="date" 
            className="w-full border rounded p-2" 
            max={new Date().toISOString().split('T')[0]} 
            {...register("dateOfBirth")} 
          />
          {errors.dateOfBirth && (
            <Text color="red" size="1">
              {errors.dateOfBirth.message}
            </Text>
          )}
        </div>

        <div className="flex gap-4 pt-4 justify-center">
          <Button type="submit" disabled={isSubmitting || success} className="w-full">
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
          <Button type="button" variant="soft" color="gray" onClick={() => reset()} disabled={isSubmitting || success} className="w-full">
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Patients;
