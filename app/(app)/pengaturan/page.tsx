import { getTransactions } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExportButton from "@/components/ExportButton";
import LogoutButton from "@/components/LogoutButton";
import AccountSettings from "@/components/AccountSettings";
import { transactionsToCSV, generateFilename } from "@/lib/csv";

export default async function PengaturanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const all = await getTransactions(userId);

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
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const all = await getTransactions(session.user.id);
    const data = month ? all.filter((t) => t.date.startsWith(month)) : all;
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    return {
      csv: transactionsToCSV(sorted),
      filename: generateFilename(month),
    };
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-6 max-w-4xl mx-auto lg:mx-0 pb-24">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-xl font-bold">Pengaturan</h1>
      </div>

      {/* SECTION: AKUN */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Akun</h2>
        
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-bold text-sm">{session.user.name}</p>
              <p className="text-xs text-gray-500">Personal Account</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Ganti Password</p>
              <AccountSettings />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: PREFERENSI */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Preferensi</h2>
        
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Tema Aplikasi</p>
              <p className="text-xs text-gray-500">Saat ini mengikuti sistem (Dark/Light)</p>
            </div>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-md font-medium">Auto</span>
          </div>
          <Link href="/dompet" className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <div>
              <p className="font-medium text-sm">Kelola Dompet</p>
              <p className="text-xs text-gray-500">Atur sumber dana dan saldo awal</p>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        </div>
      </section>

      {/* SECTION: DATA & EXPORT */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Data & Backup</h2>
        
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Total Transaksi</p>
              <p className="text-xs text-gray-500">Data tersimpan di cloud</p>
            </div>
            <p className="font-bold text-lg text-red-600 dark:text-red-500">{all.length}</p>
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
          <div>
            <p className="font-medium text-sm mb-1">Export CSV</p>
            <p className="text-xs text-gray-500 mb-3">Download data transaksi kamu ke format Excel/Sheets.</p>
            <ExportButton
              onExport={handleExport}
              availableMonths={availableMonths}
              currentMonth={currentMonth}
            />
          </div>
        </div>
      </section>

      {/* SECTION: LAINNYA */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Lainnya</h2>
        
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
          <div className="p-4 flex items-center justify-between">
            <p className="font-medium text-sm">Versi Aplikasi</p>
            <p className="text-xs text-gray-500 font-mono">v2.0.0 (PWA)</p>
          </div>
          <div className="p-4 flex items-center justify-between">
            <p className="font-medium text-sm">Logout</p>
            <LogoutButton />
          </div>
        </div>
      </section>

      <div className="text-center pt-6 pb-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          My Money · Dibuat dengan ❤️
        </p>
      </div>
    </main>
  );
}