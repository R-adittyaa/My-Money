"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, MouseEvent } from "react";
import confetti from "canvas-confetti";
import { MoodType } from "@/lib/insight-config";

type Props = {
  mood: MoodType;
  title: string;
  message: string;
  todayNet: number;
};

export default function DailyInsightWidget({ mood, title, message, todayNet }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Confetti hanya untuk mood yang positif
  useEffect(() => {
    if (mood === "happy" || mood === "excellent") {
      const timer = setTimeout(() => {
        confetti({
          particleCount: mood === "excellent" ? 100 : 60,
          spread: 70,
          origin: { y: 0.15 },
          colors: ["#22c55e", "#10b981", "#fbbf24", "#3b82f6"],
          disableForReducedMotion: true,
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  // Konfigurasi warna per mood
  const config = {
    excellent: {
      bg: "bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40",
      border: "border-indigo-200/60 dark:border-indigo-800/60",
      text: "text-indigo-900 dark:text-indigo-100",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50",
      glow: "bg-indigo-400/20 dark:bg-indigo-500/10",
      blob1: "bg-indigo-400/20 dark:bg-indigo-500/10",
      blob2: "bg-purple-400/20 dark:bg-purple-500/10",
    },
    happy: {
      bg: "bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40",
      border: "border-green-200/60 dark:border-green-800/60",
      text: "text-green-900 dark:text-green-100",
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/50 dark:to-emerald-900/50",
      glow: "bg-green-400/20 dark:bg-green-500/10",
      blob1: "bg-green-400/20 dark:bg-green-500/10",
      blob2: "bg-emerald-400/20 dark:bg-emerald-500/10",
    },
    neutral: {
      bg: "bg-gradient-to-br from-gray-50/80 to-slate-50/80 dark:from-gray-900/60 dark:to-slate-900/60",
      border: "border-gray-200/60 dark:border-gray-800/60",
      text: "text-gray-900 dark:text-gray-100",
      iconColor: "text-gray-600 dark:text-gray-400",
      iconBg: "bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-800/50 dark:to-slate-800/50",
      glow: "bg-gray-400/20 dark:bg-gray-500/10",
      blob1: "bg-gray-400/20 dark:bg-gray-600/10",
      blob2: "bg-slate-400/20 dark:bg-slate-600/10",
    },
    impas: {
      bg: "bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40",
      border: "border-blue-200/60 dark:border-blue-800/60",
      text: "text-blue-900 dark:text-blue-100",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/50 dark:to-cyan-900/50",
      glow: "bg-blue-400/20 dark:bg-blue-500/10",
      blob1: "bg-blue-400/20 dark:bg-blue-500/10",
      blob2: "bg-cyan-400/20 dark:bg-cyan-500/10",
    },
    boros: {
      bg: "bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/40 dark:to-amber-950/40",
      border: "border-orange-200/60 dark:border-orange-800/60",
      text: "text-orange-900 dark:text-orange-100",
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/50 dark:to-amber-900/50",
      glow: "bg-orange-400/20 dark:bg-orange-500/10",
      blob1: "bg-orange-400/20 dark:bg-orange-500/10",
      blob2: "bg-amber-400/20 dark:bg-amber-500/10",
    },
    defisit: {
      bg: "bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/40 dark:to-rose-950/40",
      border: "border-red-200/60 dark:border-red-800/60",
      text: "text-red-900 dark:text-red-100",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/50 dark:to-rose-900/50",
      glow: "bg-red-400/20 dark:bg-red-500/10",
      blob1: "bg-red-400/20 dark:bg-red-500/10",
      blob2: "bg-rose-400/20 dark:bg-rose-500/10",
    },
  };

  const current = config[mood];

  // Fungsi Render Ikon SVG
  const renderIcon = () => {
    const baseClass = `w-7 h-7 sm:w-8 sm:h-8 ${current.iconColor} drop-shadow-sm`;
    
    const svgProps = {
      initial: { pathLength: 0 }, 
      animate: { pathLength: 1 }, 
      transition: { duration: 1, ease: "easeInOut" as const }, 
      className: baseClass, 
      viewBox: "0 0 24 24", 
      fill: "none", 
      stroke: "currentColor", 
      strokeWidth: "2.5", 
      strokeLinecap: "round" as const, 
      strokeLinejoin: "round" as const
    };

    switch (mood) {
      case "excellent":
        return (
          <motion.svg {...svgProps}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </motion.svg>
        );
      case "happy":
        return (
          <motion.svg {...svgProps}>
            <motion.polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <motion.polyline points="16 7 22 7 22 13" />
          </motion.svg>
        );
      case "impas":
        return (
          <motion.svg {...svgProps}>
            <path d="M12 3v18" />
            <path d="M5 8l7-5 7 5" />
            <path d="M5 16l7 5 7-5" />
          </motion.svg>
        );
      case "boros":
        return (
          <motion.svg {...svgProps}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </motion.svg>
        );
      case "defisit":
        return (
          <motion.svg {...svgProps}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </motion.svg>
        );
      default: // neutral
        return (
          <motion.svg {...svgProps}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </motion.svg>
        );
    }
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-colors ${current.bg} ${current.border}`}
    >
      <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen pointer-events-none ${current.blob1}`} />
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen pointer-events-none ${current.blob2}`} />

      <div className="relative shrink-0 z-10" style={{ transform: "translateZ(40px)" }}>
        <div className={`absolute inset-0 rounded-2xl blur-lg scale-110 animate-pulse ${current.glow}`} />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-white/40 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)] ${current.iconBg}`}
        >
          {renderIcon()}
        </motion.div>
      </div>

      <div className="flex-1 z-10" style={{ transform: "translateZ(20px)" }}>
        <h3 className={`font-black text-sm sm:text-base tracking-tight ${current.text}`}>
          {title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed font-medium">
          {message}
        </p>
      </div>

      {mood !== "neutral" && (
        <div 
          className="hidden sm:flex flex-col items-end shrink-0 z-10 bg-white/60 dark:bg-black/30 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm"
          style={{ transform: "translateZ(30px)" }}
        >
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">
            Hari ini
          </p>
          <p className={`text-sm font-black tabular-nums ${todayNet >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {todayNet >= 0 ? "+" : ""} Rp {Math.abs(todayNet).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </motion.div>
  );
}