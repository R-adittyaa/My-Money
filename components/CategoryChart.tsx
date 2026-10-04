"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#dc2626", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
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
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => "Rp " + v.toLocaleString("id-ID")}
              contentStyle={{
                background: "rgba(0,0,0,0.85)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2 mt-2">
        {data.slice(0, 6).map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <li
              key={d.name}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                {d.name}
              </span>
              <span className="text-gray-400 dark:text-gray-500 tabular-nums">
                {pct}%
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-200 tabular-nums">
                Rp {d.value.toLocaleString("id-ID")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}