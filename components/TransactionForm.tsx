"use client";

import { toast } from "sonner";
import { useRef } from "react";
import AmountInput from "./AmountInput";
import CategoryInput from "./CategoryInput";

type Props = {
  action: (formData: FormData) => Promise<void>;
  suggestions: string[];
};

export default function TransactionForm({ action, suggestions }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const amount = Number(formData.get("amount"));
    const category = (formData.get("category") as string) || "";
    const type = formData.get("type") as string;

    try {
      await action(formData);
      toast.success(
        type === "income"
          ? `Pemasukan "${category}" tersimpan!`
          : `Pengeluaran "${category}" tersimpan!`,
        {
          description: `Rp ${amount.toLocaleString("id-ID")}`,
        }
      );
      formRef.current?.reset();
    } catch (err) {
      toast.error("Gagal menyimpan transaksi", {
        description: "Coba lagi sebentar lagi ya",
      });
      console.error(err);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 bg-red-600 rounded-full"></span>
        <h2 className="font-semibold text-sm">Tambah Transaksi</h2>
      </div>

      <input
        name="date"
        type="date"
        required
        defaultValue={new Date().toISOString().slice(0, 10)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />

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
        placeholder="Catatan (opsional)"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
      >
        Simpan
      </button>
      <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
        Tip: tekan{" "}
        <kbd className="px-1 rounded bg-gray-100 dark:bg-gray-800">Enter</kbd>{" "}
        di kolom manapun untuk simpan
      </p>
    </form>
  );
}