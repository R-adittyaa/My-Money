import { getTransactions, processRecurring } from "@/lib/storage";
import CategoryChart from "@/components/CategoryChart";

function formatRupiah(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
}

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
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

  const daysInMonth = new Date(
    Number(activeMonth.slice(0, 4)),
    Number(activeMonth.slice(5, 7)),
    0
  ).getDate();
  const avgDailyExpense = totalExpense / daysInMonth;
  const avgPerTransaction =
    monthTransactions.length > 0
      ? totalExpense / monthTransactions.length
      : 0;

  const topCategory = expenseByCategory[0];

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Statistik</h1>
      </div>

      {/* Filter bulan */}
      {availableMonths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {availableMonths.map((m) => {
            const isActive = m === activeMonth;
            const label = new Date(m + "-01").toLocaleDateString("id-ID", {
              month: "short",
              year: "2-digit",
            });
            return (
              <a
                key={m}
                href={`/statistik?month=${m}`}
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

      {/* Highlight cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Pemasukan
          </p>
          <p className="text-sm font-semibold mt-1 text-green-600 dark:text-green-400 tabular-nums">
            {formatRupiah(totalIncome)}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Pengeluaran
          </p>
          <p className="text-sm font-semibold mt-1 text-red-600 dark:text-red-400 tabular-nums">
            {formatRupiah(totalExpense)}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Saldo
          </p>
          <p
            className={`text-sm font-semibold mt-1 tabular-nums ${
              balance >= 0
                ? "text-gray-900 dark:text-gray-100"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatRupiah(balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            Rata-rata / transaksi
          </p>
          <p className="text-sm font-semibold mt-1 tabular-nums">
            {formatRupiah(Math.round(avgPerTransaction))}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Kategori terboros
          </p>
          <p className="text-sm font-semibold mt-1 truncate">
            {topCategory ? topCategory.name : "—"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Pengeluaran per Kategori</h2>
        </div>
        <CategoryChart data={expenseByCategory} />
      </div>

      {/* List ranking */}
      {expenseByCategory.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-4 bg-red-600 rounded-full"></span>
            <h2 className="font-semibold text-sm">Ranking Kategori</h2>
          </div>
          <ul className="space-y-3">
            {expenseByCategory.map((c, i) => {
              const pct =
                totalExpense > 0
                  ? Math.round((c.value / totalExpense) * 100)
                  : 0;
              return (
                <li key={c.name}>
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs font-medium">
                      <span className="text-gray-400 dark:text-gray-500 mr-1.5">
                        {i + 1}.
                      </span>
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatRupiah(c.value)}
                      </span>{" "}
                      · {pct}%
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {expenseByCategory.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada data pengeluaran bulan ini
          </p>
        </div>
      )}
    </main>
  );
}