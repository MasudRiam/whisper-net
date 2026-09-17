import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ProviderAuth from "@/context/ProviderAuth";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider"



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhisperNet — Anonymous Messaging",
    template: "%s | WhisperNet",
  },
  description:
    "WhisperNet lets you receive honest anonymous messages. Create your profile link, share it, and read what people really think.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "WhisperNet — Anonymous Messaging",
    description: "Get honest anonymous messages from your friends.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhisperNet — Anonymous Messaging",
    description: "Get honest anonymous messages from your friends.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProviderAuth>
            <Navbar />
            {children}
            <Toaster />
          </ProviderAuth>
        </ThemeProvider>
      </body>
    </html>
  );
} 
