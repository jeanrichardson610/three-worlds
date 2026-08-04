export type AccountType = "checking" | "savings" | "credit";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  accountNumberMasked: string;
  history: number[]; // trailing daily balances, oldest -> newest, for sparkline
}

export type TransactionCategory =
  | "groceries"
  | "dining"
  | "transport"
  | "shopping"
  | "income"
  | "utilities"
  | "entertainment"
  | "transfer"
  | "health"
  | "subscriptions";

export interface Transaction {
  id: string;
  date: string; // ISO date
  merchant: string;
  category: TransactionCategory;
  amount: number; // negative = debit, positive = credit
  accountId: string;
  status: "posted" | "pending";
  runningBalance?: number; // account balance immediately after this transaction
}

export interface SpendingPoint {
  month: string;
  income: number;
  spending: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
}

export interface Card {
  id: string;
  label: string;
  last4: string;
  network: "visa" | "mastercard";
  expiry: string;
  frozen: boolean;
  theme: "gold" | "midnight" | "mint";
  spendingLimit: number;
  spentThisMonth: number;
  virtualNumber: string; // full dummy PAN, only revealed on demand
}

export interface Contact {
  id: string;
  name: string;
  initials: string;
  lastSentAmount?: number;
}

export interface NetWorthPoint {
  date: string; // ISO date, monthly granularity
  netWorth: number;
  projected: boolean;
}

export type BillingCadence = "monthly" | "yearly";

export interface Subscription {
  id: string;
  name: string;
  glyph: string;
  amount: number;
  cadence: BillingCadence;
  nextChargeDate: string; // ISO date
  category: TransactionCategory;
  accountId: string;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
  spent: number;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  glyph: string;
}

export type InsightTone = "positive" | "warning" | "info";

export interface Insight {
  id: string;
  tone: InsightTone;
  headline: string;
  detail: string;
}

export interface MoneyFlowNode {
  name: string;
  color: string;
}

export interface MoneyFlowLink {
  source: number;
  target: number;
  value: number;
}

export interface MoneyFlowData {
  nodes: MoneyFlowNode[];
  links: MoneyFlowLink[];
}