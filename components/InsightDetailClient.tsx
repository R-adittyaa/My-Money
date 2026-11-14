"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Transaction } from "@/lib/types";

type Props = {
  categoryName: string;
  totalExpense: number;
  transactionCount: number;
  status: "hemat" | "wajar" | "boros";
  customText?: string;
  transactions: Transaction[];
};

// Fungsi Animasi Angka
function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString("id-ID"));
  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);
  return <motion.span>{rounded}</motion.span>;
}

// Background Partikel (Fix Hydration)
function FloatingParticles() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate partikel HANYA di client (browser)
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default function InsightDetailClient({ categoryName, totalExpense, transactionCount, status, customText, transactions }: Props) {
  const config = {
    hemat: { color: "from-green-500 to-emerald-700", text: "text-green-400", icon: "🌱", title: "Hemat", defaultMsg: "Wah, pengeluaran lu di kategori ini masih aman. Pertahankan!" },
    wajar: { color: "from-yellow-400 to-orange-500", text: "text-yellow-400", icon: "👍", title: "Wajar", defaultMsg: "Pengeluaran lu masih normal, gak terlalu boros." },
    boros: { color: "from-red-500 to-rose-700", text: "text-red-400", icon: "🔥", title: "Boros", defaultMsg: "Hati-hati! Pengeluaran lu di kategori ini udah lumayan boros." },
  };

  const current = config[status];
  const limitBoros = 1000000;
  const percentage = Math.min((totalExpense / limitBoros) * 100, 100);

  return (
    <main className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      
      {/* BACKGROUND GRADIENT & PARTIKEL */}
      <div className={`absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b ${current.color} opacity-20 blur-3xl`}></div>
      <FloatingParticles />

      {/* KONTEN UTAMA */}
      <div className="relative z-10 px-4 pt-6 pb-20 max-w-md mx-auto flex flex-col min-h-screen">
        
        {/* HEADER NAVIGASI */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/statistik" className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold tracking-widest uppercase">
            Insight Kategori
          </div>
          <div className="w-9"></div>
        </div>

        {/* HERO SECTION */}
        <div className="text-center space-y-2 mb-8">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-gray-400 uppercase tracking-widest"
          >
            {categoryName}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="text-5xl font-black tracking-tight"
          >
            <span className="text-2xl font-semibold text-gray-400 mr-1">Rp</span>
            <AnimatedNumber value={totalExpense} />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${current.text}`}
          >
            <span>{current.icon}</span>
            <span className="text-xs font-bold">{current.title}</span>
          </motion.div>
        </div>

        {/* RADIAL PROGRESS BAR */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative w-48 h-48 mx-auto mb-8"
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <motion.circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={status === "hemat" ? "#10b981" : status === "wajar" ? "#f59e0b" : "#ef4444"} 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Transaksi</p>
            <p className="text-3xl font-bold"><AnimatedNumber value={transactionCount} />x</p>
          </div>
        </motion.div>

        {/* ANALISIS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center mb-8"
        >
          <p className="text-sm text-gray-300 italic leading-relaxed">
            "{customText || current.defaultMsg}"
          </p>
        </motion.div>

        {/* LIST TRANSAKSI */}
        <div className="space-y-3 mt-auto">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Log Transaksi</p>
          
          {transactions.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-xs text-gray-400">Belum ada transaksi.</p>
            </div>
          )}

          {transactions.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + (i * 0.1) }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-sm">{t.notes || t.category}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} • {t.wallet}
                </p>
              </div>
              <p className={`font-semibold tabular-nums text-sm ${current.text}`}>
                - Rp {t.amount.toLocaleString("id-ID")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}