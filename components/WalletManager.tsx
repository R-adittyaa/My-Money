"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";
import { Transaction } from "@/lib/types";

type Wallet = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
};

type Props = {
  wallets: Wallet[];
  monthTransactions: Transaction[];
  activeMonth: string;
  onAdd: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onUpdate: (
    formData: FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (
    formData: FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
};

export default function WalletManager({
  wallets,
  monthTransactions,
  activeMonth,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailWallet, setDetailWallet] = useState<Wallet | null>(null);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    isEdit: boolean,
  ) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = isEdit ? await onUpdate(fd) : await onAdd(fd);

    if (res?.error) toast.error(res.error);
    else {
      toast.success(isEdit ? "Dompet diupdate" : "Dompet ditambahkan");
      setMode(null);
      setEditId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus dompet "${name}"?`)) return;
    const fd = new FormData();
    fd.set("id", id);
    const res = await onDelete(fd);
    if (res?.error) toast.error(res.error);
    else toast.info("Dompet dihapus");
  }

  const editWallet = wallets.find((w) => w.id === editId);
  const monthLabel = new Date(activeMonth + "-01").toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Fungsi buat ngitung data detail (pas modal kebuka)
  const getWalletDetails = (walletName: string) => {
    const txs = monthTransactions.filter((t) => t.wallet === walletName);

    const income = txs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    // Grouping per kategori
    const expenseByCategory = Object.entries(
      txs
        .filter((t) => t.type === "expense")
        .reduce<Record<string, number>>((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { txs, income, expense, expenseByCategory };
  };

  const detail = detailWallet ? getWalletDetails(detailWallet.name) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setMode("add");
            setEditId(null);
          }}
          className="text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          + Dompet Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wallets.map((w) => (
          <div
            key={w.id}
            onClick={() => setDetailWallet(w)}
            className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 text-white shadow-lg overflow-hidden group border border-gray-800 cursor-pointer hover:border-red-500/50 transition-all hover:-translate-y-1 hover:shadow-red-900/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
                    Dompet
                  </p>
                  <h3 className="font-bold text-lg">{w.name}</h3>
                </div>
                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode("edit");
                      setEditId(w.id);
                    }}
                    className="bg-white/10 hover:bg-white/20 p-1.5 rounded text-xs"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(w.id, w.name);
                    }}
                    className="bg-white/10 hover:bg-red-500/80 p-1.5 rounded text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-white/60 mb-0.5">
                Saldo s/d {monthLabel}
              </p>
              <p
                className={`text-2xl font-bold tabular-nums ${w.currentBalance < 0 ? "text-red-400" : "text-white"}`}
              >
                Rp {w.currentBalance.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL DOMPET */}
      {detailWallet && detail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetailWallet(null)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="bg-gray-900 p-6 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
                    Rincian Dompet
                  </p>
                  <h2 className="text-2xl font-bold">{detailWallet.name}</h2>
                </div>
                <button
                  onClick={() => setDetailWallet(null)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-5 space-y-6">
              {/* KARTU RUMUS SALDO (Biar gak bingung minus) */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Saldo Awal ({monthLabel})</span>
                  <span className="font-medium">
                    Rp {detailWallet.initialBalance.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                  <span>+ Pemasukan ({monthLabel})</span>
                  <span className="font-medium">
                    Rp {detail.income.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-red-600 dark:text-red-400">
                  <span>- Pengeluaran ({monthLabel})</span>
                  <span className="font-medium">
                    Rp {detail.expense.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between text-sm font-bold">
                  <span>Saldo Akhir</span>
                  <span
                    className={
                      detailWallet.currentBalance < 0 ? "text-red-500" : ""
                    }
                  >
                    Rp {detailWallet.currentBalance.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Bar Chart Mini per Kategori */}
              {detail.expenseByCategory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Top Pengeluaran Bulan Ini
                  </h4>
                  <div className="space-y-3">
                    {detail.expenseByCategory.slice(0, 3).map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[11px] font-medium w-20 truncate">
                          {c.name}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${(c.value / detail.expense) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums text-gray-600 dark:text-gray-400 w-12 text-right">
                          {(c.value / 1000).toFixed(0)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List Transaksi */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                  Riwayat Transaksi
                </h4>
                <div className="space-y-4">
                  {detail.txs.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500">
                        Belum ada transaksi di bulan ini.
                      </p>
                    </div>
                  )}
                  {detail.txs.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {t.category}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {new Date(t.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          • {t.notes || "-"}
                        </p>
                      </div>
                      <p
                        className={`font-semibold tabular-nums shrink-0 ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {t.type === "income" ? "+" : "-"} Rp{" "}
                        {t.amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT DOMPET */}
      {mode && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMode(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4">
              {mode === "add" ? "Tambah Dompet" : "Edit Dompet"}
            </h3>

            <form
              onSubmit={(e) => handleSubmit(e, mode === "edit")}
              className="space-y-4"
            >
              {mode === "edit" && (
                <input type="hidden" name="id" value={editId!} />
              )}

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nama Dompet
                </label>
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
                <AmountInput
                  name="initialBalance"
                  defaultValue={
                    mode === "edit" ? editWallet?.initialBalance : 0
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
