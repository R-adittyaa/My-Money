"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      duration={2000}
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #e5e7eb",
          color: "#111827",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "10px 14px",
        },
        className: "dark:!bg-gray-900 dark:!border-gray-800 dark:!text-gray-100",
      }}
      theme="system"
      richColors
      closeButton
      offset={16}
    />
  );
}