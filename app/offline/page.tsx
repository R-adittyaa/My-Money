export default function Offline() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          Rp
        </div>
        <h1 className="text-xl font-bold">Kamu lagi offline 📡</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          My Money butuh koneksi internet buat sinkronisasi data. Coba cek
          koneksi kamu, terus refresh halaman ini.
        </p>
        <a
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
        >
          Coba Lagi
        </a>
      </div>
    </main>
  );
}