"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    toast.info("Logout...", { duration: 1500 });
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
    >
      <span>🚪</span>
      <span className="hidden sm:inline">
        {loading ? "Keluar..." : "Keluar"}
      </span>
    </button>
  );
}