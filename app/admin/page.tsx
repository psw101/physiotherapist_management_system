"use client";

import { useState, useEffect } from "react";
import { Heading, Text, Flex, Grid, Card, Box } from "@radix-ui/themes";
import { 
  UserGroupIcon, CalendarIcon, ShoppingCartIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";

interface DashboardStats {
  usersCount: number;
  patientsCount: number;
  appointmentsCount: number;
  productsCount: number;
  revenueTotal: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/dashboard");
        // Axios automatically extracts the response.data
        setStats(response.data.data || {});
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to fetch dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <Heading size="3" className="mb-2 text-red-600">Error</Heading>
        <Text color="red">{error}</Text>
        <Box className="mt-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </Box>
      </Card>
    );
  }

  // Enhanced StatCard component with hover effects and better color handling
  const StatCard = ({ 
    title, value, icon: Icon, color = "indigo" 
  }: { 
    title: string; 
    value: number | string;
    icon: React.ComponentType<{ className: string }>;
    color?: string;
  }) => {
    // Map of colors to their actual Tailwind classes to avoid string interpolation
    const colorMap: Record<string, { bg: string, text: string, hoverBg: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
      amber: { bg: "bg-amber-100", text: "text-amber-600", hoverBg: "hover:bg-amber-50" },
      violet: { bg: "bg-violet-100", text: "text-violet-600", hoverBg: "hover:bg-violet-50" },
      green: { bg: "bg-green-100", text: "text-green-600", hoverBg: "hover:bg-green-50" }
    };

    const { bg, text, hoverBg } = colorMap[color] || colorMap.indigo;

    return (
      <Card className={`p-6 transition-all duration-200 ${hoverBg} cursor-default`}>
        <Flex gap="3" align="center">
          <Box className={`p-3 rounded-full ${bg}`}>
            <Icon className={`h-6 w-6 ${text}`} />
          </Box>
          <Box>
            <Text size="2" color="gray">{title}</Text>
            <Text size="6" weight="bold">{value}</Text>
          </Box>
        </Flex>
      </Card>
    );
  };

  return (
    <Box className="py-6">
      <Heading size="8" className="mb-6">Admin Dashboard</Heading>
      
      <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4" className="mb-8">
        <StatCard 
          title="Users" 
          value={stats.usersCount || 0}
          icon={UserGroupIcon}
          color="blue"
        />
        {/* <StatCard 
          title="Patients" 
          value={stats.patientsCount || 0}
          icon={UserGroupIcon}
          color="blue"
        /> */}
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
        {/* <Card className="p-6">
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
        </Card> */}
        
        <Card className="p-6">
          <Heading size="3" className="mb-4">System Summary</Heading>
          <Box className="space-y-2">
            <Flex justify="between">
              <Text>Last Updated</Text>
              <Text weight="bold">{new Date().toLocaleString()}</Text>
            </Flex>
            <Flex justify="between">
              <Text>Total Items</Text>
              <Text weight="bold">{stats.productsCount || 0}</Text>
            </Flex>
            <Flex justify="between">
              <Text>System Status</Text>
              <Text weight="bold" className="text-green-600">Online</Text>
            </Flex>
          </Box>
        </Card>
      </Grid>
    </Box>
  );
}