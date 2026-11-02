"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Transaction } from "@/lib/types";

const ChartKlien = dynamic(() => import("./ChartKlien"), { 
  ssr: false,
  loading: () => <div className="h-[280px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
});

import { COLORS } from "./ChartKlien";

type Props = {
  transactions: Transaction[];
  monthLabel: string;
  activeMonth: string;
};

export default function StatisticClient({ transactions, monthLabel, activeMonth }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const safeTransactions = transactions || [];

  const totalIncome = safeTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = safeTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const expenseByCategory = Object.entries(
    safeTransactions.filter((t) => t.type === "expense").reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const formatRupiah = (n: number) => {
    const sign = n < 0 ? "-" : "";
    return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
  };

  const historyTransaksi = safeTransactions.filter(
    (t) => t.category === selectedCategory && t.type === "expense"
  );

  // LOGIKA NAVIGASI BULAN
  const prevMonth = new Date(activeMonth + "-01");
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStr = prevMonth.toISOString().slice(0, 7);

  const nextMonth = new Date(activeMonth + "-01");
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().slice(0, 7);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-4 max-w-4xl mx-auto lg:mx-0 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full"></span>
          <h1 className="text-lg font-bold">Statistik</h1>
        </div>
        
        {/* NAVIGASI BULAN DI SINI */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
          <Link href={`/statistik?month=${prevMonthStr}`} className="p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 transition text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <span className="text-xs font-medium px-1">{monthLabel}</span>
          <Link href={`/statistik?month=${nextMonthStr}`} className="p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 transition text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Pendapatan</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Pengeluaran</p>
          <p className="text-sm font-bold text-red-600 dark:text-red-500 tabular-nums">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 pt-6 pb-2 px-2 shadow-sm">
        <ChartKlien data={expenseByCategory} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {expenseByCategory.map((cat, index) => {
          const pct = totalExpense > 0 ? ((cat.value / totalExpense) * 100).toFixed(0) : "0";
          const isSelected = selectedCategory === cat.name;

          return (
            <div key={cat.name} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              <button
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  isSelected ? "bg-gray-50 dark:bg-gray-800/50" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 flex items-center justify-center rounded-md text-xs font-bold text-white shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    {pct}%
                  </div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{cat.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{formatRupiah(cat.value)}</p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${isSelected ? "rotate-180" : ""}`}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </button>

              {isSelected && (
                <div className="bg-gray-50/50 dark:bg-gray-900/30 p-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Riwayat Transaksi</p>
                  <ul className="space-y-3">
                    {historyTransaksi.map((t) => (
                      <li key={t.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{t.notes || t.category}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <p className="font-semibold tabular-nums">{formatRupiah(t.amount)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        {expenseByCategory.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">Belum ada pengeluaran bulan ini.</div>
        )}
      </div>
    </main>
  );
}