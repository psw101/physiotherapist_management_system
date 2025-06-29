import React from "react";
import { Card, Heading, Text } from "@radix-ui/themes";

interface ErrorMessageProps {
  message: string;
  title?: string;
  variant?: "danger" | "warning";
}

export function ErrorMessage({ 
  message, 
  title = "Error", 
  variant = "danger" 
}: ErrorMessageProps) {
  const bgColor = variant === "danger" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
  const textColor = variant === "danger" ? "text-red-600" : "text-yellow-600";
  
  return (
    <Card className={`p-4 ${bgColor} border`}>
      <Heading size="3" className={`mb-2 ${textColor}`}>{title}</Heading>
      <Text color={variant === "danger" ? "red" : "yellow"}>{message}</Text>
    </Card>
  );
}
