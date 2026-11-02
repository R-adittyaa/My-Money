import { getTransactions, processRecurring } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StatisticClient from "@/components/StatisticClient";

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; period?: string; offset?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const period = params.period || "monthly";
  const offset = Number(params.offset) || 0; 
  
  await processRecurring(userId);
  const all = await getTransactions(userId);

  const availableMonths = Array.from(new Set(all.map((t) => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const activeMonth = params.month || availableMonths[0] || new Date().toISOString().slice(0, 7);

  let filteredTransactions = [];
  let periodLabel = "";

  const now = new Date();

  if (period === "weekly") {
    const targetDate = new Date(now.getTime() + offset * 7 * 24 * 60 * 60 * 1000);
    const day = targetDate.getDay();
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(targetDate.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    filteredTransactions = all.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startOfWeek && tDate <= endOfWeek;
    });

    const startLabel = startOfWeek.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const endLabel = endOfWeek.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    periodLabel = `${startLabel} - ${endLabel}`;

  } 
  else if (period === "yearly") {
    const currentYear = now.getFullYear();
    const targetYear = currentYear + offset;
    
    filteredTransactions = all.filter(t => t.date.startsWith(String(targetYear)));
    periodLabel = `Tahun ${targetYear}`;
  } 
  else {
    filteredTransactions = all.filter((t) => t.date.startsWith(activeMonth));
    periodLabel = new Date(activeMonth + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  // LOGIKA URL PANAH DIPINDAH KE SINI (SERVER-SIDE)
  let prevUrl = "";
  let nextUrl = "";

  if (period === "weekly") {
    prevUrl = `/statistik?period=weekly&offset=${offset - 1}`;
    nextUrl = `/statistik?period=weekly&offset=${offset + 1}`;
  } else if (period === "yearly") {
    prevUrl = `/statistik?period=yearly&offset=${offset - 1}`;
    nextUrl = `/statistik?period=yearly&offset=${offset + 1}`;
  } else {
    const prevDate = new Date(activeMonth + "-01");
    prevDate.setMonth(prevDate.getMonth() - 1);
    const nextDate = new Date(activeMonth + "-01");
    nextDate.setMonth(nextDate.getMonth() + 1);
    prevUrl = `/statistik?period=monthly&month=${prevDate.toISOString().slice(0, 7)}`;
    nextUrl = `/statistik?period=monthly&month=${nextDate.toISOString().slice(0, 7)}`;
  }

  return (
    <StatisticClient 
      transactions={filteredTransactions} 
      availableMonths={availableMonths}
      activeMonth={activeMonth} 
      activePeriod={period}
      periodLabel={periodLabel}
      prevUrl={prevUrl} 
      nextUrl={nextUrl} 
    />
  );
}