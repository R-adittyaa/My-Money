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

  // Cari data kategori ini (buat dapet teks kustomnya)
  const categoryData = categories.find((c) => c.name === categoryName);

  // Filter transaksi khusus kategori ini (pengeluaran)
  const txs = allTransactions.filter(
    (t) => t.category === categoryName && t.type === "expense"
  );

  const totalExpense = txs.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = txs.length;

  // --- LOGIKA BARU: Berbasis Persentase dari Total Pemasukan ---
  // Kita ambil bulan dari transaksi terbaru di kategori ini (fallback: bulan ini)
  const latestTxDate = txs.length > 0 ? txs[0].date : new Date().toISOString();
  const activeMonth = latestTxDate.slice(0, 7);

  // Cari total pemasukan di bulan yang sama
  const monthIncome = allTransactions
    .filter((t) => t.type === "income" && t.date.startsWith(activeMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Hitung persentase
  const percentageOfIncome = monthIncome > 0 ? (totalExpense / monthIncome) * 100 : 0;

  // Tentukan Status (Threshold: Hemat < 15%, Wajar 15-30%, Boros > 30%)
  let status: "hemat" | "wajar" | "boros" = "wajar";
  if (percentageOfIncome < 15) status = "hemat";
  else if (percentageOfIncome > 30) status = "boros";

  // Teks kustom dari database
  const customText =
    status === "hemat"
      ? categoryData?.insightHemat
      : status === "boros"
        ? categoryData?.insightBoros
        : categoryData?.insightWajar;

  return (
    <InsightDetailClient
      categoryName={categoryName}
      totalExpense={totalExpense}
      transactionCount={transactionCount}
      status={status}
      customText={customText}
      transactions={txs}
      percentageOfIncome={percentageOfIncome}
      monthIncome={monthIncome}
    />
  );
}