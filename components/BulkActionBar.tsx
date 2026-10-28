"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkEdit: (ids: string[], updates: { category?: string; wallet?: string; date?: string }) => Promise<void>;
};

export default function BulkActionBar({ onBulkDelete, onBulkEdit }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<"category" | "wallet" | "date" | "time">("category");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    function handleSelect(e: any) {
      setSelectedIds((prev) => 
        prev.includes(e.detail) ? prev.filter(i => i !== e.detail) : [...prev, e.detail]
      );
    }
    function handleStartMode() { setIsSelecting(true); }
    function handleReset() { setIsSelecting(false); setSelectedIds([]); }

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
      window.dispatchEvent(new CustomEvent("tx-reset-select"));
    } catch {
      toast.error("Gagal hapus");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editValue) return;
    setLoading(true);
    try {
      let updates: any = {};
      
      if (editType === "category") updates = { category: editValue };
      else if (editType === "wallet") updates = { wallet: editValue };
      else if (editType === "date") {
        // Ambil jam dari transaksi pertama biar gak ilang (fallback)
        updates = { date: `${editValue}T12:00:00.000Z` }; // Default ke jam 12 siang
      } else if (editType === "time") {
        // Ambil tanggal hari ini sebagai default
        const today = new Date().toISOString().slice(0, 10);
        updates = { date: `${today}T${editValue}:00.000Z` };
      }

      await onBulkEdit(selectedIds, updates);
      toast.success(`${selectedIds.length} transaksi diupdate`);
      setShowEditModal(false);
      setEditValue("");
      window.dispatchEvent(new CustomEvent("tx-reset-select"));
    } catch {
      toast.error("Gagal edit");
    } finally {
      setLoading(false);
    }
  }

  if (!isSelecting) return null;

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
        <p className="text-xs font-medium whitespace-nowrap">{selectedIds.length} dipilih</p>
        <div className="w-px h-4 bg-gray-700"></div>
        
        <button 
          onClick={() => setShowEditModal(true)}
          disabled={loading || selectedIds.length === 0}
          className="text-blue-400 text-xs font-semibold hover:text-blue-300 disabled:opacity-50"
        >
          Edit
        </button>
        <button 
          onClick={handleDelete}
          disabled={loading || selectedIds.length === 0}
          className="text-red-400 text-xs font-semibold hover:text-red-300 disabled:opacity-50"
        >
          Hapus
        </button>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("tx-reset-select"))} 
          className="text-gray-400 hover:text-white text-xs ml-1"
        >
          Batal
        </button>
      </div>

      {/* MODAL EDIT MASSAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-1">Edit Massal</h3>
            <p className="text-xs text-gray-500 mb-4">Ubah data untuk {selectedIds.length} transaksi terpilih.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Mau edit apa?</label>
                <select
                  value={editType}
                  onChange={(e) => { setEditType(e.target.value as any); setEditValue(""); }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="category">Ubah Kategori</option>
                  <option value="wallet">Ubah Dompet</option>
                  <option value="date">Ubah Tanggal</option>
                  <option value="time">Ubah Jam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {editType === "category" && "Nama Kategori Baru"}
                  {editType === "wallet" && "Nama Dompet Baru"}
                  {editType === "date" && "Tanggal Baru"}
                  {editType === "time" && "Jam Baru"}
                </label>
                <input 
                  autoFocus
                  type={editType === "date" ? "date" : editType === "time" ? "time" : "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={editType === "category" ? "Misal: Makan" : editType === "wallet" ? "Misal: BCA" : ""}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium">Batal</button>
                <button type="submit" disabled={loading || !editValue} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}