import { Redis } from "@upstash/redis";
import { unstable_cache, revalidateTag } from "next/cache";
import {
  Transaction, TransactionInput,
  RecurringTemplate, RecurringTemplateInput,
  Budget, BudgetInput,
  Category, Goal, GoalInput, Wallet, Debt, DebtInput
} from "./types";

const redis = new Redis({
  url: (process.env.UPSTASH_REDIS_REST_URL || "").trim(),
  token: (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim(),
});

const txKey = (userId: string) => `my-money:transactions:${userId}`;
const recKey = (userId: string) => `my-money:recurring:${userId}`;
const budgetKey = (userId: string) => `my-money:budgets:${userId}`;
const catKey = (userId: string) => `my-money:categories:${userId}`;
const goalKey = (userId: string) => `my-money:goals:${userId}`;
const walletKey = (userId: string) => `my-money:wallets:${userId}`;
const debtKey = (userId: string) => `my-money:debts:${userId}`;

// ============ TRANSACTIONS ============

export const getTransactions = unstable_cache(
  async (userId: string): Promise<Transaction[]> => {
    try {
      const data = await redis.get<Transaction[]>(txKey(userId));
      return data || [];
    } catch (err) {
      return [];
    }
  },
  ["transactions-cache"],
  { revalidate: 60, tags: ["transactions"] }
);

export async function saveTransactions(userId: string, items: Transaction[]) {
  await redis.set(txKey(userId), items);
}

export async function addTransaction(userId: string, input: TransactionInput) {
  const items = await getTransactions(userId);
  const newItem: Transaction = { ...input, id: crypto.randomUUID() };
  items.unshift(newItem);
  await saveTransactions(userId, items);
  revalidateTag("transactions", "max");
  return newItem;
}

export async function updateTransaction(userId: string, id: string, input: TransactionInput) {
  const items = await getTransactions(userId);
  const updated = items.map((t) => (t.id === id ? { ...t, ...input } : t));
  await saveTransactions(userId, updated);
  revalidateTag("transactions", "max");
}

export async function deleteTransaction(userId: string, id: string) {
  const items = await getTransactions(userId);
  await saveTransactions(userId, items.filter((t) => t.id !== id));
  revalidateTag("transactions", "max");
}

// ============ RECURRING ============

export const getRecurring = unstable_cache(
  async (userId: string): Promise<RecurringTemplate[]> => {
    try {
      const data = await redis.get<RecurringTemplate[]>(recKey(userId));
      return data || [];
    } catch (err) {
      return [];
    }
  },
  ["recurring-cache"],
  { revalidate: 60, tags: ["recurring"] }
);

export async function saveRecurring(userId: string, items: RecurringTemplate[]) {
  await redis.set(recKey(userId), items);
}

export async function addRecurring(userId: string, input: RecurringTemplateInput) {
  const items = await getRecurring(userId);
  const newItem: RecurringTemplate = { ...input, id: crypto.randomUUID(), lastGenerated: null };
  items.push(newItem);
  await saveRecurring(userId, items);
  revalidateTag("recurring", "max");
  return newItem;
}

export async function deleteRecurring(userId: string, id: string) {
  const items = await getRecurring(userId);
  await saveRecurring(userId, items.filter((t) => t.id !== id));
  revalidateTag("recurring", "max");
}

export async function toggleRecurring(userId: string, id: string, active: boolean) {
  const items = await getRecurring(userId);
  const updated = items.map((t) => (t.id === id ? { ...t, active } : t));
  await saveRecurring(userId, updated);
  revalidateTag("recurring", "max");
}

export async function processRecurring(userId: string): Promise<number> {
  const [templates, transactions] = await Promise.all([
    getRecurring(userId),
    getTransactions(userId),
  ]);
  const activeTemplates = templates.filter((t) => t.active);
  if (activeTemplates.length === 0) return 0;

  const now = new Date();
  const today = now.getDate();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let generated = 0;
  const newTransactions: Transaction[] = [];
  const updatedTemplates: RecurringTemplate[] = [];

  for (const tpl of activeTemplates) {
    if (tpl.lastGenerated === currentMonth || tpl.dayOfMonth > today) {
      updatedTemplates.push(tpl);
      continue;
    }
    const dateStr = `${currentMonth}-${String(tpl.dayOfMonth).padStart(2, "0")}`;
    newTransactions.unshift({
      id: crypto.randomUUID(),
      date: dateStr,
      amount: tpl.amount,
      type: tpl.type,
      category: tpl.category,
      notes: tpl.notes || "(berulang)",
      wallet: "Tunai",
    });
    updatedTemplates.push({ ...tpl, lastGenerated: currentMonth });
    generated++;
  }

  if (generated === 0) return 0;

  const allTemplates = templates.map((t) => {
    const updated = updatedTemplates.find((u) => u.id === t.id);
    return updated || t;
  });

  await Promise.all([
    saveTransactions(userId, [...newTransactions, ...transactions]),
    saveRecurring(userId, allTemplates),
  ]);

  revalidateTag("transactions", "max");
  revalidateTag("recurring", "max");
  return generated;
}

// ============ BUDGETS ============

export const getBudgets = unstable_cache(
  async (userId: string): Promise<Budget[]> => {
    try {
      const data = await redis.get<Budget[]>(budgetKey(userId));
      return data || [];
    } catch (err) {
      return [];
    }
  },
  ["budgets-cache"],
  { revalidate: 60, tags: ["budgets"] }
);

export async function saveBudgets(userId: string, items: Budget[]) {
  await redis.set(budgetKey(userId), items);
}

export async function addBudget(userId: string, input: BudgetInput) {
  const items = await getBudgets(userId);
  const filtered = items.filter((b) => b.category !== input.category);
  const newItem: Budget = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  filtered.push(newItem);
  await saveBudgets(userId, filtered);
  revalidateTag("budgets", "max");
  return newItem;
}

export async function deleteBudget(userId: string, id: string) {
  const items = await getBudgets(userId);
  await saveBudgets(userId, items.filter((b) => b.id !== id));
  revalidateTag("budgets", "max");
}

// ============ CATEGORIES ============

export const getCategories = unstable_cache(
  async (userId: string): Promise<Category[]> => {
    try {
      const data = await redis.get<Category[]>(catKey(userId));
      if (!data || data.length === 0) {
        const defaults: Category[] = [
          { id: crypto.randomUUID(), name: "Makan", type: "expense" },
          { id: crypto.randomUUID(), name: "Transport", type: "expense" },
          { id: crypto.randomUUID(), name: "Belanja", type: "expense" },
          { id: crypto.randomUUID(), name: "Tagihan", type: "expense" },
          { id: crypto.randomUUID(), name: "Hiburan", type: "expense" },
          { id: crypto.randomUUID(), name: "Gaji", type: "income" },
        ];
        await redis.set(catKey(userId), defaults);
        return defaults;
      }
      return data;
    } catch (err) {
      return [];
    }
  },
  ["categories-cache"],
  { revalidate: 60, tags: ["categories"] }
);

export async function saveCategories(userId: string, items: Category[]) {
  await redis.set(catKey(userId), items);
  revalidateTag("categories", "max");
}

export async function updateCategory(userId: string, id: string, name: string, type: "income" | "expense" | "both") {
  const cats = await getCategories(userId);
  const updated = cats.map((c) => (c.id === id ? { ...c, name, type } : c));
  await saveCategories(userId, updated);
}

// ============ GOALS ============

export const getGoals = unstable_cache(
  async (userId: string): Promise<Goal[]> => {
    try {
      const data = await redis.get<Goal[]>(goalKey(userId));
      return data || [];
    } catch (err) {
      return [];
    }
  },
  ["goals-cache"],
  { revalidate: 60, tags: ["goals"] }
);

export async function saveGoals(userId: string, items: Goal[]) {
  await redis.set(goalKey(userId), items);
}

export async function addGoal(userId: string, input: GoalInput) {
  const items = await getGoals(userId);
  const newItem: Goal = {
    ...input,
    id: crypto.randomUUID(),
    deposits: [],
    withdrawals: [],
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  await saveGoals(userId, items);
  revalidateTag("goals", "max");
  return newItem;
}

export async function deleteGoal(userId: string, id: string) {
  const items = await getGoals(userId);
  await saveGoals(userId, items.filter((g) => g.id !== id));
  revalidateTag("goals", "max");
}

export async function addGoalDeposit(userId: string, goalId: string, amount: number) {
  const items = await getGoals(userId);
  const updated = items.map((g) => {
    if (g.id === goalId) {
      return {
        ...g,
        deposits: [...g.deposits, { id: crypto.randomUUID(), amount, date: new Date().toISOString() }],
      };
    }
    return g;
  });
  await saveGoals(userId, updated);
  revalidateTag("goals", "max");
}

export async function withdrawGoal(userId: string, goalId: string, amount: number) {
  const items = await getGoals(userId);
  const updated = items.map((g) => {
    if (g.id === goalId) {
      return {
        ...g,
        withdrawals: [...(g.withdrawals || []), { id: crypto.randomUUID(), amount, date: new Date().toISOString() }],
      };
    }
    return g;
  });
  await saveGoals(userId, updated);
  revalidateTag("goals", "max");
}

// ============ WALLETS ============

export const getWallets = unstable_cache(
  async (userId: string): Promise<Wallet[]> => {
    try {
      const data = await redis.get<Wallet[]>(walletKey(userId));
      if (!data || data.length === 0) {
        const defaults: Wallet[] = [
          { id: crypto.randomUUID(), name: "Tunai", initialBalance: 0 },
          { id: crypto.randomUUID(), name: "Bank", initialBalance: 0 },
          { id: crypto.randomUUID(), name: "E-Wallet", initialBalance: 0 },
        ];
        await redis.set(walletKey(userId), defaults);
        return defaults;
      }
      return data;
    } catch (err) {
      return [];
    }
  },
  ["wallets-cache"],
  { revalidate: 60, tags: ["wallets"] }
);

export async function saveWallets(userId: string, items: Wallet[]) {
  await redis.set(walletKey(userId), items);
  revalidateTag("wallets", "max");
}

export async function updateWallet(userId: string, id: string, name: string, initialBalance: number) {
  const wallets = await getWallets(userId);
  const updated = wallets.map((w) => (w.id === id ? { ...w, name, initialBalance } : w));
  await saveWallets(userId, updated);
}

export async function deleteWallet(userId: string, id: string) {
  const wallets = await getWallets(userId);
  await saveWallets(userId, wallets.filter((w) => w.id !== id));
}

// ============ DEBTS (HUTANG & PIUTANG) ============

export const getDebts = unstable_cache(
  async (userId: string): Promise<Debt[]> => {
    try {
      const data = await redis.get<Debt[]>(debtKey(userId));
      return data || [];
    } catch (err) {
      return [];
    }
  },
  ["debts-cache"],
  { revalidate: 60, tags: ["debts"] }
);

export async function saveDebts(userId: string, items: Debt[]) {
  await redis.set(debtKey(userId), items);
  revalidateTag("debts", "max");
}

export async function addDebt(userId: string, input: DebtInput) {
  const items = await getDebts(userId);
  const newItem: Debt = {
    ...input,
    id: crypto.randomUUID(),
    isPaid: false,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  await saveDebts(userId, items);
  return newItem;
}

export async function deleteDebt(userId: string, id: string) {
  const items = await getDebts(userId);
  await saveDebts(userId, items.filter((d) => d.id !== id));
}

export async function settleDebt(userId: string, id: string, walletName: string) {
  const items = await getDebts(userId);
  const debt = items.find((d) => d.id === id);
  if (!debt || debt.isPaid) throw new Error("Hutang tidak ditemukan atau sudah lunas");

  const updated = items.map((d) => (d.id === id ? { ...d, isPaid: true } : d));
  await saveDebts(userId, updated);

  const txType = debt.type === "debt" ? "expense" : "income";
  
  await addTransaction(userId, {
    date: new Date().toISOString(),
    amount: debt.amount,
    type: txType,
    category: debt.type === "debt" ? "Bayar Utang" : "Terima Piutang",
    wallet: walletName,
    notes: `Pelunasan ${debt.type === "debt" ? "hutang ke" : "piutang dari"} ${debt.personName}`,
  });
}