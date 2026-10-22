export default function AppLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-4xl mx-auto lg:mx-0 animate-pulse">
      {/* Skeleton Hero Saldo */}
      <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 w-full"></div>

      {/* Skeleton 3 Kotak Stat */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
      </div>

      {/* Skeleton List Transaksi */}
      <div className="space-y-3">
        <div className="h-6 w-32 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
      </div>
    </div>
  );
}