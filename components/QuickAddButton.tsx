"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function QuickAddButton() {
  const pathname = usePathname();

  // Cuma muncul di Dashboard (/) dan Statistik
  const allowedPages = ["/", "/statistik"];
  
  // Tombol gak muncul kalau lu gak ada di allowedPages
  if (!allowedPages.includes(pathname)) {
    return null;
  }

  return (
    <Link
      href="/transaksi"
      className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3.5 rounded-full shadow-lg shadow-red-600/40 transition-transform active:scale-95 animate-in slide-in-from-bottom-4"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
      <span className="text-xs font-bold whitespace-nowrap">Tambah Transaksi</span>
    </Link>
  );
}