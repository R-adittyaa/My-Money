"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ModalPortal from "./ModalPortal";

type Wallet = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSelect: (walletName: string) => void;
  onAdd: (name: string) => Promise<void>;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function WalletModal({ isOpen, onClose, wallets, onSelect, onAdd, onEdit, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await onAdd(newName);
      setNewName("");
      setIsAdding(false);
      toast.success("Dompet ditambahkan");
    } catch { toast.error("Gagal tambah dompet"); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    try {
      await onEdit(editId, editName);
      setEditId(null);
      toast.success("Dompet diupdate");
    } catch { toast.error("Gagal update dompet"); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus dompet "${name}"?`)) return;
    try {
      await onDelete(id);
      toast.info("Dompet dihapus");
    } catch { toast.error("Gagal hapus"); }
  }

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto">
        
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-bold text-lg">Sumber Dana</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full transition">✕</button>
        </div>

        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 shrink-0">
          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 transition">
              + Tambah Dompet Baru
            </button>
          ) : (
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama dompet (BCA, Tunai...)"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition">Simpan</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 text-xs px-2 hover:text-gray-800 dark:hover:text-gray-200">Batal</button>
            </form>
          )}
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {wallets.map((w) => (
            <div key={w.id} className="flex flex-col border-b border-gray-50 dark:border-gray-800/50 last:border-0">
              {editId === w.id ? (
                <form onSubmit={handleEdit} className="p-2 space-y-2 bg-red-50 dark:bg-red-950/20 rounded-xl flex gap-2">
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-500" />
                  <button type="submit" className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Simpan</button>
                  <button type="button" onClick={() => setEditId(null)} className="text-gray-500 text-xs px-1">Batal</button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                  <button onClick={() => { onSelect(w.name); onClose(); }} className="flex-1 flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs uppercase shrink-0">
                      {w.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{w.name}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(w.id); setEditName(w.name); }} className="text-gray-400 hover:text-blue-500 p-1.5 text-xs" title="Edit">✎</button>
                    <button onClick={() => handleDelete(w.id, w.name)} className="text-gray-400 hover:text-red-500 p-1.5 text-xs" title="Hapus">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );

  return <ModalPortal>{content}</ModalPortal>;
}