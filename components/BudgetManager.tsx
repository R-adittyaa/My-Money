"use client";

import { useState } from "react";
import { toast } from "sonner";
import AmountInput from "./AmountInput";
import CategorySelect from "./CategorySelect";

type Budget = {
  id: string;
  category: string;
  limit: number;
  createdAt: string;
};

type Props = {
  budgets: Budget[];
  categories: string[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export default function BudgetManager({
  budgets,
  categories,
  onAdd,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(formData: FormData) {
    try {
      await onAdd(formData);
      toast.success("Budget ditambahkan", { duration: 2000 });
      setShowForm(false);
    } catch (err) {
      toast.error("Gagal menambahkan budget");
      console.error(err);
    }
  }

  async function handleDelete(id: string, category: string) {
    const fd = new FormData();
    fd.set("id", id);
    try {
      await onDelete(fd);
      toast.info(`Budget "${category}" dihapus`, { duration: 2000 });
    } catch (err) {
      toast.error("Gagal menghapus");
      console.error(err);
    }
  }

  const availableCategories = categories.filter(
    (c) => !budgets.some((b) => b.category === c)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Budget Bulanan</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
        >
          {showForm ? "Batal" : "+ Tambah"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleAdd}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3"
        >
          {availableCategories.length > 0 ? (
            <>
              <CategorySelect
                name="category"
                options={availableCategories}
                placeholder="Pilih kategori..."
                required
              />

              <AmountInput name="limit" required />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 rounded-lg transition text-sm"
              >
                Simpan Budget
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
              Semua kategori udah punya budget. Hapus salah satu dulu kalau mau
              ganti.
            </p>
          )}
        </form>
      )}

      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-6 text-center">
          <p className="text-2xl mb-1">🎯</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Belum ada budget
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            Set limit biar gak kebablasan
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {budgets.map((b) => (
            <li
              key={b.id}
              className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{b.category}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
                  Rp {b.limit.toLocaleString("id-ID")} / bulan
                </p>
              </div>
              <button
                onClick={() => handleDelete(b.id, b.category)}
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