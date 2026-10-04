import { getTransactions, addTransaction, deleteTransaction } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import CategoryChart from "@/components/CategoryChart";
import FilterBar from "@/components/FilterBar";
import AmountInput from "@/components/AmountInput";
import CategoryInput from "@/components/CategoryInput";

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

export default async function Home({
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

  const daysInMonth = new Date(
    Number(activeMonth.slice(0, 4)),
    Number(activeMonth.slice(5, 7)),
    0
  ).getDate();
  const avgDailyExpense = totalExpense / daysInMonth;

  const hasFilter =
    params.q ||
    (params.type && params.type !== "all") ||
    params.cat ||
    (params.sort && params.sort !== "newest");

  async function handleAdd(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount"));
    if (!amount || amount <= 0) return;

    await addTransaction({
      date: formData.get("date") as string,
      amount,
      type: formData.get("type") as "income" | "expense",
      category: (formData.get("category") as string).trim(),
      notes: ((formData.get("notes") as string) || "").trim(),
    });
    revalidatePath("/");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await deleteTransaction(formData.get("id") as string);
    revalidatePath("/");
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              Rp
            </div>
            <h1 className="text-base font-bold">
              My<span className="text-red-600 dark:text-red-500">Money</span>
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {all.length} transaksi tercatat
          </p>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 lg:self-start space-y-4">
          <form
            action={handleAdd}
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

            <CategoryInput name="category" suggestions={allCategories} />

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
              <kbd className="px-1 rounded bg-gray-100 dark:bg-gray-800">
                Enter
              </kbd>{" "}
              di kolom manapun untuk simpan
            </p>
          </form>
        </aside>

        {/* MAIN */}
        <main className="lg:col-span-6 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-5 sm:p-6 text-white shadow-lg">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-black/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs uppercase tracking-widest opacity-80">
                Saldo ·{" "}
                {new Date(activeMonth + "-01").toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
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
                    href={`/?${sp.toString()}`}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Rata-rata / hari
              </p>
              <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-gray-100 tabular-nums">
                {formatRupiah(Math.round(avgDailyExpense))}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Transaksi
              </p>
              <p className="text-sm font-semibold mt-1 text-gray-900 dark:text-gray-100 tabular-nums">
                {transactions.length}x
                {hasFilter && (
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    / {monthTransactions.length}
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm col-span-2 sm:col-span-1">
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
                {hasFilter && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Coba ubah atau reset filter
                  </p>
                )}
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
                              (t.type === "income"
                                ? "Pemasukan"
                                : "Pengeluaran")}
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
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            type="submit"
                            className="text-gray-300 hover:text-red-500 text-xs transition p-1"
                            aria-label="Hapus"
                          >
                            ✕
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </main>

        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-red-600 rounded-full"></span>
              <h2 className="font-semibold text-sm">Pengeluaran</h2>
            </div>
            <CategoryChart data={expenseByCategory} />
          </div>

          {expenseByCategory.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-4 text-white shadow-sm">
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                Top Kategori
              </p>
              <ul className="mt-3 space-y-2">
                {expenseByCategory.slice(0, 3).map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="text-base">
                      {["🥇", "🥈", "🥉"][i]}
                    </span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-semibold tabular-nums">
                      Rp {c.value.toLocaleString("id-ID")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}