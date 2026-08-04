import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Account, Transaction } from "@/types/banking";

function formatUSD(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Generates and downloads a full account statement covering the given transactions. */
export function generateStatementPdf(transactions: Transaction[], accounts: Account[]) {
  const doc = new jsPDF();
  const generated = new Date().toLocaleString("en-US");

  doc.setFontSize(18);
  doc.text("Account Statement", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generated ${generated}`, 14, 27);

  let y = 38;
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Accounts", 14, y);
  y += 6;

  doc.setFontSize(10);
  accounts.forEach((acc) => {
    doc.setTextColor(90);
    doc.text(`${acc.name} (${acc.accountNumberMasked})`, 14, y);
    doc.setTextColor(20);
    doc.text(formatUSD(acc.balance), 196, y, { align: "right" });
    y += 6;
  });

  y += 4;

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  autoTable(doc, {
    startY: y,
    head: [["Date", "Merchant", "Category", "Status", "Amount"]],
    body: sorted.map((t) => [
      formatDate(t.date),
      t.merchant,
      t.category,
      t.status,
      formatUSD(t.amount),
    ]),
    headStyles: { fillColor: [15, 28, 48], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 4: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  doc.save(`statement-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/** Generates and downloads a single-transaction receipt. */
export function generateReceiptPdf(transaction: Transaction, account?: Account) {
  const doc = new jsPDF({ format: [320, 420] });

  doc.setFontSize(16);
  doc.text("Receipt", 20, 24);
  doc.setDrawColor(220);
  doc.line(20, 30, 300, 30);

  let y = 46;
  const rows: [string, string][] = [
    ["Merchant", transaction.merchant],
    ["Amount", formatUSD(transaction.amount)],
    ["Date", formatDate(transaction.date)],
    ["Category", transaction.category],
    ["Status", transaction.status],
    ["Account", account ? `${account.name} (${account.accountNumberMasked})` : "—"],
  ];

  if (transaction.runningBalance != null) {
    rows.push(["Balance after", formatUSD(transaction.runningBalance)]);
  }

  doc.setFontSize(11);
  rows.forEach(([label, value]) => {
    doc.setTextColor(120);
    doc.text(label, 20, y);
    doc.setTextColor(20);
    doc.text(value, 300, y, { align: "right" });
    y += 12;
  });

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Transaction ID: ${transaction.id}`, 20, y + 10);

  doc.save(`receipt-${transaction.id}.pdf`);
}