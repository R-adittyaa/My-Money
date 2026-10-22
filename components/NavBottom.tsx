"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MAIN_NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/transaksi", label: "Transaksi", icon: "💰" },
  { href: "/goals", label: "Target", icon: "🏆" },
  { href: "/budget", label: "Budget", icon: "🎯" },
];

const MORE_NAV = [
  { href: "/statistik", label: "Statistik", icon: "📊" },
  { href: "/berulang", label: "Berulang", icon: "🔁" },
  { href: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
];

export default function NavBottom() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Cek apakah user lagi buka halaman yang ada di dalem menu "Lainnya"
  const isMoreActive = MORE_NAV.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Bottom Nav Utama */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pb-safe">
        <div className="grid grid-cols-5">
          {MAIN_NAV.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition ${
                  isActive
                    ? "text-red-600 dark:text-red-500 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <span className={`text-lg transition-transform ${isActive ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Tombol Lainnya */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition ${
              isMoreActive || showMore
                ? "text-red-600 dark:text-red-500 font-medium"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className={`text-lg transition-transform ${isMoreActive || showMore ? "scale-110" : ""}`}>
              ⋯
            </span>
            <span>Lainnya</span>
          </button>
        </div>
      </nav>

      {/* Pop-up Menu "Lainnya" (Bottom Sheet) */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end justify-center">
          {/* Overlay Gelap (Klik buat tutup) */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMore(false)}
          />

          {/* Panel Menu */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-sm font-bold mb-4">Menu Lainnya</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {MORE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}