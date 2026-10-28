"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

type Item = { name: string; value: number };

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  if (percent < 0.03) return null;

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={COLORS[index % COLORS.length]} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2} fill={COLORS[index % COLORS.length]} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="#888" fontSize={11} fontWeight={500} dy={-4}>
        {name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12} fontWeight={700} dy={12} className="dark:fill-gray-100">
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

export default function CategoryChart({ data }: { data: Item[] }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 dark:text-gray-500">
        Belum ada data pengeluaran
      </div>
    );
  }

  return (
    <div className="h-[280px] sm:h-[320px] w-full -mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            // Kalau lagi di-hover, radius luarnya membesar 6px
            outerRadius={(props: any) => {
              // Recharts v3 ngasih props index lewat payload
              const index = data.findIndex(d => d.name === props.payload.name);
              return index === activeIndex ? 90 : 85;
            }}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="transition-all duration-300" // Tambahin animasi smooth
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => "Rp " + Number(v).toLocaleString("id-ID")}
            contentStyle={{ background: "rgba(0,0,0,0.85)", border: "none", borderRadius: "8px", color: "white", fontSize: "12px" }}
            itemStyle={{ color: "white" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}