import {
  getBudgets,
  addBudget,
  deleteBudget,
  getTransactions,
  processRecurring,
} from "@/lib/storage";
import { revalidatePath } from "next/cache";
import BudgetManager from "@/components/BudgetManager";
import BudgetProgress from "@/components/BudgetProgress";

export default async function BudgetPage() {
  await processRecurring();

  const budgets = await getBudgets();
  const all = await getTransactions();

  const allCategories = Array.from(
    new Set(all.map((t) => t.category))
  ).sort();

  const now = new Date();
  const activeMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));

  const budgetStatuses = budgets.map((b) => {
    const spent = monthTransactions
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    const status: "safe" | "warning" | "over" =
      percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "safe";
    return { category: b.category, limit: b.limit, spent, percentage, status };
  });

  async function handleAdd(formData: FormData) {
    "use server";
    const limit = Number(formData.get("limit"));
    const category = (formData.get("category") as string).trim();
    if (!limit || limit <= 0) throw new Error("Invalid limit");
    if (!category) throw new Error("Invalid category");
    await addBudget({ category, limit });
    revalidatePath("/budget");
    revalidatePath("/");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteBudget(formData.get("id") as string);
    revalidatePath("/budget");
    revalidatePath("/");
  }

  const monthLabel = now.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Budget</h1>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
        Progress budget · {monthLabel}
      </p>

      {/* Progress overview */}
      {budgetStatuses.length > 0 && <BudgetProgress items={budgetStatuses} />}

      {/* Manager */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
        <BudgetManager
          budgets={budgets}
          categories={allCategories}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          Cara kerja
        </p>
        <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Budget itu <strong>per kategori</strong>, berlaku tiap bulan</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Progress dihitung dari <strong>pengeluaran bulan ini</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Warna: <span className="text-green-600 dark:text-green-400">hijau</span> &lt;80%, <span className="text-amber-600 dark:text-amber-400">kuning</span> 80-99%, <span className="text-red-600 dark:text-red-400">merah</span> ≥100%</span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500">•</span>
            <span>Kategori cuma muncul kalau udah pernah dipakai di transaksi</span>
          </li>
        </ul>
      </div>
    </main>
  );
}