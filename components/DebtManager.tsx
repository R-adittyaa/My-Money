"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";

type Debt = {
  id: string;
  personName: string;
  type: "debt" | "loan";
  amount: number;
  dueDate: string;
  isPaid: boolean;
  notes: string;
  payments?: { id: string; amount: number; date: string; wallet: string }[];
};

type Wallet = { id: string; name: string; initialBalance: number };

type Props = {
  debts: Debt[];
  wallets: Wallet[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onPay: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
};

export default function DebtManager({ debts, wallets, onAdd, onDelete, onPay }: Props) {
  const [activeTab, setActiveTab] = useState<"debt" | "loan">("debt");
  const [showForm, setShowForm] = useState(false);
  
  // State buat bayar cicilan
  const [payId, setPayId] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState("");

  const filteredDebts = debts.filter((d) => d.type === activeTab);
  
  const totalUnpaid = filteredDebts
    .filter(d => !d.isPaid)
    .reduce((sum, d) => {
      const paid = (d.payments || []).reduce((p, curr) => p + curr.amount, 0);
      return sum + (d.amount - paid);
    }, 0);

  async function handleAdd(fd: FormData) {
    try {
      await onAdd(fd);
      toast.success("Berhasil dicatat");
      setShowForm(false);
    } catch { toast.error("Gagal mencatat"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    const fd = new FormData(); fd.set("id", id);
    try {
      await onDelete(fd);
      toast.info("Catatan dihapus");
    } catch { toast.error("Gagal hapus"); }
  }

  async function handlePaySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedWallet) return toast.error("Pilih dompet dulu");
    
    const fd = new FormData(e.currentTarget);
    fd.set("wallet", selectedWallet);

    const res = await onPay(fd);
    if (res?.error) {
      toast.error(res.error, { duration: 4000 });
    } else {
      toast.success("Pembayaran berhasil dicatat!");
      setPayId(null);
      setSelectedWallet("");
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button onClick={() => setActiveTab("debt")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === "debt" ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-gray-500"}`}>Hutang Saya</button>
        <button onClick={() => setActiveTab("loan")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === "loan" ? "bg-white dark:bg-gray-900 shadow-sm text-green-600" : "text-gray-500"}`}>Piutang Saya</button>
      </div>

      <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${activeTab === "debt" ? "from-red-500 to-red-700" : "from-green-500 to-green-700"}`}>
        <p className="text-xs uppercase tracking-widest opacity-80">Sisa Belum Lunas</p>
        <p className="text-3xl font-bold mt-1 tabular-nums">Rp {totalUnpaid.toLocaleString("id-ID")}</p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-80 transition">
          {showForm ? "Batal" : `+ Catat ${activeTab === "debt" ? "Hutang" : "Piutang"}`}
        </button>
      </div>

      {showForm && (
        <form action={handleAdd} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <input type="hidden" name="type" value={activeTab} />
          <input name="personName" required placeholder={activeTab === "debt" ? "Hutang ke siapa?" : "Dipinjam siapa?"} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <AmountInput name="amount" required />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jatuh Tempo (Opsional)</label>
            <input name="dueDate" type="date" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <input name="notes" placeholder="Catatan (opsional)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <button type="submit" className="w-full bg-red-600 text-white font-medium py-2 rounded-lg text-sm">Simpan</button>
        </form>
      )}

      <div className="space-y-4">
        {filteredDebts.map((d) => {
          const totalPaid = (d.payments || []).reduce((sum, p) => sum + p.amount, 0);
          const remaining = d.amount - totalPaid;
          const pct = Math.min(Math.round((totalPaid / d.amount) * 100), 100);

          return (
            <div key={d.id} className={`p-4 rounded-2xl border transition ${d.isPaid ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-70" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    {d.personName}
                    {d.isPaid && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LUNAS</span>}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Total: Rp {d.amount.toLocaleString("id-ID")}</p>
                  {!d.isPaid && <p className="text-sm font-semibold text-red-500 mt-1">Sisa: Rp {remaining.toLocaleString("id-ID")}</p>}
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500 p-1">✕</button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className={`h-full rounded-full ${d.isPaid ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">{pct}% terbayar</p>
              </div>

              {/* Riwayat Cicilan */}
              {(d.payments || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Riwayat Cicilan</p>
                  <ul className="space-y-1">
                    {(d.payments || []).map(p => (
                      <li key={p.id} className="flex justify-between text-xs">
                        <span className="text-gray-500">{formatDate(p.date)} ({p.wallet})</span>
                        <span className="font-medium">Rp {p.amount.toLocaleString("id-ID")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!d.isPaid && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {payId === d.id ? (
                    <form onSubmit={handlePaySubmit} className="space-y-2">
                      <input type="hidden" name="id" value={d.id} />
                      <div className="flex gap-2 items-center">
                        <div className="flex-1"><AmountInput name="amount" required /></div>
                        <select 
                          value={selectedWallet} 
                          onChange={(e) => setSelectedWallet(e.target.value)} 
                          required
                          className="w-24 text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-gray-800"
                        >
                          <option value="">Dompet</option>
                          {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                        </select>
                        <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium">Bayar</button>
                        <button type="button" onClick={() => setPayId(null)} className="text-gray-500 text-xs px-1">✕</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setPayId(d.id)} className="w-full text-xs font-medium border border-gray-300 dark:border-gray-700 hover:border-green-500 hover:text-green-500 py-2 rounded-lg transition">
                      + Bayar Cicilan
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}