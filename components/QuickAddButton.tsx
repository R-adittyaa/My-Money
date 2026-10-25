"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function QuickAddButton() {
  const pathname = usePathname();

  // Jangan tampil kalau lagi di halaman transaksi
  if (pathname === "/transaksi") return null;

  return (
    <Link
      href="/transaksi"
      className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center transition-transform active:scale-95 animate-in fade-in slide-in-from-bottom-4"
      aria-label="Tambah Transaksi Cepat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
    </Link>
  );
}