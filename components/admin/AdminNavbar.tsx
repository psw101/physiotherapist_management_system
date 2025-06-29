"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Box, Flex, Text, Button, Avatar,
  DropdownMenu, Separator
} from "@radix-ui/themes";
import {
  HomeIcon, UserIcon, CalendarIcon, ShoppingCartIcon,
  UserGroupIcon, ClipboardDocumentListIcon, CogIcon, ArrowLeftOnRectangleIcon,
  Bars3Icon, XMarkIcon, ChartPieIcon
} from "@heroicons/react/24/outline";

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    // { name: "Users", href: "/admin/users", icon: UserIcon },
    // { name: "Patients", href: "/admin/patients", icon: UserGroupIcon },
    { name: "Appointments", href: "/admin/appointments/slots", icon: CalendarIcon },
    { name: "Products", href: "/admin/products", icon: ShoppingCartIcon },
    { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
    { name: "Reports", href: "/admin/reports", icon: ChartPieIcon },
  ];

  const isActive = (path: string) => {
    // Special case for dashboard - only exact match
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <Box
        className={`
          fixed left-0 top-0 h-full bg-indigo-900 text-white w-64
          transform transition-transform duration-300 ease-in-out z-30
          md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Flex direction="column" className="h-full">
          <Box className="p-4">
            <Flex align="center" gap="3">
              <Avatar
                src="/assets/logo.png"
                fallback="P"
                size="3"
                radius="full"
              />
              <Text size="5" weight="bold">
                Admin Panel
              </Text>
            </Flex>
          </Box>

          <Separator size="4" color="indigo" />

          <Box className="py-4 flex-1 overflow-y-auto">
            <Flex direction="column" gap="1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Flex
                      align="center"
                      gap="3"
                      className={`px-4 py-3 mx-2 rounded-md ${
                        isActive(item.href)
                          ? "bg-indigo-700"
                          : "hover:bg-indigo-800"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <Text>{item.name}</Text>
                    </Flex>
                  </Link>
                );
              })}
            </Flex>
          </Box>

          <Box className="p-4">
            <Button
              variant="soft"
              color="red"
              className="w-full"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}