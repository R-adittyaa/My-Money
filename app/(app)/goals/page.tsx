import {
  getGoals,
  addGoal,
  deleteGoal,
  addGoalDeposit,
  withdrawGoal,
} from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import GoalManager from "@/components/GoalManager";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const goals = await getGoals(userId);

  async function handleAdd(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const title = (formData.get("title") as string).trim();
    const targetAmount = Number(formData.get("targetAmount"));
    if (!title || targetAmount <= 0) return { error: "Data tidak valid" };
    
    await addGoal(session.user.id, { title, targetAmount });
    revalidatePath("/goals");
    return { success: true };
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    await deleteGoal(session.user.id, formData.get("id") as string);
    revalidatePath("/goals");
    return { success: true };
  }

  async function handleDeposit(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const goalId = formData.get("goalId") as string;
    const amount = Number(formData.get("amount"));
    if (amount <= 0) return { error: "Nominal harus lebih dari 0" };
    
    await addGoalDeposit(session.user.id, goalId, amount);
    revalidatePath("/goals");
    return { success: true };
  }

  // BAGIAN INI YANG KITA BENERIN
  async function handleWithdraw(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    
    const goalId = formData.get("goalId") as string;
    const amount = Number(formData.get("amount"));
    
    if (amount <= 0) return { error: "Nominal harus lebih dari 0" };

    // Cek saldo dulu
    const goals = await getGoals(session.user.id);
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      const collected = goal.deposits.reduce((sum, d) => sum + d.amount, 0) - 
                        (goal.withdrawals || []).reduce((sum, w) => sum + w.amount, 0);
      
      // Kalo lebih besar, balikin ERROR (bukan throw)
      if (amount > collected) {
        return { error: `Saldo tabungan gak cukup! Sisa cuma Rp ${collected.toLocaleString("id-ID")}` };
      }
    } else {
      return { error: "Target tidak ditemukan" };
    }

    await withdrawGoal(session.user.id, goalId, amount);
    revalidatePath("/goals");
    return { success: true };
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Target Tabungan</h1>
      </div>

      <GoalManager
        goals={goals}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />
    </main>
  );
}