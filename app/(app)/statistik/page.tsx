import { getTransactions, processRecurring } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StatisticClient from "@/components/StatisticClient";

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  await processRecurring(userId);
  const all = await getTransactions(userId);

  const availableMonths = Array.from(new Set(all.map((t) => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const activeMonth = params.month || availableMonths[0] || new Date().toISOString().slice(0, 7);
  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));

  const monthLabel = new Date(activeMonth + "-01").toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <StatisticClient 
      transactions={monthTransactions} 
      monthLabel={monthLabel} 
      activeMonth={activeMonth} 
    />
  );
}