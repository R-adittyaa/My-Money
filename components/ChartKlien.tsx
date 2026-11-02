"use client";

import { useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const EXPENSE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

const INCOME_COLORS = [
  "#10b981", "#22c55e", "#84cc16", "#06b6d4", "#3b82f6",
  "#14b8a6", "#34d399", "#a3e635", "#2dd4bf", "#60a5fa",
];

type Item = { name: string; value: number };

export default function ChartKlien({ data, type = "expense" }: { data: Item[], type?: "income" | "expense" }) {
  const chartRef = useRef<any>(null);
  const colorPalette = type === "income" ? INCOME_COLORS : EXPENSE_COLORS;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 dark:text-gray-500">
        Belum ada data {type === "income" ? "pemasukan" : "pengeluaran"}
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((_, i) => colorPalette[i % colorPalette.length]),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 13, weight: "bold" as const },
        callbacks: {
          label: function(context: any) {
            let label = context.label || "";
            let value = context.raw || 0;
            return label + ": Rp " + value.toLocaleString("id-ID");
          }
        }
      },
    },
  };

  return (
    <div className="h-[280px] sm:h-[320px] w-full relative">
      <Doughnut ref={chartRef} data={chartData} options={options} />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
        <span className={`text-sm font-bold ${type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          Rp {data.reduce((sum, d) => sum + d.value, 0).toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}