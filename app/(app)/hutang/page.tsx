import { getDebts, addDebt, deleteDebt, addDebtPayment, getWallets } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DebtManager from "@/components/DebtManager";

export default async function HutangPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [debts, wallets] = await Promise.all([
    getDebts(userId),
    getWallets(userId),
  ]);

  async function handleAdd(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const personName = (formData.get("personName") as string).trim();
    const type = formData.get("type") as "debt" | "loan";
    const amount = Number(formData.get("amount"));
    const dueDate = formData.get("dueDate") as string;
    const notes = (formData.get("notes") as string).trim();

    if (!personName || !amount || amount <= 0) throw new Error("Data tidak valid");

    await addDebt(session.user.id, { personName, type, amount, dueDate, notes });
    revalidatePath("/hutang");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await deleteDebt(session.user.id, formData.get("id") as string);
    revalidatePath("/hutang");
  }

  async function handlePay(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const id = formData.get("id") as string;
    const amount = Number(formData.get("amount"));
    const wallet = formData.get("wallet") as string;

    if (!wallet) return { error: "Pilih dompet dulu" };
    
    try {
      await addDebtPayment(session.user.id, id, amount, wallet);
      revalidatePath("/hutang");
      revalidatePath("/transaksi");
      revalidatePath("/");
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Hutang & Piutang</h1>
      </div>

      <DebtManager
        debts={debts}
        wallets={wallets}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onPay={handlePay}
      />
    </main>
  );
}