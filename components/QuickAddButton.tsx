"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function QuickAddButton() {
  const pathname = usePathname();

  let href = "/transaksi"; 
  let label = "Tambah Transaksi";
  let show = true;

  if (pathname === "/transaksi") {
    show = false;
  } else if (pathname.startsWith("/dompet")) {
    href = "/dompet?new=true";
    label = "Tambah Dompet";
  } else if (pathname.startsWith("/goals")) {
    href = "/goals?new=true";
    label = "Tambah Target";
  } else if (pathname.startsWith("/hutang")) {
    href = "/hutang?new=true";
    label = "Catat Hutang";
  } else if (pathname.startsWith("/budget")) {
    href = "/budget?new=true";
    label = "Tambah Budget";
  } else if (pathname.startsWith("/berulang")) {
    href = "/berulang?new=true";
    label = "Tambah Berulang";
  } else {
    href = "/transaksi";
    label = "Tambah Transaksi";
  }

  if (!show) return null;

  return (
    <Link
      href={href}
      className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3.5 rounded-full shadow-lg shadow-red-600/40 transition-transform active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
      <span className="text-xs font-bold whitespace-nowrap">{label}</span>
    </Link>
  );
}