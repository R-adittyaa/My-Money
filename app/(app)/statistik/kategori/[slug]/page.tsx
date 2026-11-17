import { getTransactions, getCategories } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InsightDetailClient from "@/components/InsightDetailClient";

export default async function CategoryInsightPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string; month?: string; period?: string; wallet?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categoryName = decodeURIComponent(resolvedParams.slug);
  
  // Ambil parameter filter dari URL
  const queryType = (resolvedSearchParams.type as "income" | "expense") || "expense";
  const queryMonth = resolvedSearchParams.month || new Date().toISOString().slice(0, 7);
  const queryPeriod = resolvedSearchParams.period || "monthly";
  const queryWallet = resolvedSearchParams.wallet || "all";

  const [allTransactions, categories] = await Promise.all([
    getTransactions(userId),
    getCategories(userId),
  ]);

  const categoryData = categories.find((c) => c.name === categoryName);

  // 1. FILTER BERDASARKAN PERIODE (Sama kayak di Statistik)
  let dateFiltered = allTransactions;
  const now = new Date();
  
  if (queryPeriod === "weekly") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    dateFiltered = allTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startOfWeek && tDate <= endOfWeek;
    });
  } else if (queryPeriod === "yearly") {
    const year = queryMonth.slice(0, 4);
    dateFiltered = allTransactions.filter(t => t.date.startsWith(year));
  } else {
    dateFiltered = allTransactions.filter(t => t.date.startsWith(queryMonth));
  }

  // 2. FILTER BERDASARKAN DOMPET
  let walletFiltered = dateFiltered;
  if (queryWallet !== "all") {
    walletFiltered = walletFiltered.filter(t => t.wallet === queryWallet);
  }

  // 3. FILTER BERDASARKAN KATEGORI & TIPE
  const txs = walletFiltered.filter(
    (t) => t.category === categoryName && t.type === queryType
  );

  const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = txs.length;

  // Hitung persentase (dari total pemasukan/pengeluaran di periode yang sama)
  const monthTotal = walletFiltered
    .filter((t) => t.type === queryType)
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = monthTotal > 0 ? (totalAmount / monthTotal) * 100 : 0;

  let status: "hemat" | "wajar" | "boros" = "wajar";
  let statusText = "";

  if (queryType === "expense") {
    if (percentage < 15) { status = "hemat"; statusText = "Hemat"; }
    else if (percentage > 30) { status = "boros"; statusText = "Boros"; }
    else { status = "wajar"; statusText = "Wajar"; }
  } else {
    if (percentage > 50) { status = "hemat"; statusText = "Utama"; }
    else if (percentage > 10) { status = "wajar"; statusText = "Sampingan"; }
    else { status = "boros"; statusText = "Bonus"; }
  }

  let customText = categoryData?.insightWajar;
  if (status === "hemat") customText = categoryData?.insightHemat;
  if (status === "boros") customText = categoryData?.insightBoros;

  return (
    <InsightDetailClient
      categoryName={categoryName}
      categoryType={queryType}
      totalExpense={totalAmount}
      transactionCount={transactionCount}
      status={status}
      statusText={statusText}
      customText={customText}
      transactions={txs}
      percentageOfIncome={percentage}
      monthIncome={monthTotal}
    />
  );
} 