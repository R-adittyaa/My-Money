"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Ini state management sederhana pakai Custom Event biar gak perlu Redux
// Karena kita udah kelewat rumit buat passing props berkali-kali

export default function BulkActionBar({ onBulkDelete }: { onBulkDelete: (ids: string[]) => Promise<void> }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dengerin event dari TransactionDetail
  useEffect(() => {
    function handleSelect(id: string) {
      setIsSelecting(true);
      setSelectedIds((prev) => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }

    function handleStartSelecting(id: string) {
      setIsSelecting(true);
      if (!selectedIds.includes(id)) {
        setSelectedIds([id]);
      }
    }

    window.addEventListener("tx-select", (e: any) => handleSelect(e.detail));
    window.addEventListener("tx-start-select", (e: any) => handleStartSelecting(e.detail));

    return () => {
      window.removeEventListener("tx-select", (e: any) => handleSelect(e.detail));
      window.removeEventListener("tx-start-select", (e: any) => handleStartSelecting(e.detail));
    };
  }, [selectedIds]);

  // Pas pindah halaman, cancel milih
  const router = useRouter();
  useEffect(() => {
    setIsSelecting(false);
    setSelectedIds([]);
  }, [router]);

  async function handleDelete() {
    if (!confirm(`Hapus ${selectedIds.length} transaksi sekaligus?`)) return;
    setLoading(true);
    try {
      await onBulkDelete(selectedIds);
      toast.success(`${selectedIds.length} transaksi dihapus`);
      setIsSelecting(false);
      setSelectedIds([]);
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
        onClick={() => { setIsSelecting(false); setSelectedIds([]); }} 
        className="text-gray-400 hover:text-white text-sm ml-2"
      >
        Batal
      </button>
    </div>
  );
}