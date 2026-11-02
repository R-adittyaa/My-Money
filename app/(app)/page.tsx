import {
  getTransactions,
  deleteTransaction,
  processRecurring,
  getBudgets,
  updateTransaction,
} from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import CategoryChart from "@/components/CategoryChart"; // Pastiin pake ChartKlien kalau udah diganti
import BudgetProgress from "@/components/BudgetProgress";
import BudgetAlert from "@/components/BudgetAlert";
import BalanceDisplay from "@/components/BalanceDisplay";
import TransactionDetail from "@/components/TransactionDetail";
import ShareDashboardButton from "@/components/ShareDashboardButton";

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  await processRecurring(userId);

  const [all, budgets] = await Promise.all([
    getTransactions(userId),
    getBudgets(userId),
  ]);

  // LOGIKA NAVIGASI BULAN
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeMonth = params.month || defaultMonth;

  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));

  // Hitung total
  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Statistik lainnya
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
    Number(activeMonth.slice(0, 4)),
    Number(activeMonth.slice(5, 7)),
    0
  ).getDate();
  const avgDailyExpense = totalExpense / daysInMonth;

  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await deleteTransaction(session.user.id, formData.get("id") as string);
    revalidatePath("/");
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const id = formData.get("id") as string;
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as "income" | "expense";
    const category = (formData.get("category") as string).trim();
    const wallet = (formData.get("wallet") as string)?.trim() || "Tunai";
    const date = formData.get("date") as string;

    if (!id || !amount || !category) throw new Error("Data tidak lengkap");

    await updateTransaction(session.user.id, id, {
      date, amount, type, category, wallet,
      notes: ((formData.get("notes") as string) || "").trim(),
    });
    revalidatePath("/");
  }

  const monthLabel = new Date(activeMonth + "-01").toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Logika tombol panah Kiri & Kanan
  const prevMonth = new Date(activeMonth + "-01");
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStr = prevMonth.toISOString().slice(0, 7);

  const nextMonth = new Date(activeMonth + "-01");
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().slice(0, 7);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0 pb-24">
      {budgetStatuses.length > 0 && <BudgetAlert items={budgetStatuses} />}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-5 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-black/10 blur-3xl" />
        
        <ShareDashboardButton balance={balance} income={totalIncome} expense={totalExpense} monthLabel={monthLabel} />

        <div className="relative">
          {/* NAVIGASI BULAN DI SINI */}
          <div className="flex items-center gap-3 mb-1">
            <Link 
              href={`/?month=${prevMonthStr}`} 
              className="p-1 rounded-full hover:bg-white/20 transition text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            
            <p className="text-xs uppercase tracking-widest opacity-90 font-medium">
              Saldo · {monthLabel}
            </p>

            <Link 
              href={`/?month=${nextMonthStr}`} 
              className="p-1 rounded-full hover:bg-white/20 transition text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>

          <BalanceDisplay
            balance={balance}
            income={totalIncome}
            expense={totalExpense}
          />
        </div>
      </div>

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

      {budgetStatuses.length > 0 && <BudgetProgress items={budgetStatuses} />}

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
              <TransactionDetail
                key={t.id}
                transaction={t}
                categoryIcon={categoryIcon(t.category)}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}