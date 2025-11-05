import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "savedgenesis",
  description: "Minecraft network and tools by savedgenesis.",
  metadataBase: new URL("https://savedgenesis.com"),
  openGraph: {
    title: "savedgenesis",
    description: "Minecraft network and tools by savedgenesis.",
    url: "https://savedgenesis.com",
    siteName: "savedgenesis",
  },
  twitter: {
    card: "summary_large_image",
    title: "savedgenesis",
    description: "Minecraft network and tools by savedgenesis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
