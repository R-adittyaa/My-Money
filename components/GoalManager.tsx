"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";

type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  deposits: { id: string; amount: number; date: string }[];
};

type Props = {
  goals: Goal[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onDeposit: (formData: FormData) => Promise<void>;
};

export default function GoalManager({ goals, onAdd, onDelete, onDeposit }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    try {
      await onAdd(formData);
      toast.success("Target ditambahkan");
      setShowForm(false);
    } catch (err) {
      toast.error("Gagal tambah target");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus target ini? Semua riwayat nabung akan hilang.")) return;
    const fd = new FormData();
    fd.set("id", id);
    try {
      await onDelete(fd);
      toast.info("Target dihapus");
    } catch (err) {
      toast.error("Gagal hapus target");
    }
  }

  async function handleDeposit(formData: FormData) {
    try {
      await onDeposit(formData);
      toast.success("Berhasil menabung!");
      setDepositId(null);
    } catch (err) {
      toast.error("Gagal menabung");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          {showForm ? "Batal" : "+ Target Baru"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleAdd}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3"
        >
          <input
            name="title"
            required
            placeholder="Mau nabung buat apa? (Misal: Beli Laptop)"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
          <AmountInput name="targetAmount" required />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-2 rounded-lg text-sm"
          >
            Simpan Target
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const collected = goal.deposits.reduce((sum, d) => sum + d.amount, 0);
          const pct = Math.min(Math.round((collected / goal.targetAmount) * 100), 100);
          const isDone = collected >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3 shadow-sm relative overflow-hidden"
            >
              {isDone && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">TERCAPAI 🎉</div>}
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Terkumpul: <span className="font-medium text-gray-900 dark:text-gray-100">Rp {collected.toLocaleString("id-ID")}</span>
                  </p>
                  <p className="text-[10px] text-gray-400">Target: Rp {goal.targetAmount.toLocaleString("id-ID")}</p>
                </div>
                <button onClick={() => handleDelete(goal.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-medium">
                  <span className={isDone ? "text-green-600" : "text-red-600"}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isDone ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Tombol Nabung */}
              {depositId === goal.id ? (
                <form action={handleDeposit} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <div className="flex-1">
                    <AmountInput name="amount" required />
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium">Nabung</button>
                  <button type="button" onClick={() => setDepositId(null)} className="text-gray-400 text-xs px-1">✕</button>
                </form>
              ) : (
                <button
                  onClick={() => setDepositId(goal.id)}
                  className="w-full text-xs font-medium border border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500 py-1.5 rounded-lg transition"
                >
                  + Nabung
                </button>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 border border-dashed rounded-2xl">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-sm text-gray-500">Belum ada target tabungan.</p>
        </div>
      )}
    </div>
  );
}