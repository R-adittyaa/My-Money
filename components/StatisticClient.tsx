"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Transaction } from "@/lib/types";

const ChartKlien = dynamic(() => import("./ChartKlien"), { 
  ssr: false,
  loading: () => <div className="h-[280px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
});

type Props = {
  transactions: Transaction[];
  availableMonths: string[];
  activeMonth: string;
  activePeriod: string;
};

export default function StatisticClient({ transactions, availableMonths, activeMonth, activePeriod }: Props) {
  const [chartType, setChartType] = useState<"expense" | "income">("expense");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const safeTransactions = transactions || [];

  const totalIncome = safeTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = safeTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // Data Chart berdasarkan tipe yang dipilih
  const chartData = Object.entries(
    safeTransactions.filter((t) => t.type === chartType).reduce<Record<string, number>>((acc, t) => {
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
    (t) => t.category === selectedCategory && t.type === chartType
  );

  const totalForChart = chartType === "income" ? totalIncome : totalExpense;
  const labelForChart = chartType === "income" ? "Pemasukan" : "Pengeluaran";

  // Generate Link buat filter
  const buildLink = (period: string) => {
    const sp = new URLSearchParams();
    if (period !== "monthly") sp.set("period", period);
    sp.set("month", activeMonth);
    return `/statistik?${sp.toString()}`;
  };

  const periods = [
    { id: "weekly", label: "Mingguan" },
    { id: "monthly", label: "Bulanan" },
    { id: "yearly", label: "Tahunan" },
  ];

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0 pb-20">
      
      {/* HEADER: FILTER PERIODE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full"></span>
          <h1 className="text-lg font-bold">Statistik</h1>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
          {periods.map((p) => {
            const isActive = activePeriod === p.id;
            return (
              <Link 
                key={p.id} 
                href={buildLink(p.id)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {p.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* NAVIGASI BULAN (Cuma muncul kalau Bulanan) */}
      {activePeriod === "monthly" && availableMonths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {availableMonths.slice(0, 12).map((m) => {
            const isActive = m === activeMonth;
            const label = new Date(m + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
            const sp = new URLSearchParams();
            sp.set("month", m);
            sp.set("period", "monthly");
            return (
              <Link key={m} href={`/statistik?${sp.toString()}`} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${isActive ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400"}`}>
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* TOGGLE PEMASUKAN vs PENGELUARAN */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button 
          onClick={() => { setChartType("income"); setSelectedCategory(null); }} 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${chartType === "income" ? "bg-white dark:bg-gray-900 shadow-sm text-green-600" : "text-gray-500"}`}
        >
          ↓ Pemasukan
        </button>
        <button 
          onClick={() => { setChartType("expense"); setSelectedCategory(null); }} 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${chartType === "expense" ? "bg-white dark:bg-gray-900 shadow-sm text-red-600" : "text-gray-500"}`}
        >
          ↑ Pengeluaran
        </button>
      </div>

      {/* KARTU TOTAL */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Total {labelForChart}</p>
          <p className={`text-xl font-bold tabular-nums ${chartType === "income" ? "text-green-600" : "text-red-600"}`}>
            {formatRupiah(totalForChart)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl">
          {chartType === "income" ? "💵" : "💸"}
        </div>
      </div>

      {/* CHART */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 pt-6 pb-2 px-2 shadow-sm">
        <ChartKlien data={chartData} type={chartType} />
      </div>

      {/* LIST RANKING */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rincian {labelForChart}</h3>
        </div>
        
        {chartData.map((cat, index) => {
          const pct = totalForChart > 0 ? ((cat.value / totalForChart) * 100).toFixed(0) : "0";
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
                  <div className={`w-10 h-7 flex items-center justify-center rounded-md text-[10px] font-bold text-white shadow-sm ${chartType === "income" ? "bg-green-600" : "bg-red-600"}`}>
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
        {chartData.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">Belum ada data {labelForChart.toLowerCase()} di periode ini.</div>
        )}
      </div>
    </main>
  );
}