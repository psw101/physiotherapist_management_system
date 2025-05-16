"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { Flex, Box, Container } from "@radix-ui/themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      // Check if user is admin, if not redirect to home
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
      } else {
        setIsLoading(false);
      }
    } else if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    }
  }, [status, session, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Flex>
      <AdminNavbar />
      <Box className="flex-1 p-6">
        <Container size="4">
          {children}
        </Container>
      </Box>
    </Flex>
  );
}