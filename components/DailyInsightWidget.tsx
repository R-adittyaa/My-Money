"use client";

import { motion } from "framer-motion";

type Props = {
  mood: "happy" | "sad" | "neutral";
  title: string;
  message: string;
  emoji: string;
  todayNet: number;
};

export default function DailyInsightWidget({ mood, title, message, emoji, todayNet }: Props) {
  const config = {
    happy: {
      bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-300",
    },
    sad: {
      bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-300",
    },
    neutral: {
      bg: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/40",
      border: "border-gray-200 dark:border-gray-800",
      text: "text-gray-800 dark:text-gray-300",
    },
  };

  const current = config[mood];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`rounded-2xl border p-4 shadow-sm flex items-center gap-4 ${current.bg} ${current.border}`}
    >
      {/* Emoji yang melayang */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="text-4xl shrink-0 drop-shadow-md"
      >
        {emoji}
      </motion.div>

      <div className="flex-1">
        <h3 className={`font-bold text-sm ${current.text}`}>{title}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Angka hari ini (kalau ada) */}
      {mood !== "neutral" && (
        <div className="hidden sm:block text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Hari ini</p>
          <p className={`text-sm font-bold tabular-nums ${todayNet >= 0 ? "text-green-600" : "text-red-600"}`}>
            {todayNet >= 0 ? "+" : ""} Rp {Math.abs(todayNet).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </motion.div>
  );
}