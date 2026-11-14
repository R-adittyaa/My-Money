import { getTransactions, getCategories } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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

  const allTransactions = await getTransactions(userId);
  const categories = await getCategories(userId);

  // Cari data kategori ini (buat dapet teks kustomnya)
  const categoryData = categories.find(c => c.name === categoryName);

  // Filter transaksi khusus kategori ini
  const txs = allTransactions.filter(t => t.category === categoryName && t.type === "expense");

  const totalExpense = txs.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = txs.length;

  // Hitung "Batas Wajar" sederhana (misal: rata-rata nasional 500rb)
  // Lu bisa ubah logika ini nanti
  const limitWajar = 500000;
  const limitBoros = 1000000;

  let status: "hemat" | "wajar" | "boros" = "wajar";
  if (totalExpense < limitWajar) status = "hemat";
  else if (totalExpense > limitBoros) status = "boros";

  // Ambil teks kustom dari database, kalau gak ada pake default
  const customText = status === "hemat" ? categoryData?.insightHemat 
                   : status === "boros" ? categoryData?.insightBoros 
                   : categoryData?.insightWajar;

  return (
    <InsightDetailClient 
      categoryName={categoryName}
      totalExpense={totalExpense}
      transactionCount={transactionCount}
      status={status}
      customText={customText}
      transactions={txs}
    />
  );
}