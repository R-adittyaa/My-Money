"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-16 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />;

  const options = [
    { id: "light", label: "Light", icon: "☀️" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "system", label: "System", icon: "💻" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
      {options.map((opt) => {
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition ${
              isActive 
                ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100 font-medium" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="text-lg">{opt.icon}</span>
            <span className="text-[10px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}