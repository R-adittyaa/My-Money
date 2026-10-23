"use client";

import { toast } from "sonner";
import { useRef, useTransition, useState } from "react";
import { useFormStatus } from "react-dom";
import AmountInput from "./AmountInput";
import CategoryModal from "./CategoryModal";

type Category = { id: string; name: string; type: "income" | "expense" | "both" };

type Props = {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  onAddCategory: (name: string, type: "income" | "expense") => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-70 flex justify-center items-center">
      {pending ? "Menyimpan..." : "Simpan"}
    </button>
  );
}

export default function TransactionForm({ action, categories, onAddCategory, onDeleteCategory }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  function onSubmit(formData: FormData) {
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as string;

    startTransition(async () => {
      try {
        await action(formData);
        toast.success(`Transaksi tersimpan!`, { description: `Rp ${amount.toLocaleString("id-ID")}` });
        setFormKey((prev) => prev + 1);
        setSelectedCategory("");
      } catch (err: any) {
        if (err.message && err.message.includes("Budget")) {
          toast.error(err.message, { duration: 5000 });
          setFormKey((prev) => prev + 1);
          setSelectedCategory("");
        } else {
          toast.error("Gagal menyimpan transaksi");
        }
      }
    });
  }

  return (
    <>
      <form key={formKey} ref={formRef} action={onSubmit} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-3">
        
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Tambah Transaksi</h2>
        </div>

        <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />

        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="type" value="expense" defaultChecked className="peer sr-only" />
            <div className="rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-red-600 peer-checked:text-white transition">↓ Keluar</div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="type" value="income" className="peer sr-only" />
            <div className="rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-green-600 peer-checked:text-white transition">↑ Masuk</div>
          </label>
        </div>

        <AmountInput name="amount" required />

        {/* TOMBOL PILIH KATEGORI (Panggil Modal) */}
        <div>
          <input type="hidden" name="category" value={selectedCategory} required />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-left flex justify-between items-center transition ${
              selectedCategory 
                ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-medium" 
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-400"
            }`}
          >
            <span>{selectedCategory || "Pilih Kategori..."}</span>
            <span className="text-xs opacity-50">▼</span>
          </button>
        </div>

        <input name="notes" placeholder="Catatan (opsional)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />

        <SubmitButton />
      </form>

      {/* MODAL KATEGORI */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSelect={(name) => setSelectedCategory(name)}
        onAdd={onAddCategory}
        onDelete={onDeleteCategory}
      />
    </>
  );
}