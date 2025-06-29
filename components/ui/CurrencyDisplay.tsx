import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import { formatCurrency } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  color?: "ruby" | "gray" | "gold" | "bronze" | "brown" | "yellow" | "amber" | "orange" | 
          "tomato" | "red" | "crimson" | "pink" | "plum" | "purple" | "violet" | "iris" | 
          "indigo" | "blue" | "cyan" | "teal" | "jade" | "green" | "grass" | "lime";
  currency?: string;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  size = "3",
  color,
  currency = "Rs.",
  className = "",
}: CurrencyDisplayProps) {
  // For currency symbol, use a size that's relatively smaller than the amount
  const getSymbolSize = (): CurrencyDisplayProps["size"] => {
    // Map larger sizes to smaller ones
    switch (size) {
      case "9": case "8": return "5";
      case "7": case "6": return "4";
      case "5": return "3";
      case "4": return "2";
      default: return "1";
    }
  };
  
  return (
    <Flex align="baseline" className={className}>
      <Text size={getSymbolSize()} weight="bold" className="mr-1" color={color}>
        {currency}
      </Text>
      <Text size={size} weight="bold" color={color}>
        {formatCurrency(amount, false)}
      </Text>
    </Flex>
  );
}
