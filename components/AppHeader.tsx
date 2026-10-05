import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            Rp
          </div>
          <h1 className="text-base font-bold">
            My<span className="text-red-600 dark:text-red-500">Money</span>
          </h1>
        </Link>
      </div>
    </header>
  );
}