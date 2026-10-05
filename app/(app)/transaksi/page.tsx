import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  processRecurring,
} from "@/lib/storage";
import { revalidatePath } from "next/cache";
import FilterBar from "@/components/FilterBar";
import TransactionForm from "@/components/TransactionForm";
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    q?: string;
    type?: string;
    cat?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  await processRecurring();

  const all = await getTransactions();

  const availableMonths = Array.from(
    new Set(all.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  const activeMonth =
    params.month || availableMonths[0] || new Date().toISOString().slice(0, 7);

  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));

  const categories = Array.from(
    new Set(monthTransactions.map((t) => t.category))
  ).sort();

  const allCategories = Array.from(
    new Set(all.map((t) => t.category))
  ).sort();

  let transactions = monthTransactions;

  if (params.type && params.type !== "all") {
    transactions = transactions.filter((t) => t.type === params.type);
  }
  if (params.cat) {
    transactions = transactions.filter((t) => t.category === params.cat);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    transactions = transactions.filter(
      (t) =>
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
    );
  }

  const sort = params.sort || "newest";
  transactions = [...transactions].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.date.localeCompare(b.date);
      case "highest":
        return b.amount - a.amount;
      case "lowest":
        return a.amount - b.amount;
      default:
        return b.date.localeCompare(a.date);
    }
  });

  const grouped = transactions.reduce<Record<string, typeof transactions>>(
    (acc, t) => {
      (acc[t.date] ||= []).push(t);
      return acc;
    },
    {}
  );
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (sort === "oldest") return a.localeCompare(b);
    return b.localeCompare(a);
  });

  const hasFilter =
    params.q ||
    (params.type && params.type !== "all") ||
    params.cat ||
    (params.sort && params.sort !== "newest");

  async function handleAdd(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount"));
    if (!amount || amount <= 0) throw new Error("Invalid amount");
    await addTransaction({
      date: formData.get("date") as string,
      amount,
      type: formData.get("type") as "income" | "expense",
      category: (formData.get("category") as string).trim(),
      notes: ((formData.get("notes") as string) || "").trim(),
    });
    revalidatePath("/transaksi");
    revalidatePath("/");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteTransaction(formData.get("id") as string);
    revalidatePath("/transaksi");
    revalidatePath("/");
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-4 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Transaksi</h1>
      </div>

      <TransactionForm action={handleAdd} suggestions={allCategories} />

      {availableMonths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {availableMonths.map((m) => {
            const isActive = m === activeMonth;
            const label = new Date(m + "-01").toLocaleDateString("id-ID", {
              month: "short",
              year: "2-digit",
            });
            const sp = new URLSearchParams();
            sp.set("month", m);
            if (params.q) sp.set("q", params.q);
            if (params.type && params.type !== "all")
              sp.set("type", params.type);
            if (params.cat) sp.set("cat", params.cat);
            if (params.sort && params.sort !== "newest")
              sp.set("sort", params.sort);
            return (
              <a
                key={m}
                href={`/transaksi?${sp.toString()}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  isActive
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>
      )}

      <FilterBar categories={categories} currentMonth={activeMonth} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 rounded-full"></span>
            Riwayat
          </h2>
          {hasFilter && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {transactions.length} hasil
            </p>
          )}
        </div>

        {sortedDates.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
            <p className="text-4xl mb-2">{hasFilter ? "🔍" : "📝"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasFilter
                ? "Gak ada transaksi yang cocok"
                : "Belum ada transaksi bulan ini"}
            </p>
          </div>
        )}

        {sortedDates.map((date) => {
          const items = grouped[date];
          const dayTotal = items.reduce(
            (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
            0
          );
          return (
            <div key={date} className="space-y-2">
              <div className="flex justify-between items-baseline px-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {formatTanggal(date)}
                </p>
                <p
                  className={`text-xs font-semibold tabular-nums ${
                    dayTotal >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {dayTotal >= 0 ? "+" : ""}
                  {formatRupiah(dayTotal)}
                </p>
              </div>

              <ul className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
                {items.map((t) => (
                  <li key={t.id} className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-base shrink-0">
                      {categoryIcon(t.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {t.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {t.notes ||
                          (t.type === "income" ? "Pemasukan" : "Pengeluaran")}
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
            </div>
          );
        })}
      </section>
    </main>
  );
}