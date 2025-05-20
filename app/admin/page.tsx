"use client";

import { useState } from "react";
import { Heading, Text, Flex, Grid, Card, Box } from "@radix-ui/themes";
import { 
  UserGroupIcon, CalendarIcon, ShoppingCartIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";

interface DashboardStats {
  usersCount: number;
  patientsCount: number;
  physiotherapistsCount: number;
  appointmentsCount: number;
  productsCount: number;
  revenueTotal: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export default function AdminDashboard() {
  // Use mock data instead of fetching from API
  const [stats, setStats] = useState<Partial<DashboardStats>>({
    usersCount: 125,
    patientsCount: 85,
    physiotherapistsCount: 12,
    appointmentsCount: 230,
    productsCount: 45,
    revenueTotal: 25000,
    pendingAppointments: 18,
    completedAppointments: 212
  });
  
  const [loading, setLoading] = useState(false); // No loading since no API call
  const [error, setError] = useState("");

  // Removed useEffect with API call

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <Text color="red">{error}</Text>
      </Card>
    );
  }

  const StatCard = ({ 
    title, value, icon: Icon, color = "indigo" 
  }: { 
    title: string; 
    value: number | string;
    icon: React.ComponentType<{ className: string }>;
    color?: string;
  }) => (
    <Card className="p-6">
      <Flex gap="3" align="center">
        <Box 
          className={`p-3 rounded-full bg-${color}-100`}
        >
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </Box>
        <Box>
          <Text size="2" color="gray">{title}</Text>
          <Text size="6" weight="bold">{value}</Text>
        </Box>
      </Flex>
    </Card>
  );

  return (
    <Box className="py-6">
      <Heading size="8" className="mb-6">Admin Dashboard</Heading>
      
      <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4" className="mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.usersCount || 0}
          icon={UserGroupIcon}
        />
        <StatCard 
          title="Physiotherapists" 
          value={stats.physiotherapistsCount || 0}
          icon={UserGroupIcon}
          color="emerald"
        />
        <StatCard 
          title="Patients" 
          value={stats.patientsCount || 0}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard 
          title="Products" 
          value={stats.productsCount || 0}
          icon={ShoppingCartIcon}
          color="amber"
        />
      </Grid>

      <Grid columns={{ initial: "1", md: "2" }} gap="4" className="mb-8">
        <StatCard 
          title="Total Appointments" 
          value={stats.appointmentsCount || 0} 
          icon={CalendarIcon}
          color="violet"
        />
        <StatCard 
          title="Total Revenue" 
          value={`Rs. ${stats.revenueTotal?.toLocaleString() || 0}`}
          icon={CurrencyDollarIcon}
          color="green"
        />
      </Grid>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        <Card className="p-6">
          <Heading size="3" className="mb-4">Appointment Status</Heading>
          <Flex gap="4">
            <Box className="flex-1 p-4 bg-amber-100 rounded-md">
              <Text weight="bold" size="5" className="text-amber-700">
                {stats.pendingAppointments || 0}
              </Text>
              <Text size="2" className="text-amber-700">Pending</Text>
            </Box>
            <Box className="flex-1 p-4 bg-green-100 rounded-md">
              <Text weight="bold" size="5" className="text-green-700">
                {stats.completedAppointments || 0}
              </Text>
              <Text size="2" className="text-green-700">Completed</Text>
            </Box>
          </Flex>
        </Card>
        
        <Card className="p-6">
          <Heading size="3" className="mb-4">Latest Activity</Heading>
          <Text color="gray">Recent activity will be displayed here</Text>
        </Card>
      </Grid>
    </Box>
  );
}