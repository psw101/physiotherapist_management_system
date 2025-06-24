import "@radix-ui/themes/styles.css";
import "./theme.config.css";
import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Theme } from "@radix-ui/themes";
import AuthProvider from "./auth/Provider";
import NavbarWrapper from "../components/NavbarWrapper";

// Load fonts from local files
const geistSans = localFont({
  variable: "--font-geist-sans",
  src: [
    {
      path: "../public/fonts/geist/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/geist/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/geist/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [
    {
      path: "../public/fonts/geist-mono/GeistMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/geist-mono/GeistMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/geist-mono/GeistMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  src: [
    {
      path: "../public/fonts/inter/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Physiotherapist Management System",
  description: "A complete management system for physiotherapy clinics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>        <AuthProvider>
          <Theme>
            <NavbarWrapper />
            {/* Add margin-top to prevent navbar overlap - navbar is 53px + padding */}
            <main className="p-5 mt-16">
              {children}
            </main>
          </Theme>
        </AuthProvider>
      </body>
    </html>
  );
}
