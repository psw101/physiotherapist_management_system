import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with proper localization
 * @param amount Number to format
 * @param withCurrency Include the currency symbol (default: true)
 * @param currency Currency symbol (default: "Rs.")
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, withSymbol: boolean = true): string {
  // Check if we're getting a valid number
  console.log("Formatting amount:", amount, typeof amount);
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    console.warn("Invalid amount passed to formatCurrency:", amount);
    return "0";
  }
  
  // Format the number with commas
  const formattedAmount = Number(amount).toLocaleString('en-IN');
  
  // Return with or without currency symbol
  return withSymbol ? `₹${formattedAmount}` : formattedAmount;
}

/**
 * Get appropriate color class for status indicators
 * @param status Status string
 * @returns Tailwind CSS class for the status badge
 */
export function getStatusColor(status: string) {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "completed":
    case "delivered":
    case "paid":
    case "active":
    case "scheduled":
      return "bg-green-100 text-green-700";
    case "pending":
    case "partially_paid":
    case "awaiting":
      return "bg-orange-100 text-orange-700";
    case "cancelled":
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-700";
    case "processing":
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
