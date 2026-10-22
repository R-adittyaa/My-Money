type AlertItem = {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
};

export default function BudgetAlert({ items }: { items: AlertItem[] }) {
  // Filter cuma yang udah >= 80%
  const criticalItems = items.filter((b) => b.percentage >= 80);

  if (criticalItems.length === 0) return null;

  const hasOver = criticalItems.some((b) => b.percentage >= 100);

  return (
    <div
      className={`rounded-2xl border p-4 space-y-2 shadow-sm ${
        hasOver
          ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
          : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{hasOver ? "🚨" : "⚠️"}</span>
        <h3
          className={`font-semibold text-sm ${
            hasOver
              ? "text-red-700 dark:text-red-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {hasOver ? "Budget Terlewati!" : "Hati-hati, Budget Menipis"}
        </h3>
      </div>
      <ul className="space-y-1.5 pl-7">
        {criticalItems.map((b) => (
          <li key={b.category} className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{b.category}</span> udah kepake{" "}
            <span className="font-semibold">{b.percentage}%</span> (Rp{" "}
            {b.spent.toLocaleString("id-ID")} dari Rp{" "}
            {b.limit.toLocaleString("id-ID")})
          </li>
        ))}
      </ul>
    </div>
  );
}