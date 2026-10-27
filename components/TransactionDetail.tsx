"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import DeleteButton from "./DeleteButton";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  notes: string;
  wallet?: string;
};

type Props = {
  transaction: Transaction;
  categoryIcon: string;
  onDelete: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  // Dibikin opsional (?) biar Dashboard gak wajib ngirim
  isSelecting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onStartSelecting?: (id: string) => void;
};

export default function TransactionDetail({
  transaction: t,
  categoryIcon,
  onDelete,
  onUpdate,
  isSelecting = false, // Default value
  isSelected = false,
  onToggleSelect,
  onStartSelecting,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  function handlePressStart() {
    if (isSelecting) return; 
    pressTimer.current = setTimeout(() => {
      if (onStartSelecting) onStartSelecting(t.id); 
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    }, 400);
  }

  function handlePressEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  function handleClick() {
    if (isSelecting) {
      if (onToggleSelect) onToggleSelect(t.id);
    } else {
      setIsOpen(true);
    }
  }

  useEffect(() => {
    return () => { if (pressTimer.current) clearTimeout(pressTimer.current); };
  }, []);

  const formatRupiah = (n: number) => {
    const sign = n < 0 ? "-" : "";
    return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
  };

  const formatTanggal = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  };

  async function handleEditSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await onUpdate(formData);
      toast.success("Transaksi berhasil diupdate");
      setIsEditing(false);
      setIsOpen(false);
    } catch (err) {
      toast.error("Gagal update transaksi");
    } finally {
      setIsPending(false);
    }
  }

  function closeModal() {
    setIsOpen(false);
    setTimeout(() => setIsEditing(false), 300);
  }

  return (
    <>
      <li
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()} 
        className={`p-3 flex items-center gap-3 cursor-pointer select-none transition-colors relative ${
          isSelected ? "bg-red-50 dark:bg-red-950/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`}
      >
        {isSelecting && (
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
            isSelected ? "bg-red-500 border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}>
            {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
        )}

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-base shrink-0">
          {categoryIcon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{t.category}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {t.notes || (t.type === "income" ? "Pemasukan" : "Pengeluaran")}
          </p>
        </div>
        <p className={`text-sm font-semibold whitespace-nowrap tabular-nums ${
          t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        }`}>
          {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
        </p>
      </li>

      {/* MODAL DETAIL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {!isEditing ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl mb-3">
                    {categoryIcon}
                  </div>
                  <h3 className="text-lg font-bold">{t.category}</h3>
                  <p className={`text-2xl font-bold mt-1 tabular-nums ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                  </p>
                </div>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tipe</span>
                    <span className="font-medium capitalize">{t.type === "income" ? "Pemasukan" : "Pengeluaran"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Dompet</span>
                    <span className="font-medium">{t.wallet || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Waktu</span>
                    <span className="font-medium text-right">{formatTanggal(t.date)}</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-500 dark:text-gray-400 mb-1">Catatan</span>
                    <span className="font-medium whitespace-pre-wrap leading-relaxed">{t.notes || "-"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    Edit
                  </button>
                  <div className="flex-1">
                    <DeleteButton id={t.id} category={t.category} action={async (fd) => { closeModal(); await onDelete(fd); }} />
                  </div>
                </div>
              </>
            ) : (
              <form ref={formRef} action={handleEditSubmit} className="space-y-4">
                <input type="hidden" name="id" value={t.id} />
                <h3 className="font-bold text-lg mb-2">Edit Transaksi</h3>

                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="expense" defaultChecked={t.type === "expense"} className="peer sr-only" />
                    <div className="rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-red-600 peer-checked:text-white transition">↓ Keluar</div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="income" defaultChecked={t.type === "income"} className="peer sr-only" />
                    <div className="rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 peer-checked:bg-green-600 peer-checked:text-white transition">↑ Masuk</div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input name="date" type="date" defaultValue={t.date.slice(0, 10)} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                  <input name="time" type="time" defaultValue={new Date(t.date).toLocaleTimeString("id-ID", { hour12: false, hour: "2-digit", minute: "2-digit" })} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                </div>

                <input name="amount" type="number" min="0" step="any" defaultValue={t.amount} required placeholder="Jumlah" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                <input name="category" defaultValue={t.category} required placeholder="Kategori" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                <input name="wallet" defaultValue={t.wallet || "Tunai"} required placeholder="Dompet" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                <input name="notes" defaultValue={t.notes} placeholder="Catatan (opsional)" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">Batal</button>
                  <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition disabled:opacity-50">
                    {isPending ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}