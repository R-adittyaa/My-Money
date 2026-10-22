import Link from "next/link";
import LogoutButton from "./LogoutButton";

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

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
            <SettingsIcon />
            <span className="hidden sm:inline">Pengaturan</span>
          </Link>
          
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
          
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}