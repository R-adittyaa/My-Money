"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";
import CategoryInput from "./CategoryInput";

type Template = {
  id: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes: string;
  dayOfMonth: number;
  frequency: "monthly";
  lastGenerated: string | null;
  active: boolean;
};

type Props = {
  templates: Template[];
  suggestions: string[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggle: (formData: FormData) => Promise<void>;
};

export default function RecurringManager({
  templates,
  suggestions,
  onAdd,
  onDelete,
  onToggle,
}: Props) {
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(formData: FormData) {
    try {
      await onAdd(formData);
      toast.success("Template berulang ditambahkan", { duration: 2000 });
      setShowForm(false);
    } catch (err) {
      toast.error("Gagal menambahkan template");
      console.error(err);
    }
  }

  async function handleDelete(id: string, category: string) {
    const fd = new FormData();
    fd.set("id", id);
    try {
      await onDelete(fd);
      toast.info(`Template "${category}" dihapus`, { duration: 2000 });
    } catch (err) {
      toast.error("Gagal menghapus");
      console.error(err);
    }
  }

  async function handleToggle(id: string, active: boolean, category: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("active", active ? "1" : "0");
    try {
      await onToggle(fd);
      toast.info(
        active ? `"${category}" diaktifkan` : `"${category}" dimatikan`,
        { duration: 1500 }
      );
    } catch (err) {
      toast.error("Gagal mengubah status");
      console.error(err);
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Transaksi Berulang</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
        >
          {showForm ? "Batal" : "+ Tambah"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          action={handleAdd}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                defaultChecked
                className="peer sr-only"
              />
              <div className="rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600 transition">
                ↓ Keluar
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                className="peer sr-only"
              />
              <div className="rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600 transition">
                ↑ Masuk
              </div>
            </label>
          </div>

          <AmountInput name="amount" required />
          <CategoryInput name="category" suggestions={suggestions} />

          <input
            name="notes"
            placeholder="Catatan (misal: Gaji bulanan)"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Tanggal jatuh tempo tiap bulan
            </label>
            <input
              name="dayOfMonth"
              type="number"
              min="1"
              max="31"
              required
              defaultValue="1"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 rounded-lg transition text-sm"
          >
            Simpan Template
          </button>
        </form>
      )}

      {/* List */}
      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-6 text-center">
          <p className="text-2xl mb-1">🔁</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Belum ada template berulang
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            Cocok buat gaji, sewa, langganan
          </p>
        </div>
      ) : (
        <ul className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
          {templates.map((tpl) => (
            <li key={tpl.id} className="p-3 flex items-center gap-2">
              <button
                onClick={() => handleToggle(tpl.id, !tpl.active, tpl.category)}
                className={`w-8 h-4 rounded-full transition relative shrink-0 ${
                  tpl.active
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
                aria-label="Toggle"
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    tpl.active ? "left-4" : "left-0.5"
                  }`}
                />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">
                  {tpl.category}
                  <span
                    className={`ml-1.5 ${
                      tpl.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {tpl.type === "income" ? "+" : "-"}Rp{" "}
                    {tpl.amount.toLocaleString("id-ID")}
                  </span>
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Tiap tanggal {tpl.dayOfMonth}
                  {tpl.notes && ` · ${tpl.notes}`}
                </p>
              </div>

              <button
                onClick={() => handleDelete(tpl.id, tpl.category)}
                className="text-gray-300 hover:text-red-500 text-xs p-1 transition"
                aria-label="Hapus"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}