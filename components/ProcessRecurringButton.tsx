"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  action: () => Promise<number>;
};

export default function ProcessRecurringButton({ action }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const count = await action();
      if (count > 0) {
        toast.success(`${count} transaksi berulang dibuat`, {
          duration: 2500,
        });
      } else {
        toast.info("Belum ada yang jatuh tempo", { duration: 2000 });
      }
    } catch (err) {
      toast.error("Gagal generate transaksi berulang");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full text-xs font-medium bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-red-400 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition disabled:opacity-50"
    >
      {loading ? "Memproses..." : "⚡ Generate Sekarang"}
    </button>
  );
}