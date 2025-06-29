import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "blue" | "indigo" | "green" | "red";
}

export function LoadingSpinner({ 
  size = "medium", 
  color = "indigo" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };
  
  const colorClasses = {
    blue: "border-blue-500",
    indigo: "border-indigo-500",
    green: "border-green-500",
    red: "border-red-500"
  };
  
  return (
    <div className="flex justify-center py-12">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  );
}
