"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, TextField, Text, Callout } from "@radix-ui/themes";
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
      // Fetch session data from the API to get the role
      const tokenResponse = await fetch("/api/auth/token");
      const tokenData = await tokenResponse.json();
      
      console.log("Token data:", tokenData);
      
      // Redirect based on user role
      if (tokenData.role === "ADMIN") {
        console.log("Redirecting to admin dashboard");
        router.push("/admin");
      } else {
        console.log("Redirecting to user dashboard");
        router.push("/");
      }
    }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Sign In</h1>
            <p className="text-indigo-100 mt-2">Welcome back to your account</p>
          </div>

          {/* Login form */}
          <div className="p-6">
            {error && (
              <Callout.Root color="red" className="mb-4">
                <Callout.Text>{error}</Callout.Text>
              </Callout.Root>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Text as="label" size="2" mb="1" weight="medium" className="block mb-1">
                  Email Address
                </Text>
                <TextField.Root {...register("email")} placeholder="your.email@example.com" type="email" autoComplete="email">
                  <TextField.Slot>
                    <EnvelopeClosedIcon height={16} width={16} />
                  </TextField.Slot>
                </TextField.Root>
                {errors.email && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </div>

              <div>
                <Text as="label" size="2" mb="1" weight="medium" className="block mb-1">
                  Password
                </Text>
                <TextField.Root {...register("password")} placeholder="••••••••" type="password" autoComplete="current-password">
                  <TextField.Slot>
                    <LockClosedIcon height={16} width={16} />
                  </TextField.Slot>
                </TextField.Root>

                {errors.password && (
                  <Text size="1" color="red" className="mt-1">
                    {errors.password.message}
                  </Text>
                )}
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <Text size="2" className="ml-2">
                    Remember me
                  </Text>
                </label>
                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full" size="3">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Social login options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button onClick={() => signIn("google", { callbackUrl })} className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 w-full">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
                  </svg>
                  <span className="ml-2 font-medium">Continue with Google</span>
                </button>
              </div>
            </div>

            {/* Registration link */}
            <div className="mt-6 text-center">
              <Text size="2">
                Don't have an account?{" "}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Sign up
                </Link>
              </Text>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Text size="1" color="gray">
            © 2025 Physiotherapy Management System. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  );
}
