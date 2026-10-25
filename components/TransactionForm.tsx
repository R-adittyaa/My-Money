"use client";

import { toast } from "sonner";
import { useRef, useTransition, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import AmountInput from "./AmountInput";
import CategoryModal from "./CategoryModal";
import WalletModal from "./WalletModal";

type Category = { id: string; name: string; type: "income" | "expense" | "both" };
type Wallet = { id: string; name: string };

type Props = {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  wallets: Wallet[];
  onAddCategory: (name: string, type: "income" | "expense") => Promise<void>;
  onEditCategory: (id: string, name: string, type: "income" | "expense") => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddWallet: (name: string) => Promise<void>;
  onEditWallet: (id: string, name: string) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending || disabled} 
      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
    >
      {pending ? "Menyimpan..." : "Simpan Transaksi"}
    </button>
  );
}

export default function TransactionForm({ 
  action, categories, wallets, 
  onAddCategory, onEditCategory, onDeleteCategory,
  onAddWallet, onEditWallet, onDeleteWallet
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  // State buat Date & Time biar otomatis ngikutin
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Pas pertama kali render, set jam & tanggal sekarang
  useEffect(() => {
    const now = new Date();
    // Format YYYY-MM-DD
    setCurrentDate(now.toISOString().slice(0, 10));
    // Format HH:mm
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setCurrentTime(`${hh}:${mm}`);
  }, [formKey]); // <-- Setiap formKey berubah (abis simpan), jam di-refresh lagi

  function onSubmit(formData: FormData) {
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as string;

    startTransition(async () => {
      try {
        await action(formData);
        toast.success(`Transaksi tersimpan!`, { description: `Rp ${amount.toLocaleString("id-ID")}` });
        setFormKey((prev) => prev + 1);
        setSelectedCategory("");
        setSelectedWallet("");
      } catch (err: any) {
        if (err.message && err.message.includes("Budget")) {
          toast.error(err.message, { duration: 5000 });
          setFormKey((prev) => prev + 1);
          setSelectedCategory("");
          setSelectedWallet("");
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

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input 
              name="date" 
              type="date" 
              required 
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" 
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Jam <span className="text-red-500">*</span>
            </label>
            <input 
              name="time" 
              type="time" 
              required 
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Tipe <span className="text-red-500">*</span>
          </label>
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
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Nominal <span className="text-red-500">*</span>
          </label>
          <AmountInput name="amount" required />
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Kategori <span className="text-red-500">*</span>
          </label>
          <input type="hidden" name="category" value={selectedCategory} />
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-left flex justify-between items-center transition ${
              selectedCategory ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-medium" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-400"
            }`}
          >
            <span>{selectedCategory || "Pilih Kategori..."}</span>
            <span className="text-xs opacity-50">▼</span>
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Sumber Dana <span className="text-red-500">*</span>
          </label>
          <input type="hidden" name="wallet" value={selectedWallet} />
          <button
            type="button"
            onClick={() => setIsWalletModalOpen(true)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-left flex justify-between items-center transition ${
              selectedWallet ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-medium" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-400"
            }`}
          >
            <span>{selectedWallet || "Pilih Dompet..."}</span>
            <span className="text-xs opacity-50">▼</span>
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Catatan <span className="text-gray-400 dark:text-gray-500">(opsional)</span>
          </label>
          <input name="notes" placeholder="Misal: Makan siang di warteg" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
        </div>

        <SubmitButton disabled={!selectedCategory || !selectedWallet} />
      </form>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelect={(name) => setSelectedCategory(name)}
        onAdd={onAddCategory}
        onEdit={onEditCategory}
        onDelete={onDeleteCategory}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={wallets}
        onSelect={(name) => setSelectedWallet(name)}
        onAdd={onAddWallet}
        onEdit={onEditWallet}
        onDelete={onDeleteWallet}
      />
    </>
  );
}