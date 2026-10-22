export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  notes: string;
};

export type TransactionInput = Omit<Transaction, "id">;

export type RecurringTemplate = {
  id: string;
  category: string;
  amount: number;
  type: TransactionType;
  notes: string;
  dayOfMonth: number;
  frequency: "monthly";
  lastGenerated: string | null;
  active: boolean;
};

export type RecurringTemplateInput = Omit<
  RecurringTemplate,
  "id" | "lastGenerated"
>;

export type Budget = {
  id: string;
  category: string;
  limit: number;
  createdAt: string;
};

export type BudgetInput = Omit<Budget, "id" | "createdAt">;

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
};

// === TIPE DATA BARU: TARGET TABUNGAN ===

export type GoalDeposit = {
  id: string;
  amount: number;
  date: string;
};

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  deposits: GoalDeposit[];
  createdAt: string;
};

export type GoalInput = {
  title: string;
  targetAmount: number;
};