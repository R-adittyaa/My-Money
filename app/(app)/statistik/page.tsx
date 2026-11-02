import { getTransactions, processRecurring } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StatisticClient from "@/components/StatisticClient";

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; period?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const period = params.period || "monthly";
  
  await processRecurring(userId);
  const all = await getTransactions(userId);

  const availableMonths = Array.from(new Set(all.map((t) => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const activeMonth = params.month || availableMonths[0] || new Date().toISOString().slice(0, 7);

  let filteredTransactions = [];
  const now = new Date();

  if (period === "weekly") {
    // 7 hari terakhir
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredTransactions = all.filter(t => new Date(t.date) >= sevenDaysAgo);
  } 
  else if (period === "yearly") {
    // Tahun dari activeMonth
    const year = activeMonth.slice(0, 4);
    filteredTransactions = all.filter(t => t.date.startsWith(year));
  } 
  else {
    // Bulanan (default)
    filteredTransactions = all.filter((t) => t.date.startsWith(activeMonth));
  }

  return (
    <StatisticClient 
      transactions={filteredTransactions} 
      availableMonths={availableMonths}
      activeMonth={activeMonth} 
      activePeriod={period}
    />
  );
}