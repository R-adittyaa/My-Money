import { getTransactions, getCategories } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InsightDetailClient from "@/components/InsightDetailClient";

export default async function CategoryInsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.slug);

  const [allTransactions, categories] = await Promise.all([
    getTransactions(userId),
    getCategories(userId),
  ]);

  const categoryData = categories.find((c) => c.name === categoryName);
  
  // Cek tipe kategori ini (income/expense)
  const categoryType = categoryData?.type || "expense";

  // Filter transaksi khusus kategori ini
  const txs = allTransactions.filter(
    (t) => t.category === categoryName && t.type === categoryType
  );

  const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = txs.length;

  // Ambil bulan dari transaksi terbaru (fallback: bulan ini)
  const latestTxDate = txs.length > 0 ? txs[0].date : new Date().toISOString();
  const activeMonth = latestTxDate.slice(0, 7);

  // Hitung total pemasukan/pengeluaran sebulan (sesuai tipe)
  const monthTotal = allTransactions
    .filter((t) => t.type === categoryType && t.date.startsWith(activeMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Hitung persentase porsi
  const percentage = monthTotal > 0 ? (totalAmount / monthTotal) * 100 : 0;

  let status: "hemat" | "wajar" | "boros" = "wajar";
  let statusText = "";

  if (categoryType === "expense") {
    // LOGIKA PENGELUARAN
    if (percentage < 15) { status = "hemat"; statusText = "Hemat"; }
    else if (percentage > 30) { status = "boros"; statusText = "Boros"; }
    else { status = "wajar"; statusText = "Wajar"; }
  } else {
    // LOGIKA PEMASUKAN
    if (percentage > 50) { status = "hemat"; statusText = "Utama"; }
    else if (percentage > 10) { status = "wajar"; statusText = "Sampingan"; }
    else { status = "boros"; statusText = "Bonus"; }
  }

  // Ambil teks kustom dari database (mapping beda buat income)
  let customText = categoryData?.insightWajar;
  if (categoryType === "expense") {
    if (status === "hemat") customText = categoryData?.insightHemat;
    if (status === "boros") customText = categoryData?.insightBoros;
  } else {
    // Untuk Income: hemat = Utama, boros = Bonus
    if (status === "hemat") customText = categoryData?.insightHemat;
    if (status === "boros") customText = categoryData?.insightBoros;
  }

  return (
    <InsightDetailClient
      categoryName={categoryName}
      categoryType={categoryType}
      totalExpense={totalAmount} // Ganti nama jadi totalAmount aja biar netral
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