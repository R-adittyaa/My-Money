import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Toaster from "@/components/Toaster";
import SessionProvider from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Money",
  description: "Aplikasi pencatatan keuangan pribadi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My Money",
  },
  icons: {
    // PAKE .JPG KARENA FILENYA JPG
    icon: "/icons/icon-192.jpg", 
    apple: "/icons/icon-192.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <SessionProvider>
            {children}
            <InstallPrompt />
            <ServiceWorkerRegister />
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}