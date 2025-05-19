// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import axios from "axios";
// import { Card, Text, Heading, Box, Flex, Table, Button, Badge, Select } from "@radix-ui/themes";
// import { format } from "date-fns";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// interface SlotStats {
//   id: number;
//   date: string;
//   timeSlot: string;
//   physiotherapist: string;
//   specialization: string;
//   capacity: number;
//   bookedCount: number;
//   totalAppointments: number;
//   availableCapacity: number;
//   utilizationRate: string;
//   isAvailable: boolean;
//   statusBreakdown: {
//     pending: number;
//     scheduled: number;
//     completed: number;
//     cancelled: number;
//     noShow: number;
//   };
//   paymentBreakdown: {
//     paid: number;
//     unpaid: number;
//     refunded: number;
//   };
//   revenue: number;
// }

// interface Summary {
//   totalSlots: number;
//   totalCapacity: number;
//   totalBooked: number;
//   totalAppointments: number;
//   totalRevenue: number;
//   averageUtilization: number;
//   statusTotals: {
//     pending: number;
//     scheduled: number;
//     completed: number;
//     cancelled: number;
//     noShow: number;
//   };
//   paymentTotals: {
//     paid: number;
//     unpaid: number;
//     refunded: number;
//   };
// }

// interface StatsResponse {
//   summary: Summary;
//   slotDetails: SlotStats[];
// }

// // Chart colors
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// export default function AppointmentStatistics() {
//   const { data: session, status } = useSession();
//   const [stats, setStats] = useState<StatsResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [dateRange, setDateRange] = useState("30");
//   const [physiotherapistFilter, setPhysiotherapistFilter] = useState("");
//   const [physiotherapists, setPhysiotherapists] = useState([]);
  
//   useEffect(() => {
//     const fetchStatistics = async () => {
//       try {
//         setLoading(true);
        
//         // Calculate date range
//         let startDate = null;
//         const today = new Date();
        
//         if (dateRange !== "all") {
//           const days = parseInt(dateRange);
//           startDate = new Date();
//           startDate.setDate(today.getDate() - days);
//         }
        
//         // Build query parameters
//         const params = new URLSearchParams();
//         if (startDate) {
//           params.set("startDate", startDate.toISOString().split('T')[0]);
//         }
//         params.set("endDate", today.toISOString().split('T')[0]);
        
//         if (physiotherapistFilter) {
//           params.set("physiotherapistId", physiotherapistFilter);
//         }
        
//         // Fetch statistics
//         const response = await axios.get(`/api/admin/appointment-stats?${params.toString()}`);
//         setStats(response.data);
        
//         // Also fetch physiotherapists for filter
//         if (physiotherapists.length === 0) {
//           const physioResponse = await axios.get('/api/physiotherapists');
//           setPhysiotherapists(physioResponse.data);
//         }
        
//         setError("");
//       } catch (err) {
//         console.error("Failed to fetch appointment statistics:", err);
//         setError("Failed to load statistics. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (status === "authenticated") {
//       fetchStatistics();
//     } else if (status === "unauthenticated") {
//       setLoading(false);
//       setError("Please sign in as an administrator to view this page.");
//     }
//   }, [status, dateRange, physiotherapistFilter]);
  
//   // Prepare data for status pie chart
//   const getStatusChartData = () => {
//     if (!stats) return [];
    
//     return [
//       { name: 'Pending', value: stats.summary.statusTotals.pending },
//       { name: 'Scheduled', value: stats.summary.statusTotals.scheduled },
//       { name: 'Completed', value: stats.summary.statusTotals.completed },
//       { name: 'Cancelled', value: stats.summary.statusTotals.cancelled },
//       { name: 'No Show', value: stats.summary.statusTotals.noShow }
//     ].filter(item => item.value > 0);
//   };
  
//   // Prepare data for payment pie chart
//   const getPaymentChartData = () => {
//     if (!stats) return [];
    
