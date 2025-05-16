// components/AppointmentCard.tsx
import { format } from "date-fns";
import { Card, Text, Flex, Button } from "@radix-ui/themes";
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons";

interface AppointmentCardProps {
  appointment: {
    id: string;
    appointmentDate: string;
    startTime: string;
    duration: number;
    status: string;
    paymentStatus: string;
    fee: number;
    reason?: string;
    physiotherapist?: {
      name: string;
      specialization: string;
    };
  };
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
}

export default function AppointmentCard({ 
  appointment, 
  onCancel, 
  isCancelling 
}: AppointmentCardProps) {
  // Format the date for display
  const formattedDate = format(new Date(appointment.appointmentDate), "MMM dd, yyyy");
  
  // Get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled": return "bg-green-100 text-green-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "pending": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  // Get payment status color
  const getPaymentColor = (status: string) => {
    return status.toLowerCase() === "paid" 
      ? "bg-green-100 text-green-700" 
      : "bg-yellow-100 text-yellow-700";
  };

  return (
    <Card className="p-4">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="2">
          <Flex align="center" gap="2">
            <CalendarIcon className="text-indigo-500" />
            <Text weight="medium">{formattedDate}</Text>
          </Flex>
          
          <Flex align="center" gap="2">
            <ClockIcon className="text-indigo-500" />
            <Text>{appointment.startTime} • {appointment.duration} mins</Text>
          </Flex>
          
          {appointment.physiotherapist && (
            <Text size="2">
              Physiotherapist: {appointment.physiotherapist.name}
              {appointment.physiotherapist.specialization && (
                <span className="text-gray-500"> ({appointment.physiotherapist.specialization})</span>
              )}
            </Text>
          )}
          
          {appointment.reason && (
            <Text size="2">{appointment.reason}</Text>
          )}
          
          <Flex gap="2" mt="2">
            <div className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </div>
            
            <div className={`px-2 py-1 rounded text-xs ${getPaymentColor(appointment.paymentStatus)}`}>
              {appointment.paymentStatus}
            </div>
          </Flex>
          
          <Text size="2" className="mt-1">Fee: Rs. {appointment.fee.toLocaleString()}</Text>
        </Flex>
        
        {onCancel && appointment.status !== "cancelled" && appointment.status !== "completed" && (
          <Button 
            color="red" 
            variant="soft" 
            size="1"
            disabled={isCancelling}
            onClick={() => onCancel(appointment.id)}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>
        )}
      </Flex>
    </Card>
  );
}