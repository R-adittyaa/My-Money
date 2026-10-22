"use client";

import { toast } from "sonner";
import { useTransition } from "react";

type Props = {
  id: string;
  category: string;
  action: (formData: FormData) => Promise<void>;
};

export default function DeleteButton({ id, category, action }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(formData: FormData) {
    if (!confirm("Yakin mau hapus transaksi ini?")) return;

    startTransition(async () => {
      try {
        await action(formData);
        toast.info(`"${category}" dihapus`, {
          description: "Transaksi berhasil dihapus",
        });
      } catch (err) {
        toast.error("Gagal menghapus", { description: "Coba lagi ya" });
        console.error(err);
      }
    });
  }

  return (
    <form action={handleDelete} className="w-full h-full">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-950/50 transition disabled:opacity-50"
      >
        {isPending ? "Hapus..." : "Hapus"}
      </button>
    </form>
  );
}