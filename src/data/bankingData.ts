import type {
  Account,
  Budget,
  Card,
  CategoryBreakdown,
  Contact,
  Goal,
  Insight,
  MoneyFlowData,
  NetWorthPoint,
  SpendingPoint,
  Subscription,
  Transaction,
} from "@/types/banking";

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildHistory(seed: number, base: number, points = 30, drift = 0.4) {
  const rnd = seededRandom(seed);
  const history: number[] = [];
  let current = base * (1 - drift * 0.5);
  for (let i = 0; i < points; i++) {
    current += (base * drift) / points + (rnd() - 0.5) * base * 0.02;
    history.push(Math.round(current * 100) / 100);
  }
  history[history.length - 1] = base;
  return history;
}

export const accounts: Account[] = [
  {
    id: "acc-checking",
    name: "Everyday Checking",
    type: "checking",
    balance: 8412.55,
    currency: "USD",
    accountNumberMasked: "•••• 4471",
    history: buildHistory(11, 8412.55, 30, 0.2),
  },
  {
    id: "acc-savings",
    name: "High-Yield Savings",
    type: "savings",
    balance: 24980.12,
    currency: "USD",
    accountNumberMasked: "•••• 9902",
    history: buildHistory(23, 24980.12, 30, 0.35),
  },
  {
    id: "acc-credit",
    name: "Rewards Credit",
    type: "credit",
    balance: -1284.3,
    currency: "USD",
    accountNumberMasked: "•••• 1187",
    history: buildHistory(37, -1284.3, 30, -0.6),
  },
];

export const cards: Card[] = [
  {
    id: "card-1",
    label: "Everyday Checking",
    last4: "4471",
    network: "visa",
    expiry: "09/29",
    frozen: false,
    theme: "midnight",
    spendingLimit: 5000,
    spentThisMonth: 1840.32,
    virtualNumber: "4539 1488 0343 4471",
  },
  {
    id: "card-2",
    label: "Rewards Credit",
    last4: "1187",
    network: "mastercard",
    expiry: "02/28",
    frozen: false,
    theme: "gold",
    spendingLimit: 8000,
    spentThisMonth: 3120.5,
    virtualNumber: "5412 7534 8890 1187",
  },
  {
    id: "card-3",
    label: "Travel Card",
    last4: "5560",
    network: "visa",
    expiry: "11/27",
    frozen: true,
    theme: "mint",
    spendingLimit: 3000,
    spentThisMonth: 412.1,
    virtualNumber: "4916 2039 7712 5560",
  },
];

const merchants: { merchant: string; category: Transaction["category"] }[] = [
  { merchant: "Trader Joe's", category: "groceries" },
  { merchant: "Blue Bottle Coffee", category: "dining" },
  { merchant: "Uber", category: "transport" },
  { merchant: "Amazon", category: "shopping" },
  { merchant: "Payroll Deposit", category: "income" },
  { merchant: "PG&E Electric", category: "utilities" },
  { merchant: "Netflix", category: "subscriptions" },
  { merchant: "Transfer to Savings", category: "transfer" },
  { merchant: "CVS Pharmacy", category: "health" },
  { merchant: "Whole Foods", category: "groceries" },
  { merchant: "Chipotle", category: "dining" },
  { merchant: "Shell Gas", category: "transport" },
  { merchant: "Spotify", category: "subscriptions" },
  { merchant: "AMC Theatres", category: "entertainment" },
];

const rand = seededRandom(42);

function buildTransactions(): Transaction[] {
  const list: Transaction[] = [];
  const today = new Date();
  for (let i = 0; i < 34; i++) {
    const pick = merchants[Math.floor(rand() * merchants.length)];
    const date = new Date(today);
    date.setDate(today.getDate() - Math.floor(rand() * 30));
    const isIncome = pick.category === "income";
    const amount = isIncome
      ? Math.round((2400 + rand() * 400) * 100) / 100
      : -Math.round((6 + rand() * 180) * 100) / 100;
    list.push({
      id: `txn-${i}`,
      date: date.toISOString(),
      merchant: pick.merchant,
      category: pick.category,
      amount,
      accountId: i % 5 === 0 ? "acc-credit" : "acc-checking",
      status: i < 2 ? "pending" : "posted",
    });
  }
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const transactions: Transaction[] = buildTransactions();

// --- Running balance per account (for the receipt-style drill-down) --------

function attachRunningBalances(txns: Transaction[], accts: Account[]) {
  for (const acc of accts) {
    const accTxns = txns
      .filter((t) => t.accountId === acc.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const totalDelta = accTxns.reduce((sum, t) => sum + t.amount, 0);
    let running = acc.balance - totalDelta;
    for (const t of accTxns) {
      running += t.amount;
      t.runningBalance = Math.round(running * 100) / 100;
    }
  }
}

attachRunningBalances(transactions, accounts);

export const spendingHistory: SpendingPoint[] = [
  { month: "Feb", income: 4820, spending: 3210 },
  { month: "Mar", income: 4820, spending: 3540 },
  { month: "Apr", income: 5120, spending: 2980 },
  { month: "May", income: 4820, spending: 4110 },
  { month: "Jun", income: 5020, spending: 3390 },
  { month: "Jul", income: 4820, spending: 3670 },
];

export const CATEGORY_COLOR: Record<string, string> = {
  groceries: "#33d6ac",
  dining: "#e9bd6b",
  transport: "#5fa8ff",
  shopping: "#ff6b7a",
  utilities: "#a78bfa",
  entertainment: "#f472b6",
  health: "#4ade80",
  subscriptions: "#f59e0b",
};

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: "groceries", amount: 612 },
  { category: "dining", amount: 388 },
  { category: "transport", amount: 214 },
  { category: "shopping", amount: 470 },
  { category: "utilities", amount: 165 },
  { category: "entertainment", amount: 94 },
  { category: "health", amount: 121 },
  { category: "subscriptions", amount: 62 },
];

