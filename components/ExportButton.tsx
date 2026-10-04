"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  onExport: (month?: string) => Promise<{ csv: string; filename: string }>;
  availableMonths: string[];
  currentMonth: string;
};

export default function ExportButton({
  onExport,
  availableMonths,
  currentMonth,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown kalau klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleExport(month?: string) {
    setLoading(true);
    setOpen(false);
    try {
      const { csv, filename } = await onExport(month);

      // Trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV berhasil di-download", {
        description: filename,
        duration: 2500,
      });
    } catch (err) {
      toast.error("Gagal export CSV", {
        description: "Coba lagi ya",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-red-400 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
      >
        <span>📥</span>
        <span className="hidden sm:inline">
          {loading ? "Menyiapkan..." : "Export"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden z-30">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Export CSV
            </p>
          </div>

          <button
            onClick={() => handleExport(currentMonth)}
            className="w-full text-left px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2"
          >
            <span>📅</span>
            <span className="flex-1">
              Bulan ini
              <span className="block text-[10px] text-gray-400 dark:text-gray-500">
                {new Date(currentMonth + "-01").toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>
          </button>

          <button
            onClick={() => handleExport()}
            className="w-full text-left px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
          >
            <span>📦</span>
            <span className="flex-1">
              Semua data
              <span className="block text-[10px] text-gray-400 dark:text-gray-500">
                Backup lengkap
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}