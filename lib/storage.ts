import fs from "fs/promises";
import path from "path";
import { Transaction, TransactionInput } from "./types";

const FILE_PATH = path.join(process.cwd(), "data", "transactions.json");

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveTransactions(items: Transaction[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(items, null, 2));
}

export async function addTransaction(input: TransactionInput) {
  const items = await getTransactions();
  const newItem: Transaction = {
    ...input,
    id: crypto.randomUUID(),
  };
  items.push(newItem);
  await saveTransactions(items);
  return newItem;
}

export async function deleteTransaction(id: string) {
  const items = await getTransactions();
  await saveTransactions(items.filter((t) => t.id !== id));
}