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