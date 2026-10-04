export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;        // format "2026-10-04"
  amount: number;      // selalu positif, tipe yang nentuin masuk/keluar
  type: TransactionType;
  category: string;    // "Makan", "Transport", "Gaji", dll
  notes: string;
};

export type TransactionInput = Omit<Transaction, "id">;