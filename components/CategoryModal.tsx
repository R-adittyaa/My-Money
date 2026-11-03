"use client";

import { useState } from "react";
import { toast } from "sonner";
import ModalPortal from "./ModalPortal";

type Category = { id: string; name: string; type: "income" | "expense" | "both" };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeType: "income" | "expense"; // Prop dari TransactionForm
  onSelect: (categoryName: string) => void;
  onAdd: (name: string, type: "income" | "expense") => Promise<void>;
  onEdit: (id: string, name: string, type: "income" | "expense") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function CategoryModal({ isOpen, onClose, categories, activeType, onSelect, onAdd, onEdit, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  // FILTER KETAT: Cuma nampilin yang tipenya PERSIS sama
  const filteredCategories = categories.filter(c => c.type === activeType);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await onAdd(newName, activeType); // Otomatis ngikutin tipe yang aktif
      setNewName("");
      setIsAdding(false);
      toast.success("Kategori ditambahkan");
    } catch { toast.error("Gagal tambah kategori"); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    try {
      await onEdit(editId, editName, activeType); // Tipe gak usah diubah-ubah
      setEditId(null);
      toast.success("Kategori diupdate");
    } catch { toast.error("Gagal update kategori"); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    try {
      await onDelete(id);
      toast.info("Kategori dihapus");
    } catch { toast.error("Gagal hapus"); }
  }

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto">
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-bold text-lg">
            Kategori {activeType === "income" ? "Pemasukan" : "Pengeluaran"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 shrink-0">
          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 transition">
              + Tambah Kategori Baru
            </button>
          ) : (
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={`Nama kategori ${activeType === "income" ? "pemasukan" : "pengeluaran"}...`}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition">Simpan</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 text-xs px-2 hover:text-gray-800 dark:hover:text-gray-200">Batal</button>
            </form>
          )}
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {filteredCategories.map((c) => (
            <div key={c.id} className="flex flex-col border-b border-gray-50 dark:border-gray-800/50 last:border-0">
              {editId === c.id ? (
                <form onSubmit={handleEdit} className="p-2 space-y-2 bg-red-50 dark:bg-red-950/20 rounded-xl">
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-500" />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Simpan</button>
                    <button type="button" onClick={() => setEditId(null)} className="text-gray-500 text-xs px-1">Batal</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                  <button onClick={() => { onSelect(c.name); onClose(); }} className="flex-1 flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs uppercase shrink-0">
                      {c.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(c.id); setEditName(c.name); }} className="text-gray-400 hover:text-blue-500 p-1.5 text-xs" title="Edit">✎</button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-gray-400 hover:text-red-500 p-1.5 text-xs" title="Hapus">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* EMPTY STATE KALAU KOSONG */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-1">
                Belum ada kategori {activeType === "income" ? "pemasukan" : "pengeluaran"}.
              </p>
              <p className="text-xs text-gray-400">
                Klik tombol di atas buat nambahin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return <ModalPortal>{content}</ModalPortal>;
}