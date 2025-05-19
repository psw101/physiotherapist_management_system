"use client";

import React, { useState, useEffect } from "react";
import { Button, Heading, Text, Box, Card, Dialog, Flex, Table, IconButton, Switch, TextField, Badge, Checkbox, Tooltip } from "@radix-ui/themes";
import axios from "axios";
import { CalendarIcon, PlusIcon, ClockIcon, TrashIcon, UserGroupIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { format, parseISO } from "date-fns";

// Helpers
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMMM d, yyyy");
  } catch (error) {
    return dateString;
  }
};

export default function AppointmentSlotsPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [useDateFilter, setUseDateFilter] = useState(false); // Default to off
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      capacity: 1,
      isAvailable: true,
    },
  });

  // Fetch slots
  const fetchSlots = async (useFilter = useDateFilter, date = selectedDate) => {
    try {
      setIsLoading(true);
      // Only include date parameter if filter is enabled
      const url = useFilter ? `/api/admin/slots?date=${date}` : '/api/admin/slots';
      const response = await axios.get(url);
      setSlots(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load slots");
      console.error("Error fetching slots:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (useDateFilter) {
      fetchSlots(true, newDate);
    }
  };

  // Handle filter toggle
  const handleFilterToggle = (checked: boolean) => {
    setUseDateFilter(checked);
    fetchSlots(checked, selectedDate);
  };

  // Add new slot
  const handleAddSlot = async (data: any) => {
    try {
      setSubmitting(true);
      setError("");

      await axios.post("/api/admin/slots", data);

      // Reset form and close dialog
      reset();
      setShowAddDialog(false);

      // Reload data
      fetchSlots(useDateFilter, selectedDate);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add slot");
      console.error("Error adding slot:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/slots/${id}`);

      // Reload data
      fetchSlots(useDateFilter, selectedDate);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete slot");
      console.error("Error deleting slot:", err);
    }
  };

  // Toggle availability of a slot
  const toggleAvailability = async (slot: any) => {
    try {
      await axios.put(`/api/admin/slots/${slot.id}`, {
        isAvailable: !slot.isAvailable,
      });

      // Reload data
      fetchSlots(useDateFilter, selectedDate);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update availability");
      console.error("Error updating availability:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Heading size="5" mb="4">
          Appointment Slots
        </Heading>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Flex justify="between" align="center" mb="4">
        <Heading size="5">Appointment Slots</Heading>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Slot
        </Button>
      </Flex>

      {error && (
        <Card className="mb-4 bg-red-50 border-red-200">
          <Text color="red">{error}</Text>
        </Card>
      )}

      <Box className="mb-6">
        <Flex align="center" mb="2">
          <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
          <Text as="div" size="2" weight="medium">
            Filters
          </Text>
        </Flex>
        
        <Flex align="center" mb="2">
          <Checkbox checked={useDateFilter} onCheckedChange={handleFilterToggle} id="dateFilter" />
          <Text as="label" size="2" ml="1" htmlFor="dateFilter">
            Filter by date
          </Text>
        </Flex>
        
        {useDateFilter && (
          <div className="flex gap-4 items-center mt-2 ml-6">
            <TextField.Root 
              className="max-w-xs" 
              type="date" 
              value={selectedDate} 
              onChange={handleDateChange} 
            />
            <Text size="2" color="gray">
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </Text>
          </div>
        )}
      </Box>

      {slots.length === 0 ? (
        <Card className="p-6 text-center">
          <Text size="4" mb="4">
            No appointment slots found
            {useDateFilter ? ` for ${formatDate(selectedDate)}` : ""}
          </Text>
        </Card>
      ) : (
        <>
          <Card className="mb-6 p-4">
            <Flex gap="9" wrap="wrap">
              <Box className="min-w-[200px]">
                <Text size="1" color="gray">Total Slots</Text>
                <Heading size="4">{slots.length}</Heading>
              </Box>
              <Box className="min-w-[200px]">
                <Text size="1" color="gray">Total Capacity</Text>
                <Heading size="4">{slots.reduce((sum, slot) => sum + slot.capacity, 0)}</Heading>
              </Box>
              <Box className="min-w-[200px]">
                <Text size="1" color="gray">Total Booked</Text>
                <Heading size="4">{slots.reduce((sum, slot) => sum + slot.bookedCount, 0)}</Heading>
              </Box>
              <Box className="min-w-[200px]">
                <Text size="1" color="gray">Active Appointments</Text>
                <Heading size="4">{slots.reduce((sum, slot) => sum + slot.activeAppointments, 0)}</Heading>
              </Box>
            </Flex>
          </Card>

          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Capacity</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Booked</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Active</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Available</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {slots.map((slot) => (
                <Table.Row key={slot.id}>
                  <Table.Cell>
                    <Text weight="medium">
                      {formatDate(slot.date)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{slot.capacity}</Table.Cell>
                  <Table.Cell>
                    <Badge color={slot.isFull ? "red" : "blue"}>
                      {slot.bookedCount}/{slot.capacity}
                    </Badge>
                  </Table.Cell>  
                  <Table.Cell>
                    <Switch checked={slot.isAvailable} onCheckedChange={() => toggleAvailability(slot)} disabled={slot.isFull} />
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <IconButton size="1" variant="soft" color="red" onClick={() => handleDeleteSlot(slot.id)} title="Delete Slot" disabled={slot.bookedCount > 0}>
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </>
      )}

      {/* Add Slot Dialog */}
      <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add Appointment Slot</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Add a new time slot for patient appointments.
          </Dialog.Description>

          <form onSubmit={handleSubmit(handleAddSlot)} className="space-y-4">
            <Box>
              <Text as="div" size="2" mb="1" weight="medium">
                Date
              </Text>
              <TextField.Root 
                type="date" 
                {...register("date", { required: "Date is required" })} 
              />
              {errors.date && (
                <Text color="red" size="1">
                  {errors.date.message as string}
                </Text>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="medium">
                Start Time
              </Text>
              <TextField.Root 
                type="time" 
                {...register("startTime", { required: "Start time is required" })} 
              />
              {errors.startTime && (
                <Text color="red" size="1">
                  {errors.startTime.message as string}
                </Text>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="medium">
                End Time
              </Text>
              <TextField.Root 
                type="time" 
                {...register("endTime", { required: "End time is required" })} 
              />
              {errors.endTime && (
                <Text color="red" size="1">
                  {errors.endTime.message as string}
                </Text>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="medium">
                Capacity (number of patients)
              </Text>
              <TextField.Root
                type="number"
                min="1"
                {...register("capacity", {
                  required: "Capacity is required",
                  min: { value: 1, message: "Capacity must be at least 1" },
                  valueAsNumber: true,
                })}
              />
              {errors.capacity && (
                <Text color="red" size="1">
                  {errors.capacity.message as string}
                </Text>
              )}
            </Box>

            <Box>
              <Text as="div" size="2" mb="1" weight="medium">
                Available
              </Text>
              <Switch checked {...register("isAvailable")} />
            </Box>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Slot"}
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
