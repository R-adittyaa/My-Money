import {
  getRecurring,
  addRecurring,
  deleteRecurring,
  toggleRecurring,
  processRecurring,
  getTransactions,
} from "@/lib/storage";
import { revalidatePath } from "next/cache";
import RecurringManager from "@/components/RecurringManager";
import ProcessRecurringButton from "@/components/ProcessRecurringButton";

function formatRupiah(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
}

export default async function BerulangPage() {
  await processRecurring();

  const [templates, all] = await Promise.all([
  getRecurring(),
  getTransactions(),
]);

  const allCategories = Array.from(
    new Set(all.map((t) => t.category))
  ).sort();

  const activeCount = templates.filter((t) => t.active).length;

  async function handleAdd(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount"));
    const dayOfMonth = Number(formData.get("dayOfMonth"));
    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31) {
      throw new Error("Invalid day");
    }
    await addRecurring({
      category: (formData.get("category") as string).trim(),
      amount,
      type: formData.get("type") as "income" | "expense",
      notes: ((formData.get("notes") as string) || "").trim(),
      dayOfMonth,
      frequency: "monthly",
      active: true,
    });
    revalidatePath("/berulang");
    revalidatePath("/");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteRecurring(formData.get("id") as string);
    revalidatePath("/berulang");
    revalidatePath("/");
  }

  async function handleToggle(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const active = formData.get("active") === "1";
    await toggleRecurring(id, active);
    revalidatePath("/berulang");
    revalidatePath("/");
  }

  async function handleProcess(): Promise<number> {
    "use server";
    const count = await processRecurring();
    revalidatePath("/berulang");
    revalidatePath("/");
    return count;
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full"></span>
          <h1 className="text-lg font-bold">Berulang</h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {activeCount} aktif dari {templates.length}
        </p>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
        Template transaksi otomatis — cocok buat gaji, sewa, langganan
      </p>

      {/* Stats */}
      {templates.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-4 text-white shadow-sm">
            <p className="text-[10px] uppercase tracking-widest opacity-80">
              ↓ Pemasukan / bulan
            </p>
            <p className="text-base font-bold mt-1 tabular-nums">
              {formatRupiah(
                templates
                  .filter((t) => t.active && t.type === "income")
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-4 text-white shadow-sm">
            <p className="text-[10px] uppercase tracking-widest opacity-80">
              ↑ Pengeluaran / bulan
            </p>
            <p className="text-base font-bold mt-1 tabular-nums">
              {formatRupiah(
                templates
                  .filter((t) => t.active && t.type === "expense")
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Manager */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <RecurringManager
          templates={templates}
          suggestions={allCategories}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
        {templates.length > 0 && (
          <ProcessRecurringButton action={handleProcess} />
        )}
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          Cara kerja
        </p>
        <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Template otomatis jalan tiap bulan di tanggal yang ditentukan</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Generate otomatis pas kamu buka app, atau klik <strong>Generate Sekarang</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Toggle <span className="text-green-600 dark:text-green-400">hijau</span> = aktif, <span className="text-gray-500">abu-abu</span> = nonaktif</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Template yang <strong>nonaktif</strong> gak bakal auto-generate</span>
          </li>
        </ul>
      </div>
    </main>
  );
}