"use client";

import { useState, useEffect } from "react";

type Props = {
  balance: number;
  income: number;
  expense: number;
};

export default function BalanceDisplay({ balance, income, expense }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ambil settingan dari localStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("hide-balance");
    if (saved === "true") setIsVisible(false);
  }, []);

  const toggle = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem("hide-balance", String(!newState));
  };

  const format = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const hiddenText = "Rp ••••••";

  // Biar gak error Hydration
  if (!isMounted) {
    return (
      <div className="space-y-4 mt-2">
        <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-white/10 rounded-xl animate-pulse"></div>
          <div className="h-16 bg-white/10 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bagian Saldo Utama */}
      <div className="flex items-center gap-3 mt-1">
        <p className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight">
          {isVisible ? format(balance) : hiddenText}
        </p>
        
        <button
          onClick={toggle}
          type="button"
          className="p-1.5 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white"
          aria-label={isVisible ? "Sembunyikan" : "Tampilkan"}
        >
          {isVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          )}
        </button>
      </div>

      {/* Bagian Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/10">
          <p className="text-[10px] opacity-80 uppercase tracking-wide">
            ↓ Pemasukan
          </p>
          <p className="text-sm sm:text-base font-semibold mt-1 tabular-nums">
            {isVisible ? format(income) : hiddenText}
          </p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/10">
          <p className="text-[10px] opacity-80 uppercase tracking-wide">
            ↑ Pengeluaran
          </p>
          <p className="text-sm sm:text-base font-semibold mt-1 tabular-nums">
            {isVisible ? format(expense) : hiddenText}
          </p>
        </div>
      </div>
    </>
  );
}