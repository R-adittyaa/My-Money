"use client";

import { useState } from "react";

const QUICK_CATEGORIES = [
  { label: "Makan", icon: "🍔" },
  { label: "Transport", icon: "🚗" },
  { label: "Belanja", icon: "🛍️" },
  { label: "Tagihan", icon: "💡" },
  { label: "Gaji", icon: "💼" },
  { label: "Hiburan", icon: "🎮" },
];

type Props = {
  name: string;
  suggestions: string[];
};

export default function CategoryInput({ name, suggestions }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        list="category-suggestions"
        placeholder="Kategori"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <datalist id="category-suggestions">
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_CATEGORIES.map((c) => {
          const isActive = value === c.label;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setValue(isActive ? "" : c.label)}
              className={`text-[11px] px-2 py-1 rounded-full border transition ${
                isActive
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400"
              }`}
            >
              {c.icon} {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}