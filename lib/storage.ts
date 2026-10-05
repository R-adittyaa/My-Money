import { Redis } from "@upstash/redis";
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

const TX_KEY = "my-money:transactions";
const REC_KEY = "my-money:recurring";
const BUDGET_KEY = "my-money:budgets";

// ============ TRANSACTIONS ============

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await redis.get<Transaction[]>(TX_KEY);
    return data || [];
  } catch (err) {
    console.error("Redis get error:", err);
    return [];
  }
}

export async function saveTransactions(items: Transaction[]) {
  try {
    await redis.set(TX_KEY, items);
  } catch (err) {
    console.error("Redis set error:", err);
    throw err;
  }
}

export async function addTransaction(input: TransactionInput) {
  const items = await getTransactions();
  const newItem: Transaction = {
    ...input,
    id: crypto.randomUUID(),
  };
  items.unshift(newItem);
  await saveTransactions(items);
  return newItem;
}

export async function deleteTransaction(id: string) {
  const items = await getTransactions();
  await saveTransactions(items.filter((t) => t.id !== id));
}

// ============ RECURRING ============

export async function getRecurring(): Promise<RecurringTemplate[]> {
  try {
    const data = await redis.get<RecurringTemplate[]>(REC_KEY);
    return data || [];
  } catch (err) {
    console.error("Redis get recurring error:", err);
    return [];
  }
}

export async function saveRecurring(items: RecurringTemplate[]) {
  try {
    await redis.set(REC_KEY, items);
  } catch (err) {
    console.error("Redis set recurring error:", err);
    throw err;
  }
}

export async function addRecurring(input: RecurringTemplateInput) {
  const items = await getRecurring();
  const newItem: RecurringTemplate = {
    ...input,
    id: crypto.randomUUID(),
    lastGenerated: null,
  };
  items.push(newItem);
  await saveRecurring(items);
  return newItem;
}

export async function deleteRecurring(id: string) {
  const items = await getRecurring();
  await saveRecurring(items.filter((t) => t.id !== id));
}

export async function toggleRecurring(id: string, active: boolean) {
  const items = await getRecurring();
  const updated = items.map((t) => (t.id === id ? { ...t, active } : t));
  await saveRecurring(updated);
}

/**
 * Optimized: fetch semua data SEKALI, process di memory, save SEKALI.
 */
export async function processRecurring(): Promise<number> {
  const [templates, transactions] = await Promise.all([
    getRecurring(),
    getTransactions(),
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

  // Simpan sekali doang — paralel
  const allTemplates = templates.map((t) => {
    const updated = updatedTemplates.find((u) => u.id === t.id);
    return updated || t;
  });

  await Promise.all([
    saveTransactions([...newTransactions, ...transactions]),
    saveRecurring(allTemplates),
  ]);

  return generated;
}

// ============ BUDGETS ============

export async function getBudgets(): Promise<Budget[]> {
  try {
    const data = await redis.get<Budget[]>(BUDGET_KEY);
    return data || [];
  } catch (err) {
    console.error("Redis get budgets error:", err);
    return [];
  }
}

export async function saveBudgets(items: Budget[]) {
  try {
    await redis.set(BUDGET_KEY, items);
  } catch (err) {
    console.error("Redis set budgets error:", err);
    throw err;
  }
}

export async function addBudget(input: BudgetInput) {
  const items = await getBudgets();
  const filtered = items.filter((b) => b.category !== input.category);
  const newItem: Budget = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  filtered.push(newItem);
  await saveBudgets(filtered);
  return newItem;
}

export async function deleteBudget(id: string) {
  const items = await getBudgets();
  await saveBudgets(items.filter((b) => b.id !== id));
}