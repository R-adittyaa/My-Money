"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

type Props = {
  categories: string[];
  currentMonth: string;
};

export default function FilterBar({ categories, currentMonth }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");

  const currentType = searchParams.get("type") || "all";
  const currentCategory = searchParams.get("cat") || "";
  const currentSort = searchParams.get("sort") || "newest";

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("q", search);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function resetAll() {
    setSearch("");
    startTransition(() => {
      router.replace(`${pathname}?month=${currentMonth}`, { scroll: false });
    });
  }

  const hasFilter =
    search || currentType !== "all" || currentCategory || currentSort !== "newest";

  const selectClass =
    "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm space-y-3 transition ${
        isPending ? "opacity-70" : ""
      }`}
    >
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kategori atau catatan..."
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <select
          value={currentType}
          onChange={(e) => updateParam("type", e.target.value)}
          className={selectClass}
        >
          <option value="all">Semua Tipe</option>
          <option value="income">↓ Pemasukan</option>
          <option value="expense">↑ Pengeluaran</option>
        </select>

        <select
          value={currentCategory}
          onChange={(e) => updateParam("cat", e.target.value)}
          className={selectClass}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className={`${selectClass} col-span-2 sm:col-span-1`}
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="highest">Terbesar</option>
          <option value="lowest">Terkecil</option>
        </select>
      </div>

      {hasFilter && (
        <button
          onClick={resetAll}
          className="w-full text-xs text-red-600 dark:text-red-400 hover:underline py-1"
        >
          ✕ Reset filter
        </button>
      )}
    </div>
  );
}