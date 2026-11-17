import { getTransactions, getCategories } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InsightDetailClient from "@/components/InsightDetailClient";

export default async function CategoryInsightPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categoryName = decodeURIComponent(resolvedParams.slug);
  // Paksa tipe dari URL, kalau gak ada baru cari di database
  const queryType = resolvedSearchParams.type as "income" | "expense" | undefined;

  const [allTransactions, categories] = await Promise.all([
    getTransactions(userId),
    getCategories(userId),
  ]);

  const categoryData = categories.find((c) => c.name === categoryName);
  const categoryType = queryType || categoryData?.type || "expense";

  // Filter transaksi KHUSUS tipe yang diklik
  const txs = allTransactions.filter(
    (t) => t.category === categoryName && t.type === categoryType
  );

  const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = txs.length;

  const latestTxDate = txs.length > 0 ? txs[0].date : new Date().toISOString();
  const activeMonth = latestTxDate.slice(0, 7);

  const monthTotal = allTransactions
    .filter((t) => t.type === categoryType && t.date.startsWith(activeMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage = monthTotal > 0 ? (totalAmount / monthTotal) * 100 : 0;

  let status: "hemat" | "wajar" | "boros" = "wajar";
  let statusText = "";

  if (categoryType === "expense") {
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
      categoryType={categoryType}
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