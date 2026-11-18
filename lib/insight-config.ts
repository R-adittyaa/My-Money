// lib/insight-config.ts

export type MoodType = "excellent" | "happy" | "neutral" | "impas" | "boros" | "defisit";

export const INSIGHT_TEMPLATES: Record<MoodType, { title: string; message: string }> = {
  excellent: {
    title: "Luar Biasa!",
    message: "Pemasukan gede hari ini. Jangan lupa sisihkan buat tabungan ya!",
  },
  happy: {
    title: "Kerja Bagus!",
    message: "Hari ini lu berhasil nyimpen uang. Pertahankan ritmenya!",
  },
  neutral: {
    title: "Aman Terkendali",
    message: "Belum ada transaksi, atau pengeluaran hari ini masih wajar.",
  },
  impas: {
    title: "Impas!",
    message: "Pemasukan dan pengeluaran lu hari ini pas-pasan.",
  },
  boros: {
    title: "Waduh, Boros!",
    message: "Pengeluaran lu hari ini di atas rata-rata harian. Besok hemat ya!",
  },
  defisit: {
    title: "Waduh, Defisit!",
    message: "Pengeluaran hari ini melebihi pemasukan. Rem dikit ya!",
  },
};