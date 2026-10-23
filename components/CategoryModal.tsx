"use client";

import { useState } from "react";
import { toast } from "sonner";

type Category = { id: string; name: string; type: "income" | "expense" | "both" };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelect: (categoryName: string) => void;
  onAdd: (name: string, type: "income" | "expense") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function CategoryModal({ isOpen, onClose, categories, onSelect, onAdd, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  if (!isOpen) return null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await onAdd(newName, newType);
      setNewName("");
      setIsAdding(false);
      toast.success("Kategori ditambahkan");
    } catch { toast.error("Gagal tambah kategori"); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    try {
      await onDelete(id);
      toast.info("Kategori dihapus");
    } catch { toast.error("Gagal hapus"); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Box Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 sm:hidden"></div>
        
        {/* Header & Form Tambah (STICKY DI ATAS) */}
        <div className="p-5 pb-3 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Pilih Kategori</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
          </div>

          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-500 hover:border-red-400 hover:text-red-500 transition">
              + Tambah Kategori Baru
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-2">
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama kategori..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "income" | "expense")}
                  className="w-28 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-xs"
                >
                  <option value="expense">Keluar</option>
                  <option value="income">Masuk</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-medium">Simpan Kategori</button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Batal</button>
              </div>
            </form>
          )}
        </div>

        {/* List Kategori (BISA DI-SCROLL) */}
        <div className="overflow-y-auto px-3 pb-5 space-y-1">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
              <button
                onClick={() => { onSelect(c.name); onClose(); }}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                  {c.name.substring(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{c.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{c.type === "both" ? "Masuk & Keluar" : c.type}</p>
                </div>
              </button>
              <button
                onClick={() => handleDelete(c.id, c.name)}
                className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hapus"
              >
                ✕
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">Belum ada kategori.</p>
          )}
        </div>
      </div>
    </div>
  );
}