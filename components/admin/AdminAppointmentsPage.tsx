"use client";

import React from "react";
import { Button, Heading, Text, Card, Tabs, Box, Flex } from "@radix-ui/themes";
import Link from "next/link";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function AdminAppointmentsPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <Heading size="5" mb="4">Appointment Management</Heading>
      
      <Tabs.Root defaultValue="appointments">
        <Tabs.List>
          <Tabs.Trigger value="appointments">Appointments</Tabs.Trigger>
          <Tabs.Trigger value="availableDates">Available Dates</Tabs.Trigger>
        </Tabs.List>
        
        <Box py="4">
          <Tabs.Content value="appointments">
            <Card>
              <Flex direction="column" gap="4">
                <Text as="p">
                  Here you can manage patient appointments, check their status, and process payments.
                </Text>
                <Link href="/admin/appointments/list" passHref>
                  <Button>View All Appointments</Button>
                </Link>
              </Flex>
            </Card>
          </Tabs.Content>
          
          <Tabs.Content value="availableDates">
            <Card>
              <Flex direction="column" gap="4">
                <Text as="p">
                  Manage available dates and time slots for appointments. These are the dates and times that will be shown to patients when booking appointments.
                </Text>
                
                <Flex gap="4">
                  <Button 
                    onClick={() => router.push("/admin/appointments/available-dates")}
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    Manage Available Dates
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}