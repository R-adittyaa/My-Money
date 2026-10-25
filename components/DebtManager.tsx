"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";
import WalletModal from "./WalletModal";

type Debt = {
  id: string;
  personName: string;
  type: "debt" | "loan";
  amount: number;
  dueDate: string;
  isPaid: boolean;
  notes: string;
};

type Wallet = { id: string; name: string; initialBalance: number };

type Props = {
  debts: Debt[];
  wallets: Wallet[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onSettle: (formData: FormData) => Promise<void>;
};

export default function DebtManager({ debts, wallets, onAdd, onDelete, onSettle }: Props) {
  const [activeTab, setActiveTab] = useState<"debt" | "loan">("debt");
  const [showForm, setShowForm] = useState(false);
  const [settleId, setSettleId] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const filteredDebts = debts.filter((d) => d.type === activeTab);
  
  // Total belum lunas
  const totalUnpaid = filteredDebts.filter(d => !d.isPaid).reduce((sum, d) => sum + d.amount, 0);

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

  async function handleSettle(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWallet) return toast.error("Pilih dompet dulu");
    
    const fd = new FormData();
    fd.set("id", settleId!);
    fd.set("wallet", selectedWallet);

    try {
      await onSettle(fd);
      toast.success("Berhasil dilunasi! Cek halaman Transaksi.");
      setSettleId(null);
      setSelectedWallet("");
    } catch (err: any) {
      toast.error(err.message || "Gagal melunasi");
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("debt")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === "debt" ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-gray-500"}`}
        >
          Hutang Saya
        </button>
        <button
          onClick={() => setActiveTab("loan")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === "loan" ? "bg-white dark:bg-gray-900 shadow-sm text-green-600" : "text-gray-500"}`}
        >
          Piutang Saya
        </button>
      </div>

      {/* Summary */}
      <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${activeTab === "debt" ? "from-red-500 to-red-700" : "from-green-500 to-green-700"}`}>
        <p className="text-xs uppercase tracking-widest opacity-80">Total Belum Lunas</p>
        <p className="text-3xl font-bold mt-1 tabular-nums">Rp {totalUnpaid.toLocaleString("id-ID")}</p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-80 transition">
          {showForm ? "Batal" : `+ Catat ${activeTab === "debt" ? "Hutang" : "Piutang"}`}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form action={handleAdd} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <input type="hidden" name="type" value={activeTab} />
          <input name="personName" required placeholder={activeTab === "debt" ? "Hutang ke siapa? (Misal: Budi)" : "Dipinjam siapa? (Misal: Andi)"} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <AmountInput name="amount" required />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jatuh Tempo (Opsional)</label>
            <input name="dueDate" type="date" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <input name="notes" placeholder="Catatan (opsional)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <button type="submit" className="w-full bg-red-600 text-white font-medium py-2 rounded-lg text-sm">Simpan</button>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredDebts.map((d) => (
          <div key={d.id} className={`p-4 rounded-2xl border transition ${d.isPaid ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  {d.personName}
                  {d.isPaid && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LUNAS</span>}
                </h3>
                <p className={`text-lg font-semibold mt-1 tabular-nums ${d.type === "debt" ? "text-red-500" : "text-green-500"}`}>
                  Rp {d.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500 mt-1">Jatuh Tempo: {formatDate(d.dueDate)}</p>
                {d.notes && <p className="text-xs text-gray-400 mt-1 italic">"{d.notes}"</p>}
              </div>
              <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500 p-1">✕</button>
            </div>

            {!d.isPaid && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                {settleId === d.id ? (
                  <form onSubmit={handleSettle} className="flex gap-2 items-center">
                    <input type="hidden" name="wallet" value={selectedWallet} />
                    <button type="button" onClick={() => setIsWalletModalOpen(true)} className="flex-1 text-left text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {selectedWallet || "Pilih Dompet"}
                    </button>
                    <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium">Lunasi</button>
                    <button type="button" onClick={() => setSettleId(null)} className="text-gray-500 text-xs px-1">✕</button>
                  </form>
                ) : (
                  <button onClick={() => setSettleId(d.id)} className="w-full text-xs font-medium border border-gray-300 dark:border-gray-700 hover:border-green-500 hover:text-green-500 py-2 rounded-lg transition">
                    Tandai Lunas
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredDebts.length === 0 && !showForm && (
          <div className="text-center py-12 border border-dashed rounded-2xl">
            <p className="text-4xl mb-2">{activeTab === "debt" ? "💸" : "🤝"}</p>
            <p className="text-sm text-gray-500">Belum ada catatan {activeTab === "debt" ? "hutang" : "piutang"}.</p>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={wallets}
        onSelect={(name) => { setSelectedWallet(name); setIsWalletModalOpen(false); }}
        onAdd={async () => {}} // Sementara kosongin dulu
        onEdit={async () => {}}
        onDelete={async () => {}}
      />
    </div>
  );
}