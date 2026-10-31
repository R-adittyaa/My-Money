"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

type Props = {
  type: "dashboard" | "statistik";
  data: {
    balance?: number;
    income?: number;
    expense?: number;
    monthLabel?: string;
    topCategories?: { name: string; value: number; percentage: number }[];
  };
  onClose: () => void;
};

export default function ShareCard({ type, data, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `mymoney-${type}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Gambar berhasil di-download!");
    } catch (err) {
      toast.error("Gagal membuat gambar");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatRupiah = (n: number) => "Rp " + Math.abs(n).toLocaleString("id-ID");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      {/* Tombol Close di luar card */}
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white p-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      {/* CARD POSTER (Ini yang bakal di screenshot) */}
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
        <div 
          ref={cardRef} 
          className="w-[320px] sm:w-[360px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Ornamen Background */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

          {/* Header Card */}
          <div className="flex items-center gap-2 mb-8 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xs">Rp</div>
            <h2 className="text-sm font-bold tracking-widest uppercase opacity-80">My Money</h2>
          </div>

          {/* ISI CARD: DASHBOARD */}
          {type === "dashboard" && (
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Saldo · {data.monthLabel}</p>
                <p className="text-4xl font-bold tabular-nums">{formatRupiah(data.balance || 0)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-green-400 mb-1">↓ Pemasukan</p>
                  <p className="text-sm font-semibold">{formatRupiah(data.income || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-red-400 mb-1">↑ Pengeluaran</p>
                  <p className="text-sm font-semibold">{formatRupiah(data.expense || 0)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ISI CARD: STATISTIK */}
          {type === "statistik" && (
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Pengeluaran · {data.monthLabel}</p>
                <p className="text-3xl font-bold tabular-nums text-red-400">{formatRupiah(data.expense || 0)}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Top Kategori</p>
                {data.topCategories?.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-500" : "bg-yellow-500"}`}></span>
                      {c.name}
                    </span>
                    <span className="font-semibold">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Card */}
          <div className="mt-8 pt-4 border-t border-white/10 text-center relative z-10">
            <p className="text-[9px] text-gray-500">Catat Keuanganmu Lebih Rapi</p>
          </div>
        </div>

        {/* Tombol Aksi (Di bawah card) */}
        <div className="flex gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition">
            Batal
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            {isDownloading ? "Menyimpan..." : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}