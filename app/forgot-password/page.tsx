"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EnvelopeClosedIcon, ReloadIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { Button, TextField, Text, Callout, Flex, Card, Heading } from "@radix-ui/themes";
import Link from "next/link";

// Validation schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // Form for email submission
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form for OTP verification
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle email submission to request OTP
  const handleEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the email for later use
      setUserEmail(data.email);
      
      // Call your email API to send the OTP
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          name: "User",
          subject: "Password Reset OTP",
          template: "otp",
          otp: otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send OTP");
      }

      // Store OTP in session storage (for demo purposes - in production use a more secure method)
      sessionStorage.setItem("resetOTP", otp);
      sessionStorage.setItem("resetEmail", data.email);

      setSuccess("OTP sent to your email address");
      setStep("otp");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification and password reset
  const handleOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get stored OTP and email from session storage (demo purpose only)
      const storedOTP = sessionStorage.getItem("resetOTP");
      const storedEmail = sessionStorage.getItem("resetEmail");

      // Verify OTP
      if (data.otp !== storedOTP) {
        throw new Error("Invalid OTP. Please try again.");
      }

      // Call API to reset password
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: storedEmail,
          password: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      // Clear session storage
      sessionStorage.removeItem("resetOTP");
      sessionStorage.removeItem("resetEmail");

      setSuccess("Password reset successfully!");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/Login");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-0 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <Heading size="6" className="text-white">Forgot Password</Heading>
          <Text size="2" className="text-indigo-100 mt-1">
            {step === "email" 
              ? "Enter your email to receive a reset code" 
              : "Enter the OTP sent to your email and set a new password"}
          </Text>
        </div>

        <div className="p-6">
          {error && (
            <Callout.Root color="red" className="mb-4">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          {success && (
            <Callout.Root color="green" className="mb-4">
              <Callout.Icon>
                <CheckCircledIcon />
              </Callout.Icon>
              <Callout.Text>{success}</Callout.Text>
            </Callout.Root>
          )}

          {step === "email" ? (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  Email Address
                </Text>
                <TextField.Root 
                  placeholder="your.email@example.com" 
                  type="email"
                  autoComplete="email"
                  {...emailForm.register("email")}
                >
                  <TextField.Slot>
                    <EnvelopeClosedIcon height={16} width={16} />
                  </TextField.Slot>
                </TextField.Root>
                {emailForm.formState.errors.email && (
                  <Text size="1" color="red" className="mt-1">
                    {emailForm.formState.errors.email.message}
                  </Text>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full" size="3">
                {isLoading ? (
                  <Flex align="center" gap="2">
                    <ReloadIcon className="animate-spin" />
                    Sending...
                  </Flex>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
              <div>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  Enter OTP
                </Text>
                <TextField.Root 
                  placeholder="6-digit code" 
                  type="text"
                  {...otpForm.register("otp")}
                />
                {otpForm.formState.errors.otp && (
                  <Text size="1" color="red" className="mt-1">
                    {otpForm.formState.errors.otp.message}
                  </Text>
                )}
              </div>

              <div>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  New Password
                </Text>
                <TextField.Root 
                  placeholder="••••••••" 
                  type="password"
                  {...otpForm.register("newPassword")}
                />
                {otpForm.formState.errors.newPassword && (
                  <Text size="1" color="red" className="mt-1">
                    {otpForm.formState.errors.newPassword.message}
                  </Text>
                )}
              </div>

              <div>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  Confirm Password
                </Text>
                <TextField.Root 
                  placeholder="••••••••" 
                  type="password"
                  {...otpForm.register("confirmPassword")}
                />
                {otpForm.formState.errors.confirmPassword && (
                  <Text size="1" color="red" className="mt-1">
                    {otpForm.formState.errors.confirmPassword.message}
                  </Text>
                )}
              </div>

              <Flex direction="column" gap="3">
                <Button type="submit" disabled={isLoading} size="3">
                  {isLoading ? (
                    <Flex align="center" gap="2">
                      <ReloadIcon className="animate-spin" />
                      Resetting...
                    </Flex>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep("email")}
                  disabled={isLoading}
                >
                  Back to Email Entry
                </Button>
              </Flex>
            </form>
          )}

          <div className="mt-6 text-center">
            <Text size="2">
              Remember your password?{" "}
              <Link href="/Login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Sign in
              </Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}