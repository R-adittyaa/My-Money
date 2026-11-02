"use client";

import { useState } from "react";
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
  activeMonth: string;
  onAdd: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onUpdate: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
};

export default function WalletManager({ wallets, activeMonth, onAdd, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, isEdit: boolean) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const res = isEdit ? await onUpdate(fd) : await onAdd(fd);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(isEdit ? "Dompet diupdate" : "Dompet ditambahkan");
      setMode(null);
      setEditId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus dompet "${name}"?`)) return;
    const fd = new FormData(); fd.set("id", id);
    const res = await onDelete(fd);
    if (res?.error) toast.error(res.error);
    else toast.info("Dompet dihapus");
  }

  const editWallet = wallets.find(w => w.id === editId);
  const monthLabel = new Date(activeMonth + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setMode("add"); setEditId(null); }} className="text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          + Dompet Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wallets.map((w) => (
          <div 
            key={w.id} 
            className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 text-white shadow-lg overflow-hidden group border border-gray-800"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
            
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
              
              <p className="text-[10px] text-white/60 mb-0.5">Saldo s/d {monthLabel}</p>
              <p className="text-2xl font-bold tabular-nums">
                Rp {w.currentBalance.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-white/40 mt-2">Saldo Awal: Rp {w.initialBalance.toLocaleString("id-ID")}</p>
            </div>
          </div>
        ))}
      </div>

      {wallets.length === 0 && mode !== "add" && (
        <div className="text-center py-12 border border-dashed rounded-2xl">
          <p className="text-sm text-gray-500">Belum ada dompet. Bikin dompet baru yuk!</p>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT DOMPET */}
      {mode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMode(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4">{mode === "add" ? "Tambah Dompet" : "Edit Dompet"}</h3>
            
            <form onSubmit={(e) => handleSubmit(e, mode === "edit")} className="space-y-4">
              {mode === "edit" && <input type="hidden" name="id" value={editId!} />}
              
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Nama Dompet</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={mode === "edit" ? editWallet?.name : ""}
                  placeholder="Misal: BCA, Gopay, Tunai" 
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {mode === "add" ? "Saldo Awal (Opsional)" : "Ubah Saldo Awal"}
                </label>
                <AmountInput name="initialBalance" defaultValue={mode === "edit" ? editWallet?.initialBalance : 0} />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setMode(null)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium">Batal</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}