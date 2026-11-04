import { getCategories, saveCategories, updateCategory, getWallets, saveWallets, updateWallet, deleteWallet } from "@/lib/storage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import MasterDataManager from "@/components/MasterDataManager";

export default async function MasterDataPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [categories, wallets] = await Promise.all([
    getCategories(userId),
    getWallets(userId),
  ]);

  // --- SERVER ACTIONS KATEGORI ---
  async function handleAddCategory(name: string, type: "income" | "expense") {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const cats = await getCategories(session.user.id);
    await saveCategories(session.user.id, [...cats, { id: crypto.randomUUID(), name, type }]);
    revalidatePath("/pengaturan/master");
  }

  async function handleEditCategory(id: string, name: string, type: "income" | "expense") {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await updateCategory(session.user.id, id, name, type);
    revalidatePath("/pengaturan/master");
  }

  async function handleDeleteCategory(id: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const cats = await getCategories(session.user.id);
    await saveCategories(session.user.id, cats.filter((c) => c.id !== id));
    revalidatePath("/pengaturan/master");
  }

  // --- SERVER ACTIONS DOMPET ---
  async function handleAddWallet(name: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const wallets = await getWallets(session.user.id);
    await saveWallets(session.user.id, [...wallets, { id: crypto.randomUUID(), name, initialBalance: 0 }]);
    revalidatePath("/pengaturan/master");
  }

  async function handleEditWallet(id: string, name: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const wallets = await getWallets(session.user.id);
    const target = wallets.find(w => w.id === id);
    await updateWallet(session.user.id, id, name, target?.initialBalance || 0);
    revalidatePath("/pengaturan/master");
  }

  async function handleDeleteWallet(id: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await deleteWallet(session.user.id, id);
    revalidatePath("/pengaturan/master");
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-2xl mx-auto lg:mx-0 pb-20">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/pengaturan" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
          ← Kembali ke Pengaturan
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full"></span>
        <h1 className="text-lg font-bold">Master Data</h1>
      </div>

      <MasterDataManager
        categories={categories}
        wallets={wallets}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddWallet={handleAddWallet}
        onEditWallet={handleEditWallet}
        onDeleteWallet={handleDeleteWallet}
      />
    </main>
  );
}