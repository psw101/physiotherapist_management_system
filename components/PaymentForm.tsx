import { useState } from "react";
import { Card, Button, Text, Flex, Box, TextField, Heading } from "@radix-ui/themes";

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentDetails: PaymentDetails) => Promise<void>;
  processing: boolean;
  error?: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export default function PaymentForm({ 
  amount, 
  onSubmit, 
  processing, 
  error 
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      cardNumber,
      cardName,
      expiryDate,
      cvv
    });
  };
  
  return (
    <Card className="p-4">
      <Heading size="3" className="mb-4">Payment Information</Heading>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Text as="label" size="2" weight="medium" className="block mb-2">
            Card Number
          </Text>
          <TextField.Root 
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Text as="label" size="2" weight="medium" className="block mb-2">
            Name on Card
          </Text>
          <TextField.Root 
            placeholder="John Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
        </div>
        
        <Flex gap="4">
          <div className="flex-1">
            <Text as="label" size="2" weight="medium" className="block mb-2">
              Expiry Date
            </Text>
            <TextField.Root 
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>
          
          <div className="w-24">
            <Text as="label" size="2" weight="medium" className="block mb-2">
              CVV
            </Text>
            <TextField.Root 
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </div>
        </Flex>
        
        <Button 
          type="submit" 
          color="indigo" 
          size="3" 
          className="w-full" 
          disabled={processing}
        >
          {processing ? "Processing..." : `Pay Rs. ${amount.toLocaleString()}`}
        </Button>
      </form>
    </Card>
  );
}