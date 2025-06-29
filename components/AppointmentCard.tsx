// components/AppointmentCard.tsx
import { format } from "date-fns";
import { Card, Text, Flex, Button } from "@radix-ui/themes";
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons";
import { AppointmentCardProps } from "@/types/models";
import { formatCurrency, getStatusColor } from "@/lib/utils";

export default function AppointmentCard({ 
  appointment, 
  onCancel, 
  isCancelling 
}: AppointmentCardProps) {
  // Format the date for display
  const formattedDate = format(new Date(appointment.appointmentDate), "MMM dd, yyyy");

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
          
          
          
       
          
          <Flex gap="2" mt="2">
            <div className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </div>
            
            <div className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.paymentStatus)}`}>
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