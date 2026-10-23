"use client";

import { useState } from "react";
import { toast } from "sonner";

type Category = { id: string; name: string; type: "income" | "expense" | "both" };
type Props = {
  categories: Category[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

export default function CategoryManager({ categories, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(fd: FormData) {
    try {
      await onAdd(fd);
      toast.success("Kategori ditambahkan");
      setShowForm(false);
    } catch { toast.error("Gagal tambah kategori"); }
  }

  async function handleDelete(id: string, name: string) {
    if(!confirm(`Hapus kategori "${name}"?`)) return;
    const fd = new FormData(); fd.set("id", id);
    try {
      await onDelete(fd);
      toast.info("Kategori dihapus");
    } catch { toast.error("Gagal hapus"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          {showForm ? "Batal" : "+ Kategori Baru"}
        </button>
      </div>

      {showForm && (
        <form action={handleAdd} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <input name="name" required placeholder="Nama Kategori (Misal: Kopi)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
          <select name="type" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
            <option value="both">Keduanya</option>
          </select>
          <button type="submit" className="w-full bg-red-600 text-white font-medium py-2 rounded-lg text-sm">Simpan</button>
        </form>
      )}

      <ul className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
        {categories.map((c) => (
          <li key={c.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 text-xs uppercase">
                {c.name.substring(0, 2)}
              </div>
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{c.type === "both" ? "Masuk & Keluar" : c.type}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id, c.name)} className="text-gray-400 hover:text-red-500 p-2 text-sm">Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}