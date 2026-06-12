import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CraveStop — Growth Kitchen",
  description: "AI-powered restaurant marketing campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#09090b] text-zinc-50 antialiased flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