export const contacts: Contact[] = [
  { id: "c1", name: "Maya Chen", initials: "MC", lastSentAmount: 120 },
  { id: "c2", name: "Devon Ruiz", initials: "DR", lastSentAmount: 45 },
  { id: "c3", name: "Priya Patel", initials: "PP" },
  { id: "c4", name: "Sam Ortiz", initials: "SO", lastSentAmount: 300 },
];

export const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

// --- Net worth trend, with a projected (dashed) tail -----------------------

function buildNetWorthHistory(): NetWorthPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const rnd = seededRandom(71);
  const points: NetWorthPoint[] = [];
  let value = totalBalance - 5200;
  const today = new Date();

  months.forEach((_, i) => {
    value += 640 + (rnd() - 0.35) * 500;
    const d = new Date(today.getFullYear(), today.getMonth() - (months.length - 1 - i), 1);
    points.push({ date: d.toISOString(), netWorth: Math.round(value), projected: false });
  });

  // Force the last actual point to match today's real total balance.
  points[points.length - 1].netWorth = Math.round(totalBalance);

  // Trend from the last 4 actual points, extrapolated 3 months forward.
  const recent = points.slice(-4);
  const avgDelta =
    (recent[recent.length - 1].netWorth - recent[0].netWorth) / (recent.length - 1);

  let projectedValue = points[points.length - 1].netWorth;
  for (let i = 1; i <= 3; i++) {
    projectedValue += avgDelta;
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    points.push({
      date: d.toISOString(),
      netWorth: Math.round(projectedValue),
      projected: true,
    });
  }

  return points;
}

export const netWorthHistory: NetWorthPoint[] = buildNetWorthHistory();

// --- Subscriptions -----------------------------------------------------

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const subscriptions: Subscription[] = [
  {
    id: "sub-1",
    name: "Netflix",
    glyph: "N",
    amount: 15.49,
    cadence: "monthly",
    nextChargeDate: daysFromNow(2),
    category: "subscriptions",
    accountId: "acc-checking",
  },
  {
    id: "sub-2",
    name: "Spotify",
    glyph: "S",
    amount: 11.99,
    cadence: "monthly",
    nextChargeDate: daysFromNow(4),
    category: "subscriptions",
    accountId: "acc-checking",
  },
  {
    id: "sub-3",
    name: "iCloud+",
    glyph: "☁",
    amount: 2.99,
    cadence: "monthly",
    nextChargeDate: daysFromNow(6),
    category: "subscriptions",
    accountId: "acc-credit",
  },
  {
    id: "sub-4",
    name: "Notion",
    glyph: "◆",
    amount: 96,
    cadence: "yearly",
    nextChargeDate: daysFromNow(48),
    category: "subscriptions",
    accountId: "acc-credit",
  },
  {
    id: "sub-5",
    name: "Gym Membership",
    glyph: "◈",
    amount: 44.0,
    cadence: "monthly",
    nextChargeDate: daysFromNow(9),
    category: "subscriptions",
    accountId: "acc-checking",
  },
  {
    id: "sub-6",
    name: "ChatGPT Plus",
    glyph: "✦",
    amount: 20.0,
    cadence: "monthly",
    nextChargeDate: daysFromNow(1),
    category: "subscriptions",
    accountId: "acc-credit",
  },
];

// --- Budgets (per-category limits vs. spent this month) ----------------

