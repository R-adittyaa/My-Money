export default function Loading() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>

      {/* Hero / Card Skeleton (Kotak Merah) */}
      <div className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800 w-full"></div>

      {/* Grid Skeleton (3 Kotak Statistik) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
      </div>

      {/* List Skeleton (Riwayat Transaksi) */}
      <div className="space-y-3 pt-2">
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
      </div>
    </div>
  );
}