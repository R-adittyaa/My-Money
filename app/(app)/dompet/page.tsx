import { getWallets, getTransactions, saveWallets, updateWallet, deleteWallet } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import WalletManager from "@/components/WalletManager";

export default async function DompetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; new?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeMonth = params.month || defaultMonth;
  const isNew = params.new === "true"; // <-- Baca URL

  const [wallets, allTransactions] = await Promise.all([
    getWallets(userId),
    getTransactions(userId),
  ]);

  const monthTransactions = allTransactions.filter((t) => t.date.startsWith(activeMonth));

  const walletBalances = wallets.map((w) => {
    const txsThisMonth = allTransactions.filter(
      (t) => t.wallet === w.name && t.date.startsWith(activeMonth)
    );
    const incomeThisMonth = txsThisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenseThisMonth = txsThisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const startBalance = 0;
    const currentBalance = startBalance + incomeThisMonth - expenseThisMonth;
    return { ...w, initialBalance: startBalance, currentBalance };
  });

  const totalBalance = walletBalances.reduce((sum, w) => sum + w.currentBalance, 0);

  const availableMonths = Array.from(new Set(allTransactions.map((t) => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  if (!availableMonths.includes(defaultMonth)) availableMonths.unshift(defaultMonth);

  async function handleAdd(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const name = (formData.get("name") as string).trim();
    const initialBalance = Number(formData.get("initialBalance")) || 0;
    if (!name) return { error: "Nama wajib diisi" };
    
    const current = await getWallets(session.user.id);
    await saveWallets(session.user.id, [...current, { id: crypto.randomUUID(), name, initialBalance }]);
    revalidatePath("/dompet");
    revalidatePath("/transaksi");
    return { success: true };
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string).trim();
    const initialBalance = Number(formData.get("initialBalance")) || 0;
    await updateWallet(session.user.id, id, name, initialBalance);
    revalidatePath("/dompet");
    revalidatePath("/transaksi");
    return { success: true };
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const id = formData.get("id") as string;
    await deleteWallet(session.user.id, id);
    revalidatePath("/dompet");
    revalidatePath("/transaksi");
    return { success: true };
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full"></span>
          <h1 className="text-lg font-bold">Dompet</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-gray-500 tracking-wider">Total Mutasi ({new Date(activeMonth + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })})</p>
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100 tabular-nums">Rp {totalBalance.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {availableMonths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {availableMonths.slice(0, 12).map((m) => {
            const isActive = m === activeMonth;
            const label = new Date(m + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
            return (
              <Link key={m} href={`/dompet?month=${m}`} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${isActive ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400"}`}>
                {label}
              </Link>
            );
          })}
        </div>
      )}

      <WalletManager
        wallets={walletBalances}
        monthTransactions={monthTransactions}
        activeMonth={activeMonth}
        isNew={isNew} // <-- Kirim Prop
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </main>
  );
}