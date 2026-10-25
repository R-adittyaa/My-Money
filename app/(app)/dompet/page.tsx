import { getWallets, getTransactions, saveWallets, updateWallet, deleteWallet } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import WalletManager from "@/components/WalletManager";

export default async function DompetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [wallets, transactions] = await Promise.all([
    getWallets(userId),
    getTransactions(userId),
  ]);

  // Hitung saldo per dompet
  const walletBalances = wallets.map((w) => {
    const txs = transactions.filter((t) => t.wallet === w.name);
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const currentBalance = w.initialBalance + income - expense;
    return { ...w, currentBalance };
  });

  const totalBalance = walletBalances.reduce((sum, w) => sum + w.currentBalance, 0);

  async function handleAdd(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const name = (formData.get("name") as string).trim();
    const initialBalance = Number(formData.get("initialBalance")) || 0;
    if (!name) throw new Error("Nama wajib diisi");
    const current = await getWallets(session.user.id);
    await saveWallets(session.user.id, [...current, { id: crypto.randomUUID(), name, initialBalance }]);
    revalidatePath("/dompet");
    revalidatePath("/transaksi");
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string).trim();
    const initialBalance = Number(formData.get("initialBalance")) || 0;
    await updateWallet(session.user.id, id, name, initialBalance);
    revalidatePath("/dompet");
    revalidatePath("/transaksi");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const id = formData.get("id") as string;
    const current = await getWallets(session.user.id);
    await saveWallets(session.user.id, current.filter((w) => w.id !== id));
    revalidatePath("/dompet");
    revalidatePath("/transaksi");
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full"></span>
          <h1 className="text-lg font-bold">Dompet</h1>
        </div>
        <p className="text-xs text-gray-500">Total: Rp {totalBalance.toLocaleString("id-ID")}</p>
      </div>

      <WalletManager
        wallets={walletBalances}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </main>
  );
}