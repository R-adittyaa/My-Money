import { Transaction } from "./types";

export function transactionsToCSV(transactions: Transaction[]): string {
  // Header
  const headers = ["Tanggal", "Tipe", "Kategori", "Jumlah", "Catatan"];

  // Escape function buat handle koma & kutip
  function escape(value: string): string {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // Baris data
  const rows = transactions.map((t) => [
    t.date,
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    t.category,
    t.amount.toString(),
    t.notes || "",
  ]);

  // Gabung
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n");

  // Tambah BOM biar Excel baca UTF-8 dengan bener
  return "\uFEFF" + csv;
}

export function generateFilename(month?: string): string {
  if (month) return `my-money-${month}.csv`;
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `my-money-${stamp}.csv`;
}