import {
  getTransactions, addTransaction, deleteTransaction,
  processRecurring, getBudgets, updateTransaction,
  getCategories, saveCategories, updateCategory,
  getWallets, saveWallets, updateWallet,
  deleteMultipleTransactions // <-- Import fungsi baru
} from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import FilterBar from "@/components/FilterBar";
import TransactionForm from "@/components/TransactionForm";
import TransactionDetail from "@/components/TransactionDetail";
import BulkActionBar from "@/components/BulkActionBar"; // <-- Komponen baru

function categoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("makan") || c.includes("food") || c.includes("kopi")) return "🍔";
  if (c.includes("transport") || c.includes("bensin") || c.includes("ojek")) return "🚗";
  if (c.includes("belanja") || c.includes("shop")) return "🛍️";
  if (c.includes("gaji") || c.includes("salary") || c.includes("bonus")) return "💼";
  if (c.includes("listrik") || c.includes("air") || c.includes("internet") || c.includes("tagihan")) return "💡";
  if (c.includes("kesehatan") || c.includes("obat") || c.includes("dokter")) return "💊";
  if (c.includes("hiburan") || c.includes("nonton") || c.includes("game")) return "🎮";
  if (c.includes("pendidikan") || c.includes("buku") || c.includes("kursus")) return "📚";
  if (c.includes("rumah") || c.includes("sewa")) return "🏠";
  return "💵";
}

function formatRupiah(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "Rp " + Math.abs(n).toLocaleString("id-ID");
}

