"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type InsightType = "hemat" | "wajar" | "boros";

type Props = {
  categoryName: string;
  amount: number;
  status: InsightType;
  customText?: string;
  onClose: () => void;
  onEditText: () => void;
};

export default function InsightWidget({ categoryName, amount, status, customText, onClose, onEditText }: Props) {
  const config = {
    hemat: { color: "bg-green-500", text: "Hemat", emoji: "🌱", defaultMsg: "Wah, pengeluaran lu di kategori ini masih aman. Pertahankan!" },
    wajar: { color: "bg-yellow-500", text: "Wajar", emoji: "👍", defaultMsg: "Pengeluaran lu masih normal, gak terlalu boros." },
    boros: { color: "bg-red-500", text: "Boros", emoji: "🔥", defaultMsg: "Hati-hati! Pengeluaran lu di kategori ini udah lumayan boros." },
  };

  const current = config[status];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[150]"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
        {/* Garis Warna Status */}
        <div className={`h-1.5 w-full ${current.color}`} />
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Insight Kategori</p>
              <h3 className="font-bold text-lg">{categoryName}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full">✕</button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">{current.emoji}</div>
            <div>
              <p className="text-sm font-bold">Status: {current.text}</p>
              <p className="text-xs text-gray-500">Total: Rp {amount.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 italic">
            "{customText || current.defaultMsg}"
          </div>

          <button 
            onClick={onEditText}
            className="w-full mt-3 text-xs font-medium border border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500 py-2 rounded-lg transition"
          >
            ✎ Kustomisasi Teks
          </button>
        </div>
      </div>
    </motion.div>
  );
}