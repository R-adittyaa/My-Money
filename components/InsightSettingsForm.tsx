"use client";

import { useState } from "react";
import { INSIGHT_TEMPLATES, MoodType } from "@/lib/insight-config";
// Panggil Server Action, BUKAN dari lib/storage langsung
import { saveInsightSettingsAction } from "@/lib/actions";

// Definisikan tipe di sini biar nggak perlu import dari lib/storage
type InsightSettingsType = Record<MoodType, { title: string; message: string }>;

type Props = {
  initialSettings: InsightSettingsType | null;
};

export default function InsightSettingsForm({ initialSettings }: Props) {
  // Gabungin settingan dari DB sama template default
  const [settings, setSettings] = useState<InsightSettingsType>(
    initialSettings || INSIGHT_TEMPLATES
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    mood: MoodType,
    field: "title" | "message",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [mood]: { ...prev[mood], [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Panggil Server Action tanpa perlu kirim userId
      await saveInsightSettingsAction(settings);
      alert("Teks berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan teks. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const moods: { key: MoodType; label: string }[] = [
    { key: "excellent", label: "Luar Biasa (Pemasukan Besar)" },
    { key: "happy", label: "Kerja Bagus (Surplus)" },
    { key: "neutral", label: "Aman Terkendali (Wajar/Tenang)" },
    { key: "impas", label: "Impas (Pemasukan = Pengeluaran)" },
    { key: "boros", label: "Boros (Jajan Kebablasan)" },
    { key: "defisit", label: "Defisit (Gali Lubang Tutup Lubang)" },
  ];

  return (
    <div className="space-y-6">
      {moods.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900"
        >
          <h3 className="font-semibold text-sm mb-3 text-red-600 dark:text-red-400">
            {label}
          </h3>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-500">Judul</span>
              <input
                type="text"
                value={settings[key].title}
                onChange={(e) => handleChange(key, "title", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500">Pesan</span>
              <textarea
                value={settings[key].message}
                onChange={(e) => handleChange(key, "message", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
              />
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-colors disabled:opacity-50"
      >
        {isSaving ? "Menyimpan..." : "Simpan Pengaturan Teks"}
      </button>
    </div>
  );
}