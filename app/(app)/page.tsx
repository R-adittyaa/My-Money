import {
  getTransactions,
  deleteTransaction,
  processRecurring,
  getBudgets,
} from "@/lib/storage";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import CategoryChart from "@/components/CategoryChart";
import BudgetProgress from "@/components/BudgetProgress";
import DeleteButton from "@/components/DeleteButton";

function categoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("makan") || c.includes("food") || c.includes("kopi")) return "🍔";
  if (c.includes("transport") || c.includes("bensin") || c.includes("ojek")) return "🚗";
  if (c.includes("belanja") || c.includes("shop")) return "🛍️";
  if (c.includes("gaji") || c.includes("salary") || c.includes("bonus")) return "💼";
  if (c.includes("listrik") || c.includes("air") || c.includes("internet") || c.includes("tagihan")) return "💡";
  if (c.includes("kesehatan") || c.includes("obat") || c.includes("dokter")) return "💊";
  if (c.includes("hiburan") || c.includes("nonton") || c.includes("game")) return "🎮";
  if (c.includes("pendidikan") || c.includes("buku") || c.includes("kursus")) return "📚";
  if (c.includes("rumah") || c.includes("sewa")) return "🏠";
  return "💵";
}

function formatRupiah(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
}

function formatTanggal(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  await processRecurring();

  const [all, budgets] = await Promise.all([
  getTransactions(),
  getBudgets(),
]);

  const now = new Date();
  const activeMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = Object.entries(
    monthTransactions
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const budgetStatuses = budgets.map((b) => {
    const spent = monthTransactions
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    const status: "safe" | "warning" | "over" =
      percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "safe";
    return { category: b.category, limit: b.limit, spent, percentage, status };
  });

  const recentTransactions = [...all]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const avgDailyExpense = totalExpense / daysInMonth;

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteTransaction(formData.get("id") as string);
    revalidatePath("/");
  }

  const monthLabel = now.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      {/* HERO SALDO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-5 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-black/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest opacity-80">
            Saldo · {monthLabel}
          </p>
          <p className="text-3xl sm:text-4xl font-bold mt-1 tabular-nums">
            {formatRupiah(balance)}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] opacity-80 uppercase tracking-wide">
                ↓ Pemasukan
              </p>
              <p className="text-sm sm:text-base font-semibold mt-1 tabular-nums">
                {formatRupiah(totalIncome)}
              </p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] opacity-80 uppercase tracking-wide">
                ↑ Pengeluaran
              </p>
              <p className="text-sm sm:text-base font-semibold mt-1 tabular-nums">
                {formatRupiah(totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Rata-rata / hari
          </p>
          <p className="text-sm font-semibold mt-1 tabular-nums">
            {formatRupiah(Math.round(avgDailyExpense))}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Transaksi
          </p>
          <p className="text-sm font-semibold mt-1 tabular-nums">
            {monthTransactions.length}x
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Rasio hemat
          </p>
          <p
            className={`text-sm font-semibold mt-1 tabular-nums ${
              totalIncome > 0 && balance / totalIncome >= 0.2
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {totalIncome > 0
              ? Math.round((balance / totalIncome) * 100) + "%"
              : "—"}
          </p>
        </div>
      </div>

      {/* BUDGET PROGRESS */}
      {budgetStatuses.length > 0 && <BudgetProgress items={budgetStatuses} />}

      {/* CHART PENGELUARAN */}
      {expenseByCategory.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-red-600 rounded-full"></span>
              <h2 className="font-semibold text-sm">Pengeluaran</h2>
            </div>
            <Link
              href="/statistik"
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Lihat detail →
            </Link>
          </div>
          <CategoryChart data={expenseByCategory} />
        </div>
      )}

      {/* TRANSAKSI TERBARU */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 rounded-full"></span>
            <h2 className="font-semibold text-sm">Transaksi Terbaru</h2>
          </div>
          <Link
            href="/transaksi"
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada transaksi
            </p>
            <Link
              href="/transaksi"
              className="inline-block mt-3 text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              + Tambah Transaksi
            </Link>
          </div>
        ) : (
          <ul className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
            {recentTransactions.map((t) => (
              <li key={t.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-base shrink-0">
                  {categoryIcon(t.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{t.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {formatTanggal(t.date)}
                    {t.notes && ` · ${t.notes}`}
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
                <DeleteButton
                  id={t.id}
                  category={t.category}
                  action={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}