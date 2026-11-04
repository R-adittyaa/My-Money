"use client";

import { useState } from "react";
import { toast } from "sonner";

type Category = { id: string; name: string; type: "income" | "expense" | "both" };
type Wallet = { id: string; name: string; initialBalance: number };

type Props = {
  categories: Category[];
  wallets: Wallet[];
  onAddCategory: (name: string, type: "income" | "expense") => Promise<void>;
  onEditCategory: (id: string, name: string, type: "income" | "expense") => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddWallet: (name: string) => Promise<void>;
  onEditWallet: (id: string, name: string) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
};

export default function MasterDataManager({
  categories, wallets,
  onAddCategory, onEditCategory, onDeleteCategory,
  onAddWallet, onEditWallet, onDeleteWallet
}: Props) {
  const [activeTab, setActiveTab] = useState<"category" | "wallet">("category");
  
  // State Form Kategori
  const [catMode, setCatMode] = useState<"add-expense" | "add-income" | "edit" | null>(null);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"income" | "expense">("expense");

  // State Form Dompet
  const [walletMode, setWalletMode] = useState<"add" | "edit" | null>(null);
  const [editWalletId, setEditWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState("");

  // Handlers Kategori
  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (catMode === "edit" && editCatId) {
        await onEditCategory(editCatId, catName, catType);
        toast.success("Kategori diupdate");
      } else {
        await onAddCategory(catName, catType);
        toast.success("Kategori ditambahkan");
      }
      setCatMode(null);
      setCatName("");
    } catch { toast.error("Gagal menyimpan kategori"); }
  }

  async function handleCatDelete(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await onDeleteCategory(id);
      toast.info("Kategori dihapus");
    } catch { toast.error("Gagal hapus kategori"); }
  }

  // Handlers Dompet
  async function handleWalletSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (walletMode === "edit" && editWalletId) {
        await onEditWallet(editWalletId, walletName);
        toast.success("Dompet diupdate");
      } else {
        await onAddWallet(walletName);
        toast.success("Dompet ditambahkan");
      }
      setWalletMode(null);
      setWalletName("");
    } catch { toast.error("Gagal menyimpan dompet"); }
  }

  async function handleWalletDelete(id: string) {
    if (!confirm("Hapus dompet ini? Transaksi lama tetep aman, tapi gak bisa dipake lagi.")) return;
    try {
      await onDeleteWallet(id);
      toast.info("Dompet dihapus");
    } catch { toast.error("Gagal hapus dompet"); }
  }

  const expenseCats = categories.filter(c => c.type === "expense");
  const incomeCats = categories.filter(c => c.type === "income");

  return (
    <div className="space-y-4">
      {/* TABS */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("category")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === "category" ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-gray-500"}`}
        >
          Kategori
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === "wallet" ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-gray-500"}`}
        >
          Dompet
        </button>
      </div>

      {/* KONTEN KATEGORI */}
      {activeTab === "category" && (
        <div className="space-y-6">
          {catMode ? (
            <form onSubmit={handleCatSubmit} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <h3 className="font-bold text-sm">
                {catMode === "edit" ? "Edit Kategori" : catMode === "add-expense" ? "Tambah Kategori Pengeluaran" : "Tambah Kategori Pemasukan"}
              </h3>
              <input
                autoFocus
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
                placeholder="Nama Kategori"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
                <button type="button" onClick={() => { setCatMode(null); setCatName(""); }} className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-sm">Batal</button>
              </div>
            </form>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setCatMode("add-expense"); setCatType("expense"); setCatName(""); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-medium">+ Kategori Pengeluaran</button>
              <button onClick={() => { setCatMode("add-income"); setCatType("income"); setCatName(""); }} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-medium">+ Kategori Pemasukan</button>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pengeluaran</h4>
            <ul className="space-y-1">
              {expenseCats.map(c => (
                <li key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span className="text-sm font-medium">{c.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setCatMode("edit"); setEditCatId(c.id); setCatName(c.name); setCatType("expense"); }} className="text-gray-400 hover:text-blue-500 text-xs p-1">✎</button>
                    <button onClick={() => handleCatDelete(c.id)} className="text-gray-400 hover:text-red-500 text-xs p-1">✕</button>
                  </div>
                </li>
              ))}
              {expenseCats.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada kategori.</p>}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pemasukan</h4>
            <ul className="space-y-1">
              {incomeCats.map(c => (
                <li key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span className="text-sm font-medium">{c.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setCatMode("edit"); setEditCatId(c.id); setCatName(c.name); setCatType("income"); }} className="text-gray-400 hover:text-blue-500 text-xs p-1">✎</button>
                    <button onClick={() => handleCatDelete(c.id)} className="text-gray-400 hover:text-red-500 text-xs p-1">✕</button>
                  </div>
                </li>
              ))}
              {incomeCats.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada kategori.</p>}
            </ul>
          </div>
        </div>
      )}

      {/* KONTEN DOMPET */}
      {activeTab === "wallet" && (
        <div className="space-y-4">
          {walletMode ? (
            <form onSubmit={handleWalletSubmit} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <h3 className="font-bold text-sm">{walletMode === "edit" ? "Edit Dompet" : "Tambah Dompet"}</h3>
              <input
                autoFocus
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                required
                placeholder="Nama Dompet"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
                <button type="button" onClick={() => { setWalletMode(null); setWalletName(""); }} className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-sm">Batal</button>
              </div>
            </form>
          ) : (
            <button onClick={() => { setWalletMode("add"); setWalletName(""); }} className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-medium">+ Dompet Baru</button>
          )}

          <ul className="space-y-1">
            {wallets.map(w => (
              <li key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium">{w.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setWalletMode("edit"); setEditWalletId(w.id); setWalletName(w.name); }} className="text-gray-400 hover:text-blue-500 text-xs p-1">✎</button>
                  <button onClick={() => handleWalletDelete(w.id)} className="text-gray-400 hover:text-red-500 text-xs p-1">✕</button>
                </div>
              </li>
            ))}
            {wallets.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada dompet.</p>}
          </ul>
        </div>
      )}
    </div>
  );
}