import { Redis } from "@upstash/redis";
import { unstable_cache, revalidateTag } from "next/cache";
import {
  Transaction,
  TransactionInput,
  RecurringTemplate,
  RecurringTemplateInput,
  Budget,
  BudgetInput,
} from "./types";

const redis = new Redis({
  url: (process.env.UPSTASH_REDIS_REST_URL || "").trim(),
  token: (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim(),
});

const txKey = (userId: string) => `my-money:transactions:${userId}`;
const recKey = (userId: string) => `my-money:recurring:${userId}`;
const budgetKey = (userId: string) => `my-money:budgets:${userId}`;

// ============ TRANSACTIONS ============

// Ambil data pakai cache (biar pindah page gak delay)
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
  { revalidate: 60, tags: ["transactions"] } // Cache berlaku 60 detik
);

export async function saveTransactions(
  userId: string,
  items: Transaction[]
) {
  try {
    await redis.set(txKey(userId), items);
  } catch (err) {
    console.error("Redis set error:", err);
    throw err;
  }
}

export async function addTransaction(
  userId: string,
  input: TransactionInput
) {
  const items = await getTransactions(userId);
  const newItem: Transaction = {
    ...input,
    id: crypto.randomUUID(),
  };
  items.unshift(newItem);
  await saveTransactions(userId, items);
  
  revalidateTag("transactions"); // Hapus cache biar langsung update
  return newItem;
}

export async function deleteTransaction(userId: string, id: string) {
  const items = await getTransactions(userId);
  await saveTransactions(
    userId,
    items.filter((t) => t.id !== id)
  );
  
  revalidateTag("transactions"); // Hapus cache
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

export async function saveRecurring(
  userId: string,
  items: RecurringTemplate[]
) {
  try {
    await redis.set(recKey(userId), items);
  } catch (err) {
    console.error("Redis set recurring error:", err);
    throw err;
  }
}

export async function addRecurring(
  userId: string,
  input: RecurringTemplateInput
) {
  const items = await getRecurring(userId);
  const newItem: RecurringTemplate = {
    ...input,
    id: crypto.randomUUID(),
    lastGenerated: null,
  };
  items.push(newItem);
  await saveRecurring(userId, items);
  
  revalidateTag("recurring");
  return newItem;
}

export async function deleteRecurring(userId: string, id: string) {
  const items = await getRecurring(userId);
  await saveRecurring(
    userId,
    items.filter((t) => t.id !== id)
  );
  
  revalidateTag("recurring");
}

export async function toggleRecurring(
  userId: string,
  id: string,
  active: boolean
) {
  const items = await getRecurring(userId);
  const updated = items.map((t) => (t.id === id ? { ...t, active } : t));
  await saveRecurring(userId, updated);
  
  revalidateTag("recurring");
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

  revalidateTag("transactions");
  revalidateTag("recurring");

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
  
  revalidateTag("budgets");
  return newItem;
}

export async function deleteBudget(userId: string, id: string) {
  const items = await getBudgets(userId);
  await saveBudgets(
    userId,
    items.filter((b) => b.id !== id)
  );
  
  revalidateTag("budgets");
}