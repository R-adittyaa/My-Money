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
    startTransition(async () => {
      try {
        await action(formData);
        toast.info(`"${category}" dihapus`, {
          description: "Transaksi berhasil dihapus",
        });
      } catch (err) {
        toast.error("Gagal menghapus", {
          description: "Coba lagi ya",
        });
        console.error(err);
      }
    });
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="text-gray-300 hover:text-red-500 text-xs transition p-1 disabled:opacity-50"
        aria-label="Hapus"
      >
        {isPending ? "..." : "✕"}
      </button>
    </form>
  );
}