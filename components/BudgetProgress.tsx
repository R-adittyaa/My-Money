type BudgetStatus = {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  status: "safe" | "warning" | "over";
};

type Props = {
  items: BudgetStatus[];
};

export default function BudgetProgress({ items }: Props) {
  if (items.length === 0) return null;

  const totalLimit = items.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = items.reduce((sum, b) => sum + b.spent, 0);
  const totalPercentage =
    totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Budget Bulan Ini</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {totalPercentage}%
        </p>
      </div>

      {/* Summary bar */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-300 tabular-nums">
            <span className="font-semibold">
              Rp {totalSpent.toLocaleString("id-ID")}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              {" "}
              / {totalLimit.toLocaleString("id-ID")}
            </span>
          </p>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              totalPercentage >= 100
                ? "bg-red-500"
                : totalPercentage >= 80
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Per kategori */}
      <ul className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
        {items.map((b) => (
          <li key={b.category}>
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {b.category}
              </p>
              <p className="text-[10px] tabular-nums">
                <span
                  className={
                    b.status === "over"
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : b.status === "warning"
                        ? "text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-gray-500 dark:text-gray-400"
                  }
                >
                  {b.percentage}%
                </span>
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  b.status === "over"
                    ? "bg-red-500"
                    : b.status === "warning"
                      ? "bg-amber-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${Math.min(b.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                Rp {b.spent.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                Rp {b.limit.toLocaleString("id-ID")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}