function formatTanggal(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    q?: string;
    type?: string;
    cat?: string;
    sort?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  await processRecurring(userId);

  const all = await getTransactions(userId);
  const dbCategories = await getCategories(userId);
  const dbWallets = await getWallets(userId);

  const availableMonths = Array.from(new Set(all.map((t) => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const activeMonth = params.month || availableMonths[0] || new Date().toISOString().slice(0, 7);
  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));
  const categories = Array.from(new Set(monthTransactions.map((t) => t.category))).sort();

  let transactions = monthTransactions;
  if (params.type && params.type !== "all") transactions = transactions.filter((t) => t.type === params.type);
  if (params.cat) transactions = transactions.filter((t) => t.category === params.cat);
  if (params.q) {
    const q = params.q.toLowerCase();
    transactions = transactions.filter((t) => t.category.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q));
  }

  const sort = params.sort || "newest";
  transactions = [...transactions].sort((a, b) => {
    switch (sort) {
      case "oldest": return a.date.localeCompare(b.date);
      case "highest": return b.amount - a.amount;
      case "lowest": return a.amount - b.amount;
      default: return b.date.localeCompare(a.date);
    }
  });

  const grouped = transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
    const dateOnly = t.date.slice(0, 10); 
    (acc[dateOnly] ||= []).push(t);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (sort === "oldest") return a.localeCompare(b);
    return b.localeCompare(a);
  });

  const hasFilter = params.q || (params.type && params.type !== "all") || params.cat || (params.sort && params.sort !== "newest");

  const totalMonthIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalMonthExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  async function handleAdd(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as "income" | "expense";
    const category = (formData.get("category") as string).trim();
    const wallet = (formData.get("wallet") as string).trim();
    const dateInput = formData.get("date") as string;
    const timeInput = formData.get("time") as string;
    const date = `${dateInput}T${timeInput}:00.000Z`;

    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!wallet) throw new Error("Sumber dana wajib dipilih");

    await addTransaction(session.user.id, { date, amount, type, category, wallet, notes: ((formData.get("notes") as string) || "").trim() });

    let warningMessage = "";
    if (type === "expense") {
      const budgets = await getBudgets(session.user.id);
      const budget = budgets.find((b) => b.category === category);
      if (budget) {
        const allTxs = await getTransactions(session.user.id);
        const currentMonth = dateInput.slice(0, 7);
        const spent = allTxs.filter((t) => t.type === "expense" && t.category === category && t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);
        const pct = Math.round((spent / budget.limit) * 100);
        if (pct >= 100) warningMessage = `🚨 Budget ${category} sudah lewat batas! (${pct}%)`;
        else if (pct >= 80) warningMessage = `⚠️ Budget ${category} tinggal ${100 - pct}% lagi!`;
      }
    }
    revalidatePath("/transaksi"); revalidatePath("/");
    if (warningMessage) throw new Error(warningMessage);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await deleteTransaction(session.user.id, formData.get("id") as string);
    revalidatePath("/transaksi"); revalidatePath("/");
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const id = formData.get("id") as string;
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as "income" | "expense";
    const category = (formData.get("category") as string).trim();
    const wallet = (formData.get("wallet") as string).trim();
    const dateInput = formData.get("date") as string;
    const timeInput = formData.get("time") as string;
    const date = `${dateInput}T${timeInput}:00.000Z`;

    if (!id || !amount || !category || !wallet) throw new Error("Data tidak lengkap");
    await updateTransaction(session.user.id, id, { date, amount, type, category, wallet, notes: ((formData.get("notes") as string) || "").trim() });
    revalidatePath("/transaksi"); revalidatePath("/");
  }

  async function handleBulkDelete(ids: string[]) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await deleteMultipleTransactions(session.user.id, ids);
    revalidatePath("/transaksi"); revalidatePath("/");
  }

  async function handleAddCategory(name: string, type: "income" | "expense") {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const cats = await getCategories(session.user.id);
    await saveCategories(session.user.id, [...cats, { id: crypto.randomUUID(), name, type }]);
    revalidatePath("/transaksi");
  }

  async function handleEditCategory(id: string, name: string, type: "income" | "expense") {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await updateCategory(session.user.id, id, name, type);
    revalidatePath("/transaksi");
  }

  async function handleDeleteCategory(id: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const cats = await getCategories(session.user.id);
    await saveCategories(session.user.id, cats.filter((c) => c.id !== id));
    revalidatePath("/transaksi");
  }

  async function handleAddWallet(name: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const wallets = await getWallets(session.user.id);
    await saveWallets(session.user.id, [...wallets, { id: crypto.randomUUID(), name, initialBalance: 0 }]);
    revalidatePath("/transaksi");
  }

  async function handleEditWallet(id: string, name: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const wallets = await getWallets(session.user.id);
    const target = wallets.find(w => w.id === id);
    await updateWallet(session.user.id, id, name, target?.initialBalance || 0);
    revalidatePath("/transaksi");
  }

  async function handleDeleteWallet(id: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const wallets = await getWallets(session.user.id);
    await saveWallets(session.user.id, wallets.filter((w) => w.id !== id));
    revalidatePath("/transaksi");
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-4 max-w-4xl mx-auto lg:mx-0 pb-24">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Transaksi</h1>
      </div>

      <TransactionForm
        action={handleAdd}
        categories={dbCategories}
        wallets={dbWallets}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddWallet={handleAddWallet}
        onEditWallet={handleEditWallet}
        onDeleteWallet={handleDeleteWallet}
      />

      {availableMonths.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {availableMonths.map((m) => {
            const isActive = m === activeMonth;
            const label = new Date(m + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
            const sp = new URLSearchParams();
            sp.set("month", m);
            if (params.q) sp.set("q", params.q);
            if (params.type && params.type !== "all") sp.set("type", params.type);
            if (params.cat) sp.set("cat", params.cat);
            if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
            return (
              <a key={m} href={`/transaksi?${sp.toString()}`} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${isActive ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400"}`}>
                {label}
              </a>
            );
          })}
        </div>
      )}

      <FilterBar categories={categories} currentMonth={activeMonth} />

      <section className="space-y-6 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 rounded-full"></span>
            Riwayat
          </h2>
          {hasFilter && <p className="text-xs text-gray-500 dark:text-gray-400">{transactions.length} hasil</p>}
        </div>

        {sortedDates.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
            <p className="text-4xl mb-2">{hasFilter ? "🔍" : "📝"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{hasFilter ? "Gak ada transaksi yang cocok" : "Belum ada transaksi bulan ini"}</p>
          </div>
        )}

        <BulkActionBar onBulkDelete={handleBulkDelete} />

        {sortedDates.map((date) => {
          const items = grouped[date];
          const dayIncome = items.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
          const dayExpense = items.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
          const dayNet = dayIncome - dayExpense;

          return (
            <div key={date} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatTanggal(date)}</p>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium">
                  {dayIncome > 0 && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md">+{formatRupiah(dayIncome)}</span>}
                  {dayIncome > 0 && dayExpense > 0 && <span className="text-gray-400">/</span>}
                  {dayExpense > 0 && <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-md">-{formatRupiah(dayExpense)}</span>}
                  <span className={`px-2.5 py-1 rounded-md font-bold shadow-sm ${dayNet >= 0 ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>= {formatRupiah(dayNet)}</span>
                </div>
              </div>

              <ul className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
                {items.map((t) => (
                  <TransactionDetail
                    key={t.id}
                    transaction={t}
                    categoryIcon={categoryIcon(t.category)}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    // Props Multi Select
                    isSelecting={false}
                    isSelected={false}
                    onToggleSelect={() => {}}
                    onStartSelecting={() => {}}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}