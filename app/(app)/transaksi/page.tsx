import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  processRecurring,
  getBudgets,
  updateTransaction,
  getCategories,
  saveCategories,
  updateCategory,
  getWallets,
  saveWallets,
  updateWallet,
} from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import FilterBar from "@/components/FilterBar";
import TransactionForm from "@/components/TransactionForm";
import TransactionDetail from "@/components/TransactionDetail";

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

  const availableMonths = Array.from(
    new Set(all.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  const activeMonth =
    params.month || availableMonths[0] || new Date().toISOString().slice(0, 7);

  const monthTransactions = all.filter((t) => t.date.startsWith(activeMonth));

  const categories = Array.from(
    new Set(monthTransactions.map((t) => t.category))
  ).sort();

  let transactions = monthTransactions;

  if (params.type && params.type !== "all") {
    transactions = transactions.filter((t) => t.type === params.type);
  }
  if (params.cat) {
    transactions = transactions.filter((t) => t.category === params.cat);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    transactions = transactions.filter(
      (t) =>
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
    );
  }

  const sort = params.sort || "newest";
  transactions = [...transactions].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.date.localeCompare(b.date);
      case "highest":
        return b.amount - a.amount;
      case "lowest":
        return a.amount - b.amount;
      default:
        return b.date.localeCompare(a.date);
    }
  });

  const grouped = transactions.reduce<Record<string, typeof transactions>>(
    (acc, t) => {
      (acc[t.date] ||= []).push(t);
      return acc;
    },
    {}
  );
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (sort === "oldest") return a.localeCompare(b);
    return b.localeCompare(a);
  });

  const hasFilter =
    params.q ||
    (params.type && params.type !== "all") ||
    params.cat ||
    (params.sort && params.sort !== "newest");

  // ==== SERVER ACTION: TAMBAH TRANSAKSI ====
  async function handleAdd(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as "income" | "expense";
    const category = (formData.get("category") as string).trim();
    const wallet = (formData.get("wallet") as string).trim();
    
    // Gabungin Tanggal & Jam
    const dateInput = formData.get("date") as string;
    const timeInput = formData.get("time") as string;
    const date = `${dateInput}T${timeInput}:00.000Z`;

    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!wallet) throw new Error("Sumber dana wajib dipilih");

    await addTransaction(session.user.id, {
      date, amount, type, category, wallet,
      notes: ((formData.get("notes") as string) || "").trim(),
    });

    // Cek Budget
    let warningMessage = "";
    if (type === "expense") {
      const budgets = await getBudgets(session.user.id);
      const budget = budgets.find((b) => b.category === category);

      if (budget) {
        const allTxs = await getTransactions(session.user.id);
        const currentMonth = dateInput.slice(0, 7);
        const spent = allTxs
          .filter((t) => t.type === "expense" && t.category === category && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + t.amount, 0);

        const pct = Math.round((spent / budget.limit) * 100);
        
        if (pct >= 100) warningMessage = `🚨 Budget ${category} sudah lewat batas! (${pct}%)`;
        else if (pct >= 80) warningMessage = `⚠️ Budget ${category} tinggal ${100 - pct}% lagi!`;
      }
    }

    revalidatePath("/transaksi");
    revalidatePath("/");
    if (warningMessage) throw new Error(warningMessage);
  }

  // ==== SERVER ACTION: HAPUS ====
  async function handleDelete(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await deleteTransaction(session.user.id, formData.get("id") as string);
    revalidatePath("/transaksi");
    revalidatePath("/");
  }

  // ==== SERVER ACTION: EDIT ====
  async function handleUpdate(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const id = formData.get("id") as string;
    const amount = Number(formData.get("amount"));
    const type = formData.get("type") as "income" | "expense";
    const category = (formData.get("category") as string).trim();
    const wallet = (formData.get("wallet") as string).trim();
    
    // Gabungin Tanggal & Jam
    const dateInput = formData.get("date") as string;
    const timeInput = formData.get("time") as string;
    const date = `${dateInput}T${timeInput}:00.000Z`;

    if (!id || !amount || !category || !wallet) throw new Error("Data tidak lengkap");

    await updateTransaction(session.user.id, id, {
      date, amount, type, category, wallet,
      notes: ((formData.get("notes") as string) || "").trim(),
    });
    revalidatePath("/transaksi");
    revalidatePath("/");
  }

  // ==== SERVER ACTION: KATEGORI ====
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

  // ==== SERVER ACTION: DOMPET ====
  async function handleAddWallet(name: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const wallets = await getWallets(session.user.id);
    await saveWallets(session.user.id, [...wallets, { id: crypto.randomUUID(), name }]);
    revalidatePath("/transaksi");
  }

  async function handleEditWallet(id: string, name: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await updateWallet(session.user.id, id, name);
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
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-4 max-w-4xl mx-auto lg:mx-0">
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
            const label = new Date(m + "-01").toLocaleDateString("id-ID", {
              month: "short",
              year: "2-digit",
            });
            const sp = new URLSearchParams();
            sp.set("month", m);
            if (params.q) sp.set("q", params.q);
            if (params.type && params.type !== "all") sp.set("type", params.type);
            if (params.cat) sp.set("cat", params.cat);
            if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
            return (
              <a
                key={m}
                href={`/transaksi?${sp.toString()}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  isActive
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>
      )}

      <FilterBar categories={categories} currentMonth={activeMonth} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 rounded-full"></span>
            Riwayat
          </h2>
          {hasFilter && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {transactions.length} hasil
            </p>
          )}
        </div>

        {sortedDates.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
            <p className="text-4xl mb-2">{hasFilter ? "🔍" : "📝"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasFilter ? "Gak ada transaksi yang cocok" : "Belum ada transaksi bulan ini"}
            </p>
          </div>
        )}

        {sortedDates.map((date) => {
          const items = grouped[date];
          const dayTotal = items.reduce(
            (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
            0
          );
          return (
            <div key={date} className="space-y-2">
              <div className="flex justify-between items-baseline px-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {formatTanggal(date)}
                </p>
                <p className={`text-xs font-semibold tabular-nums ${dayTotal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {dayTotal >= 0 ? "+" : ""}
                  {formatRupiah(dayTotal)}
                </p>
              </div>

              <ul className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm">
                {items.map((t) => (
                  <TransactionDetail
                    key={t.id}
                    transaction={t}
                    categoryIcon={categoryIcon(t.category)}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
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