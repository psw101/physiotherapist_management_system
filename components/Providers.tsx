"use client";

import { CartProvider } from "@/context/CartContext";
import { SessionProvider } from "next-auth/react";
import { Theme } from "@radix-ui/themes";
import AuthProvider from "@/app/auth/Provider";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <Theme>
          <CartProvider>{children}</CartProvider>
        </Theme>
      </SessionProvider>
    </AuthProvider>
  );
}