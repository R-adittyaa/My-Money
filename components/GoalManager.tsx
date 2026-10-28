"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";

type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  deposits: { id: string; amount: number; date: string }[];
  withdrawals?: { id: string; amount: number; date: string }[];
};

type Props = {
  goals: Goal[];
  onAdd: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onDeposit: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onWithdraw: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
};

export default function GoalManager({ goals, onAdd, onDelete, onDeposit, onWithdraw }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"deposit" | "withdraw" | "history" | null>(null);

  async function handleAdd(formData: FormData) {
    const res = await onAdd(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Target ditambahkan");
      setShowForm(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus target ini? Semua riwayat nabung akan hilang.")) return;
    const fd = new FormData(); fd.set("id", id);
    const res = await onDelete(fd);
    if (res?.error) toast.error(res.error);
    else toast.info("Target dihapus");
  }

  async function handleActionSubmit(e: React.FormEvent<HTMLFormElement>, type: "deposit" | "withdraw") {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const res = type === "deposit" ? await onDeposit(fd) : await onWithdraw(fd);
    
    if (res?.error) {
      // Nampilin error yang rapi di Vercel
      toast.error(res.error, { duration: 4000 });
    } else {
      toast.success(type === "deposit" ? "Berhasil menabung!" : "Berhasil ditarik!");
      setActionId(null);
      setActionType(null);
    }
  }

  function formatTanggalJam(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).replace(".", ":");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Daftar Target</h2>
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          {showForm ? "Batal" : "+ Target Baru"}
        </button>
      </div>

      {showForm && (
        <form action={handleAdd} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <input name="title" required placeholder="Mau nabung buat apa?" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <AmountInput name="targetAmount" required />
          <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-2.5 rounded-lg text-sm transition">Simpan Target</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const totalDeposit = goal.deposits.reduce((sum, d) => sum + d.amount, 0);
          const totalWithdraw = (goal.withdrawals || []).reduce((sum, w) => sum + w.amount, 0);
          const collected = totalDeposit - totalWithdraw;
          
          const pct = Math.min(Math.round((collected / goal.targetAmount) * 100), 100);
          const isDone = collected >= goal.targetAmount;

          const allHistory = [
            ...goal.deposits.map(d => ({ ...d, type: "deposit" })),
            ...(goal.withdrawals || []).map(w => ({ ...w, type: "withdraw" }))
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return (
            <div key={goal.id} className={`rounded-2xl bg-white dark:bg-gray-900 border p-5 shadow-sm relative overflow-hidden flex flex-col ${isDone ? "border-green-500/50" : "border-gray-200 dark:border-gray-800"}`}>
              {isDone && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">TERCAPAI 🎉</div>}
              
              <div className="flex justify-between items-start mb-4">
                <div className="pr-6">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 line-clamp-1">{goal.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Target: Rp {goal.targetAmount.toLocaleString("id-ID")}</p>
                </div>
                <button onClick={() => handleDelete(goal.id)} className="text-gray-300 hover:text-red-500 p-1">✕</button>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">Rp {collected.toLocaleString("id-ID")}</p>
                <div className="flex justify-between text-[10px] mt-1.5 font-medium">
                  <span className={isDone ? "text-green-600" : "text-red-600"}>{pct}% tercapai</span>
                  <span className="text-gray-400">Sisa Rp {(goal.targetAmount - collected).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-5">
                <div className={`h-full rounded-full ${isDone ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="mt-auto">
                {actionId === goal.id ? (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    {actionType === "history" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Riwayat</h4>
                          <button onClick={() => { setActionId(null); setActionType(null); }} className="text-gray-400 hover:text-gray-700 text-xs">✕</button>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                          {allHistory.map((h) => (
                            <div key={h.id} className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-gray-800 pb-1.5 last:border-0">
                              <div>
                                <p className={h.type === "deposit" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                                  {h.type === "deposit" ? "+" : "-"} Rp {h.amount.toLocaleString("id-ID")}
                                </p>
                                <p className="text-[9px] text-gray-400">{formatTanggalJam(h.date)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleActionSubmit(e, actionType as "deposit" | "withdraw")} className="space-y-2">
                        <input type="hidden" name="goalId" value={goal.id} />
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <AmountInput name="amount" required />
                          </div>
                          <button type="submit" className={`${actionType === "deposit" ? "bg-green-600" : "bg-red-600"} text-white px-3 py-2 rounded-lg text-xs font-medium`}>
                            {actionType === "deposit" ? "Nabung" : "Tarik"}
                          </button>
                          <button type="button" onClick={() => { setActionId(null); setActionType(null); }} className="text-gray-400 text-xs px-1">✕</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { setActionId(goal.id); setActionType("deposit"); }} disabled={isDone} className="text-[10px] font-medium border border-gray-300 dark:border-gray-700 hover:border-green-500 hover:text-green-500 py-1.5 rounded-lg transition disabled:opacity-50">+ Nabung</button>
                    <button onClick={() => { setActionId(goal.id); setActionType("withdraw"); }} className="text-[10px] font-medium border border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500 py-1.5 rounded-lg transition">- Tarik</button>
                    <button onClick={() => { setActionId(goal.id); setActionType("history"); }} className="text-[10px] font-medium border border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 py-1.5 rounded-lg transition">Riwayat</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}