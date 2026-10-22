"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/transaksi", label: "Transaksi", icon: "💰" },
  { href: "/goals", label: "Target", icon: "🏆" },
  { href: "/budget", label: "Budget", icon: "🎯" },
  { href: "/berulang", label: "Berulang", icon: "🔁" },
];

export default function NavBottom() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md pb-safe">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
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
      </div>
    </nav>
  );
}