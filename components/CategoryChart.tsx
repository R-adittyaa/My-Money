"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Palet warna yang lebih estetik (senada merah/oranye/hangat)
const COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#e11d48", // Rose
  "#ea580c", // Dark Orange
  "#d97706", // Dark Amber
  "#be123c", // Dark Rose
  "#c2410c", // Brown-ish
];

type Item = {
  name: string;
  value: number;
};

export default function CategoryChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
        Belum ada data pengeluaran
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="h-52 -mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55} // Lubang tengah dibikin lebih gede (Donut Chart)
              outerRadius={85}
              paddingAngle={4} // Jarak antar potongan
              stroke="none" // Hilangin garis luar
              cornerRadius={6} // Bikin ujung potongan tumpul (modern)
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => "Rp " + Number(v).toLocaleString("id-ID")}
              contentStyle={{
                background: "rgba(0,0,0,0.85)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "12px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ color: "white" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2 mt-4">
        {data.slice(0, 6).map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <li key={d.name} className="flex items-center gap-3 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300 font-medium">
                {d.name}
              </span>
              <span className="text-gray-400 dark:text-gray-500 tabular-nums text-[10px]">
                {pct}%
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                Rp {d.value.toLocaleString("id-ID")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}