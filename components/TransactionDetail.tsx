"use client";

import { useState } from "react";
import DeleteButton from "./DeleteButton";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  notes: string;
};

type Props = {
  transaction: Transaction;
  categoryIcon: string;
  onDelete: (formData: FormData) => Promise<void>;
};

export default function TransactionDetail({ transaction: t, categoryIcon, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const formatRupiah = (n: number) => {
    const sign = n < 0 ? "-" : "";
    return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
  };

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Trigger: Baris List Transaksi */}
      <li
        onClick={() => setIsOpen(true)}
        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-base shrink-0">
          {categoryIcon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{t.category}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {t.notes || (t.type === "income" ? "Pemasukan" : "Pengeluaran")}
          </p>
        </div>
        <p
          className={`text-sm font-semibold whitespace-nowrap tabular-nums ${
            t.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {t.type === "income" ? "+" : "-"}
          {formatRupiah(t.amount)}
        </p>
      </li>

      {/* Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Konten Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200">
            {/* Handle bar buat mobile */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden"></div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl mb-3">
                {categoryIcon}
              </div>
              <h3 className="text-lg font-bold">{t.category}</h3>
              <p
                className={`text-2xl font-bold mt-1 tabular-nums ${
                  t.type === "income" ? "text-green-500" : "text-red-500"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {formatRupiah(t.amount)}
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tipe</span>
                <span className="font-medium capitalize">
                  {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tanggal</span>
                <span className="font-medium">{formatTanggal(t.date)}</span>
              </div>
              <div className="flex flex-col text-sm">
                <span className="text-gray-500 dark:text-gray-400 mb-1">Catatan</span>
                <span className="font-medium whitespace-pre-wrap leading-relaxed">
                  {t.notes || "-"}
                </span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Tutup
              </button>
              
              {/* Tombol Hapus (pake komponen DeleteButton yang lama) */}
              <div className="flex-1">
                <DeleteButton
                  id={t.id}
                  category={t.category}
                  action={async (fd) => {
                    setIsOpen(false); // Tutup modal dulu
                    await onDelete(fd); // Baru hapus
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}