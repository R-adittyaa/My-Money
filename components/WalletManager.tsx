"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AmountInput from "./AmountInput";

type Wallet = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
};

type Props = {
  wallets: Wallet[];
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export default function WalletManager({ wallets, onAdd, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, isEdit: boolean) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      if (isEdit) await onUpdate(fd);
      else await onAdd(fd);
      toast.success(isEdit ? "Dompet diupdate" : "Dompet ditambahkan");
      setMode(null);
      setEditId(null);
    } catch { toast.error("Gagal menyimpan dompet"); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus dompet "${name}"?`)) return;
    const fd = new FormData(); fd.set("id", id);
    try {
      await onDelete(fd);
      toast.info("Dompet dihapus");
    } catch { toast.error("Gagal menghapus"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setMode("add"); setEditId(null); }} className="text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          + Dompet Baru
        </button>
      </div>

      {mode === "add" && (
        <form onSubmit={(e) => handleSubmit(e, false)} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-sm">Tambah Dompet</h3>
          <input name="name" required placeholder="Nama Dompet (Misal: Gopay, BCA)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Saldo Awal (Opsional)</label>
            <AmountInput name="initialBalance" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
            <button type="button" onClick={() => setMode(null)} className="flex-1 text-gray-500 py-2 text-sm">Batal</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wallets.map((w, i) => (
          <motion.div 
            key={w.id} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 text-white shadow-lg overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
            
            {mode === "edit" && editId === w.id ? (
              <form onSubmit={(e) => handleSubmit(e, true)} className="relative space-y-3 z-10">
                <input type="hidden" name="id" value={w.id} />
                <input name="name" defaultValue={w.name} required className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50" />
                <div>
                  <label className="text-[10px] text-white/70 block mb-1">Ubah Saldo Awal</label>
                  <AmountInput name="initialBalance" defaultValue={w.initialBalance} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-white text-black py-1.5 rounded-lg text-xs font-bold">Simpan</button>
                  <button type="button" onClick={() => { setMode(null); setEditId(null); }} className="flex-1 bg-white/20 text-white py-1.5 rounded-lg text-xs">Batal</button>
                </div>
              </form>
            ) : (
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Dompet</p>
                    <h3 className="font-bold text-lg">{w.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => { setMode("edit"); setEditId(w.id); }} className="bg-white/10 hover:bg-white/20 p-1.5 rounded text-xs">✎</button>
                    <button onClick={() => handleDelete(w.id, w.name)} className="bg-white/10 hover:bg-red-500/80 p-1.5 rounded text-xs">✕</button>
                  </div>
                </div>
                
                <p className="text-[10px] text-white/60 mb-0.5">Saldo Saat Ini</p>
                <p className="text-2xl font-bold tabular-nums">
                  Rp {w.currentBalance.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-white/40 mt-2">Saldo Awal: Rp {w.initialBalance.toLocaleString("id-ID")}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {wallets.length === 0 && mode !== "add" && (
        <div className="text-center py-12 border border-dashed rounded-2xl">
          <p className="text-sm text-gray-500">Belum ada dompet. Bikin dompet baru yuk!</p>
        </div>
      )}
    </div>
  );
}