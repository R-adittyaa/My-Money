"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
};

export default function CategorySelect({
  name,
  options,
  placeholder = "Pilih kategori...",
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown kalau klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search box pas dropdown buka
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      {/* Hidden input buat form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-left flex items-center justify-between gap-2 transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
          value
            ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <span
          className={`text-gray-400 text-xs transition-transform shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori..."
              className="w-full rounded-md bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* List */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-xs text-center text-gray-400 dark:text-gray-500">
                Gak ada kategori yang cocok
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition ${
                      value === opt
                        ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Counter */}
          <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500">
            {filtered.length} dari {options.length} kategori
          </div>
        </div>
      )}
    </div>
  );
}