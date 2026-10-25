"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      duration={2500}
      toastOptions={{
        style: {
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,0,0,0.05)",
          color: "#111827",
          borderRadius: "16px",
          fontSize: "13px",
          padding: "12px 16px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        className: "dark:!bg-gray-900/95 dark:!border-gray-800 dark:!text-gray-100 dark:!shadow-black/50",
      }}
      theme="system"
      richColors
      closeButton={false} // Hilangin tombol X karena cepet ilangnya
    />
  );
}