import { getTransactions } from "@/lib/storage";
import ExportButton from "@/components/ExportButton";
import LogoutButton from "@/components/LogoutButton";
import { transactionsToCSV, generateFilename } from "@/lib/csv";

export default async function PengaturanPage() {
  const all = await getTransactions();

  const availableMonths = Array.from(
    new Set(all.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  const currentMonth =
    availableMonths[0] || new Date().toISOString().slice(0, 7);

  async function handleExport(month?: string): Promise<{
    csv: string;
    filename: string;
  }> {
    "use server";
    const all = await getTransactions();
    const data = month ? all.filter((t) => t.date.startsWith(month)) : all;
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    return {
      csv: transactionsToCSV(sorted),
      filename: generateFilename(month),
    };
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Pengaturan</h1>
      </div>

      {/* Export */}
      <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Export Data</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Download semua transaksi dalam format CSV. Bisa dibuka di Excel atau
          Google Sheets.
        </p>
        <ExportButton
          onExport={handleExport}
          availableMonths={availableMonths}
          currentMonth={currentMonth}
        />
      </section>

      {/* Akun — Logout */}
      <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Akun</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Keluar dari akun kamu di perangkat ini.
        </p>
        <LogoutButton />
      </section>

      {/* Info */}
      <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm">Tentang</h2>
        </div>
        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Total transaksi</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {all.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Bulan aktif</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {availableMonths.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Versi</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              v1.0
            </span>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 rounded-full"></span>
          <h2 className="font-semibold text-sm text-red-700 dark:text-red-400">
            Tips
          </h2>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Backup data kamu secara berkala dengan fitur Export CSV di atas.
          Simpan file-nya di Google Drive atau cloud storage biar aman.
        </p>
      </section>
    </main>
  );
}