export type AccountType = "CHECKING" | "SAVINGS";

export type TransactionType = "INCOMING" | "OUTGOING" | "SELF_TRANSFER";

export interface Account {
  id: string;
  balance: number;
  account_type: AccountType;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  target_account_id: string | null;
  amount: number;
  transaction_type: TransactionType;
  category: string | null;
  institution: string | null;
  occurred_at: string;
  created_at: string;
}

// Kein DB-Table, nur für den Kontostand-Verlauf-Chart.
export interface BalanceHistoryPoint {
  date: string;
  balance: number;
}
