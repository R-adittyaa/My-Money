"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/transaksi", label: "Transaksi", icon: "💰" },
  { href: "/budget", label: "Budget", icon: "🎯" },
  { href: "/berulang", label: "Berulang", icon: "🔁" },
  { href: "/statistik", label: "Statistik", icon: "📊" },
  { href: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
];

export default function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-[calc(100vh-3.5rem)] sticky top-14">
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          My Money · v1.0
        </p>
      </div>
    </aside>
  );
}