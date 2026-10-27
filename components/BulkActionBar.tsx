"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function BulkActionBar({ onBulkDelete }: { onBulkDelete: (ids: string[]) => Promise<void> }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dengerin sinyal dari TransactionDetail
    function handleSelect(e: any) {
      setSelectedIds((prev) => 
        prev.includes(e.detail) ? prev.filter(i => i !== e.detail) : [...prev, e.detail]
      );
    }

    function handleStartMode() {
      setIsSelecting(true);
    }

    function handleReset() {
      setIsSelecting(false);
      setSelectedIds([]);
    }

    window.addEventListener("tx-select", handleSelect);
    window.addEventListener("tx-start-select-mode", handleStartMode);
    window.addEventListener("tx-reset-select", handleReset);

    return () => {
      window.removeEventListener("tx-select", handleSelect);
      window.removeEventListener("tx-start-select-mode", handleStartMode);
      window.removeEventListener("tx-reset-select", handleReset);
    };
  }, []);

  async function handleDelete() {
    if (!confirm(`Hapus ${selectedIds.length} transaksi sekaligus?`)) return;
    setLoading(true);
    try {
      await onBulkDelete(selectedIds);
      toast.success(`${selectedIds.length} transaksi dihapus`);
      // Kabarin ke semua transaksi buat reset mode pilih
      window.dispatchEvent(new CustomEvent("tx-reset-select"));
    } catch {
      toast.error("Gagal hapus");
    } finally {
      setLoading(false);
    }
  }

  if (!isSelecting) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
      <p className="text-sm font-medium">{selectedIds.length} dipilih</p>
      <div className="w-px h-4 bg-gray-700"></div>
      <button 
        onClick={handleDelete}
        disabled={loading || selectedIds.length === 0}
        className="text-red-400 text-sm font-semibold hover:text-red-300 disabled:opacity-50"
      >
        {loading ? "Hapus..." : "Hapus"}
      </button>
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent("tx-reset-select"))} 
        className="text-gray-400 hover:text-white text-sm ml-2"
      >
        Batal
      </button>
    </div>
  );
}