export const budgets: Budget[] = [
  { category: "groceries", limit: 700, spent: 612, color: CATEGORY_COLOR.groceries },
  { category: "dining", limit: 350, spent: 388, color: CATEGORY_COLOR.dining },
  { category: "transport", limit: 260, spent: 214, color: CATEGORY_COLOR.transport },
  { category: "shopping", limit: 500, spent: 470, color: CATEGORY_COLOR.shopping },
  {
    category: "entertainment",
    limit: 150,
    spent: 94,
    color: CATEGORY_COLOR.entertainment,
  },
  {
    category: "subscriptions",
    limit: 90,
    spent: 62,
    color: CATEGORY_COLOR.subscriptions,
  },
];

// --- Goals ---------------------------------------------------------------

export const goals: Goal[] = [
  {
    id: "goal-1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 6820,
    targetDate: "2027-01-01",
    color: "#33d6ac",
    glyph: "◆",
  },
  {
    id: "goal-2",
    name: "Trip to Japan",
    targetAmount: 4500,
    currentAmount: 2115,
    targetDate: "2027-04-01",
    color: "#5fa8ff",
    glyph: "✈",
  },
  {
    id: "goal-3",
    name: "New Car Down Payment",
    targetAmount: 8000,
    currentAmount: 1240,
    targetDate: "2027-10-01",
    color: "#e9bd6b",
    glyph: "◈",
  },
];

// --- Auto-generated insights ---------------------------------------------

export function buildInsights(): Insight[] {
  const insights: Insight[] = [];

  const lastMonth = spendingHistory[spendingHistory.length - 1];
  const prevMonth = spendingHistory[spendingHistory.length - 2];
  const spendDelta = ((lastMonth.spending - prevMonth.spending) / prevMonth.spending) * 100;

  insights.push({
    id: "insight-spend-trend",
    tone: spendDelta < 0 ? "positive" : "warning",
    headline:
      spendDelta < 0
        ? `Spending down ${Math.abs(Math.round(spendDelta))}% vs. last month`
        : `Spending up ${Math.round(spendDelta)}% vs. last month`,
    detail:
      spendDelta < 0
        ? "Nice work — you're on track to save more this month."
        : "Mostly driven by dining and shopping. Check your budgets below.",
  });

  const diningBudget = budgets.find((b) => b.category === "dining");
  if (diningBudget && diningBudget.spent > diningBudget.limit) {
    const over = diningBudget.spent - diningBudget.limit;
    insights.push({
      id: "insight-dining-over",
      tone: "warning",
      headline: `Dining is $${over.toFixed(0)} over budget`,
      detail: `You've spent $${diningBudget.spent.toFixed(0)} of your $${diningBudget.limit.toFixed(
        0
      )} dining budget this month.`,
    });
  }

  const upcoming = subscriptions.filter((s) => {
    const days = (new Date(s.nextChargeDate).getTime() - Date.now()) / 86_400_000;
    return days <= 7;
  });
  if (upcoming.length > 0) {
    const total = upcoming.reduce((sum, s) => sum + s.amount, 0);
    insights.push({
      id: "insight-subscriptions",
      tone: "info",
      headline: `${upcoming.length} subscription${upcoming.length > 1 ? "s" : ""} renew${
        upcoming.length === 1 ? "s" : ""
      } this week`,
      detail: `Totaling $${total.toFixed(2)} across ${upcoming
        .map((s) => s.name)
        .join(", ")}.`,
    });
  }

  const topGoal = [...goals].sort(
    (a, b) => b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount
  )[0];
  if (topGoal) {
    const pct = Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100);
    insights.push({
      id: "insight-goal",
      tone: "positive",
      headline: `${pct}% of the way to "${topGoal.name}"`,
      detail: `$${(topGoal.targetAmount - topGoal.currentAmount).toLocaleString()} left to reach your $${topGoal.targetAmount.toLocaleString()} goal.`,
    });
  }

  return insights;
}

// --- Money flow (income -> checking -> categories -> savings) --------------

export function buildMoneyFlow(): MoneyFlowData {
  const income = spendingHistory[spendingHistory.length - 1].income;
  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
  const spentTotal = sortedCategories.reduce((sum, c) => sum + c.amount, 0);
  const leftover = Math.max(0, Math.round(income - spentTotal));

  const nodes: MoneyFlowData["nodes"] = [
    { name: "Income", color: "#33d6ac" },
    { name: "Checking", color: "#5fa8ff" },
    ...sortedCategories.map((c) => ({
      name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
      color: CATEGORY_COLOR[c.category] ?? "#8891a5",
    })),
    { name: "Savings", color: "#e9bd6b" },
  ];

  const checkingIndex = 1;
  const savingsIndex = nodes.length - 1;

  const links: MoneyFlowData["links"] = [
    { source: 0, target: checkingIndex, value: Math.round(income) },
    ...sortedCategories.map((c, i) => ({
      source: checkingIndex,
      target: checkingIndex + 1 + i,
      value: c.amount,
    })),
  ];

  if (leftover > 0) {
    links.push({ source: checkingIndex, target: savingsIndex, value: leftover });
  }

  return { nodes, links };
}