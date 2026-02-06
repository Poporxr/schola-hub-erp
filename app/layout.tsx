import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Schola | Hub",
  description: "Schola Hub is a comprehensive school ERP system designed to manage students, teachers, attendance, results, fees, and academic operations efficiently in primary and secondary schools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-slate-50 text-slate-800 h-screen overflow-hidden flex pb-40`}
      >
        {children}
      </body>
    </html>
  );
}
