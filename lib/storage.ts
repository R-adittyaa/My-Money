import { Redis } from "@upstash/redis";
import { unstable_cache, revalidateTag } from "next/cache";
import { Category } from "./types"; // Pastiin Category ada di types.ts
import {
  Transaction,
  TransactionInput,
  RecurringTemplate,
  RecurringTemplateInput,
  Budget,
  BudgetInput,
  Goal,
  GoalInput,
} from "./types";

const redis = new Redis({
  url: (process.env.UPSTASH_REDIS_REST_URL || "").trim(),
  token: (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim(),
});

const txKey = (userId: string) => `my-money:transactions:${userId}`;
const recKey = (userId: string) => `my-money:recurring:${userId}`;
const budgetKey = (userId: string) => `my-money:budgets:${userId}`;
const goalKey = (userId: string) => `my-money:goals:${userId}`;

// ============ TRANSACTIONS ============

export const getTransactions = unstable_cache(
  async (userId: string): Promise<Transaction[]> => {
    try {
      const data = await redis.get<Transaction[]>(txKey(userId));
      return data || [];
    } catch (err) {
      console.error("Redis get error:", err);
      return [];
    }
  },
  ["transactions-cache"],
  { revalidate: 60, tags: ["transactions"] }
);

export async function saveTransactions(userId: string, items: Transaction[]) {
  try {
    await redis.set(txKey(userId), items);
  } catch (err) {
    console.error("Redis set error:", err);
    throw err;
  }
}

export async function addTransaction(userId: string, input: TransactionInput) {
  const items = await getTransactions(userId);
  const newItem: Transaction = { ...input, id: crypto.randomUUID() };
  items.unshift(newItem);
  await saveTransactions(userId, items);
  revalidateTag("transactions", "max");
  return newItem;
}

export async function deleteTransaction(userId: string, id: string) {
  const items = await getTransactions(userId);
  await saveTransactions(userId, items.filter((t) => t.id !== id));
  revalidateTag("transactions", "max");
}

// Tambahkan di lib/storage.ts (di bawah deleteTransaction)
export async function updateTransaction(
  userId: string,
  id: string,
  input: TransactionInput
) {
  const items = await getTransactions(userId);
  const updated = items.map((t) =>
    t.id === id ? { ...t, ...input } : t
  );
  await saveTransactions(userId, updated);
  revalidateTag("transactions", "max");
}

// ============ RECURRING ============

export const getRecurring = unstable_cache(
  async (userId: string): Promise<RecurringTemplate[]> => {
    try {
      const data = await redis.get<RecurringTemplate[]>(recKey(userId));
      return data || [];
    } catch (err) {
      console.error("Redis get recurring error:", err);
      return [];
    }
  },
  ["recurring-cache"],
  { revalidate: 60, tags: ["recurring"] }
);

export async function saveRecurring(userId: string, items: RecurringTemplate[]) {
  try {
    await redis.set(recKey(userId), items);
  } catch (err) {
    console.error("Redis set recurring error:", err);
    throw err;
  }
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
      console.error("Redis get budgets error:", err);
      return [];
    }
  },
  ["budgets-cache"],
  { revalidate: 60, tags: ["budgets"] }
);

export async function saveBudgets(userId: string, items: Budget[]) {
  try {
    await redis.set(budgetKey(userId), items);
  } catch (err) {
    console.error("Redis set budgets error:", err);
    throw err;
  }
}

export async function addBudget(userId: string, input: BudgetInput) {
  const items = await getBudgets(userId);
  const filtered = items.filter((b) => b.category !== input.category);
  const newItem: Budget = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
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

// ============ GOALS (TARGET TABUNGAN) ============

export const getGoals = unstable_cache(
  async (userId: string): Promise<Goal[]> => {
    try {
      const data = await redis.get<Goal[]>(goalKey(userId));
      return data || [];
    } catch (err) {
      console.error("Redis get goals error:", err);
      return [];
    }
  },
  ["goals-cache"],
  { revalidate: 60, tags: ["goals"] }
);

export async function saveGoals(userId: string, items: Goal[]) {
  try {
    await redis.set(goalKey(userId), items);
  } catch (err) {
    console.error("Redis set goals error:", err);
    throw err;
  }
}

export async function addGoal(userId: string, input: GoalInput) {
  const items = await getGoals(userId);
  const newItem: Goal = {
    ...input,
    id: crypto.randomUUID(),
    deposits: [],
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
        deposits: [
          ...g.deposits,
          { id: crypto.randomUUID(), amount, date: new Date().toISOString().slice(0, 10) },
        ],
      };
    }
    return g;
  });
  await saveGoals(userId, updated);
  revalidateTag("goals", "max");
}

// === KATEGORI ===
const catKey = (userId: string) => `my-money:categories:${userId}`;

export const getCategories = unstable_cache(
  async (userId: string): Promise<Category[]> => {
    try {
      const data = await redis.get<Category[]>(catKey(userId));
      // Default kategori kalo baru pertama kali pake
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