//     return [
//       { name: 'Paid', value: stats.summary.paymentTotals.paid },
//       { name: 'Unpaid', value: stats.summary.paymentTotals.unpaid },
//       { name: 'Refunded', value: stats.summary.paymentTotals.refunded }
//     ].filter(item => item.value > 0);
//   };
  
//   // Status badge component
//   const StatusBadge = ({ count, label, color }: { count: number, label: string, color: string }) => (
//     <Flex gap="2" align="center">
//       <Badge color={color} size="1" variant="solid">
//         {count}
//       </Badge>
//       <Text size="2">{label}</Text>
//     </Flex>
//   );
  
//   if (loading) {
//     return (
//       <div className="flex justify-center py-12"></div>
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="p-8">
//         <Card className="p-4 bg-red-50 border border-red-200">
//           <Text color="red">{error}</Text>
//         </Card>
//       </div>
//     );
//   }
  
//   if (!stats) {
//     return (
//       <div className="p-8">
//         <Card className="p-4">
//           <Text>No appointment statistics available.</Text>
//         </Card>
//       </div>
//     );
//   }
  
//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <Heading size="8" className="mb-6">Appointment Statistics</Heading>
      
//       {/* Filters */}
//       <Card className="p-4 mb-6">
//         <Flex gap="4" wrap="wrap">
//           <Box className="min-w-[200px]">
//             <Text size="2" weight="bold" className="mb-1">Time Period</Text>
//             <Select.Root value={dateRange} onValueChange={setDateRange}>
//               <Select.Trigger />
//               <Select.Content>
//                 <Select.Item value="7">Last 7 days</Select.Item>
//                 <Select.Item value="30">Last 30 days</Select.Item>
//                 <Select.Item value="90">Last 90 days</Select.Item>
//                 <Select.Item value="all">All time</Select.Item>
//               </Select.Content>
//             </Select.Root>
//           </Box>
          
//           <Box className="min-w-[250px]"></Box>
//             <Text size="2" weight="bold" className="mb-1">Physiotherapist</Text>
//             <Select.Root value={physiotherapistFilter} onValueChange={setPhysiotherapistFilter}>
//               <Select.Trigger placeholder="All physiotherapists" />
//               <Select.Content>
//                 <Select.Item value="">All physiotherapists</Select.Item>
//                 {physiotherapists.map((physio: any) => (
//                   <Select.Item key={physio.id} value={String(physio.id)}>
//                     {physio.name}
//                   </Select.Item>
//                 ))}
//               </Select.Content>
//             </Select.Root>
//           </Box>
          
//           <Box className="flex items-end">
//             <Button onClick={() => {
//               setDateRange("30");
//               setPhysiotherapistFilter("");
//             }}>
//               Reset Filters
//             </Button>
//           </Box>
//         </Flex>
//       </Card>
      
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <Card className="p-4">
//           <Text size="1" color="gray">Total Appointments</Text>
//           <Heading size="6">{stats.summary.totalAppointments}</Heading>
//           <Text size="2" className="mt-2">
//             From {stats.summary.totalSlots} available slots
//           </Text>
//         </Card>
        
//         <Card className="p-4">
//           <Text size="1" color="gray">Utilization Rate</Text>
//           <Heading size="6">{stats.summary.averageUtilization}%</Heading>
//           <Text size="2" className="mt-2">
//             {stats.summary.totalBooked} booked out of {stats.summary.totalCapacity} capacity
//           </Text>
//         </Card>
        
//         <Card className="p-4">
//           <Text size="1" color="gray">Completion Rate</Text>
//           <Heading size="6">
//             {stats.summary.totalAppointments > 0 
//               ? Math.round((stats.summary.statusTotals.completed / stats.summary.totalAppointments) * 100)
//               : 0}%
//           </Heading>
//           <Text size="2" className="mt-2">
//             {stats.summary.statusTotals.completed} completed appointments
//           </Text>
//         </Card>
        
//         <Card className="p-4">
//           <Text size="1" color="gray">Total Revenue</Text>
//           <Heading size="6">₹{stats.summary.totalRevenue.toLocaleString()}</Heading>
//           <Text size="2" className="mt-2">
//             From {stats.summary.paymentTotals.paid} paid appointments
//           </Text>
//         </Card>
//       </div>
      
