"use client";

import { useState, useEffect } from "react";

export default function BalanceDisplay({ balance }: { balance: number }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ambil settingan dari localStorage pas pertama kali dibuka
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

  // Format Rupiah
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(balance);

  // Biar gak error Hydration (karena beda render server & client)
  if (!isMounted) {
    return <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse mt-1"></div>;
  }

  return (
    <div className="flex items-center gap-3 mt-1">
      <p className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight">
        {isVisible ? formatted : "Rp ••••••"}
      </p>
      
      <button
        onClick={toggle}
        type="button"
        className="p-1.5 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white"
        aria-label={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
      >
        {isVisible ? (
          // Ikon Mata Terbuka (SVG)
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          // Ikon Mata Tertutup / Dicoret (SVG)
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        )}
      </button>
    </div>
  );
}