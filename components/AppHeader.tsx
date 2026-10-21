import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            Rp
          </div>
          <h1 className="text-base font-bold">
            My<span className="text-red-600 dark:text-red-500">Money</span>
          </h1>
        </Link>

        {/* Kanan: Tombol Pengaturan & Logout */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/pengaturan"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 px-3 py-1.5 rounded-lg transition"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Pengaturan</span>
          </Link>
          
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
          
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}