//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <Card className="p-4">
//           <Heading size="3" className="mb-4">Appointment Status Breakdown</Heading>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={getStatusChartData()}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={true}
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {getStatusChartData().map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`${value} appointments`, ""]} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
          
//           <Flex gap="3" wrap="wrap" className="mt-2"></Flex>
//             <StatusBadge count={stats.summary.statusTotals.pending} label="Pending" color="blue" />
//             <StatusBadge count={stats.summary.statusTotals.scheduled} label="Scheduled" color="green" />
//             <StatusBadge count={stats.summary.statusTotals.completed} label="Completed" color="teal" />
//             <StatusBadge count={stats.summary.statusTotals.cancelled} label="Cancelled" color="red" />
//             <StatusBadge count={stats.summary.statusTotals.noShow} label="No Show" color="gray" />
//           </Flex>
//         </Card>
        
//         <Card className="p-4"></Card>
//           <Heading size="3" className="mb-4">Payment Status Breakdown</Heading>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={getPaymentChartData()}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={true}
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {getPaymentChartData().map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`${value} appointments`, ""]} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
          
//           <Flex gap="3" wrap="wrap" className="mt-2"></Flex>
//             <StatusBadge count={stats.summary.paymentTotals.paid} label="Paid" color="green" />
//             <StatusBadge count={stats.summary.paymentTotals.unpaid} label="Unpaid" color="amber" />
//             <StatusBadge count={stats.summary.paymentTotals.refunded} label="Refunded" color="red" />
//           </Flex>
//         </Card>
//       </div>
      
//       {/* Detailed Table */}
//       <Card className="p-4">
//         <Heading size="3" className="mb-4">Detailed Slot Statistics</Heading>
//         <Table.Root variant="surface">
//           <Table.Header>
//             <Table.Row>
//               <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
//               <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
//               <Table.ColumnHeaderCell>Physiotherapist</Table.ColumnHeaderCell>
//               <Table.ColumnHeaderCell>Bookings</Table.ColumnHeaderCell>
//               <Table.ColumnHeaderCell>Utilization</Table.ColumnHeaderCell>
//               <Table.ColumnHeaderCell>Total Appointments</Table.ColumnHeaderCell>
//               <Table.ColumnHeaderCell>Revenue</Table.ColumnHeaderCell>
//             </Table.Row>
//           </Table.Header>
          
//           <Table.Body>
//             {stats.slotDetails.map((slot) => (
//               <Table.Row key={slot.id}>
//                 <Table.Cell>
//                   {format(new Date(slot.date), "MMM dd, yyyy")}
//                 </Table.Cell>
//                 <Table.Cell>{slot.timeSlot}</Table.Cell>
//                 <Table.Cell>
//                   <Flex direction="column" gap="1">
//                     <Text>{slot.physiotherapist}</Text>
//                     <Text size="1" color="gray">{slot.specialization}</Text>
//                   </Flex>
//                 </Table.Cell>
//                 <Table.Cell>
//                   {slot.bookedCount} / {slot.capacity}
//                 </Table.Cell>
//                 <Table.Cell>
//                   <Badge 
//                     color={parseInt(slot.utilizationRate) > 80 ? "green" : parseInt(slot.utilizationRate) > 50 ? "yellow" : "red"}
//                   >
//                     {slot.utilizationRate}
//                   </Badge>
//                 </Table.Cell>
//                 <Table.Cell>{slot.totalAppointments}</Table.Cell>
//                 <Table.Cell>₹{slot.revenue.toLocaleString()}</Table.Cell>
//               </Table.Row>
//             ))}
            
//             {stats.slotDetails.length === 0 && (
//               <Table.Row>
//                 <Table.Cell colSpan={7}>
//                   <Text align="center" className="py-4">No slot data available for the selected filters.</Text>
//                 </Table.Cell>
//               </Table.Row>
//             )}
//           </Table.Body>
//         </Table.Root>
//       </Card>
//     </div>
//   );
// }