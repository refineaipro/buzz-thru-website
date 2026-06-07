import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BUSINESS } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS.name} | Book Online`,
    template: `%s | ${BUSINESS.name}`,
  },
  description:
    "Book your car wash online at Buzz Thru. Three convenient locations, fast service, and sparkling results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
