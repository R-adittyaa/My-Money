import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers, saveUsers, adminUpdateUser } from "@/lib/auth-helpers";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const session = await auth();
  
  if (session?.user?.name?.toLowerCase() !== "obett") {
    redirect("/");
  }

  const users = await getUsers();

  async function handleDeleteUser(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.name?.toLowerCase() !== "obett") throw new Error("Unauthorized");
    
    const userId = formData.get("userId") as string;
    const allUsers = await getUsers();
    const target = allUsers.find(u => u.id === userId);
    if (target?.username === "Raditt") return; 

    await saveUsers(allUsers.filter(u => u.id !== userId));
  }

  // TAMBAHAN: Server Action buat ngedit user
  async function handleEditUser(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.name?.toLowerCase() !== "obett") throw new Error("Unauthorized");
    
    const userId = formData.get("userId") as string;
    const newUsername = formData.get("username") as string;
    const newPassword = formData.get("password") as string;

    await adminUpdateUser(userId, newUsername, newPassword);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <AdminPanel 
        users={users} 
        onDelete={handleDeleteUser} 
        onEdit={handleEditUser} // <-- Kirim Action Baru
      />
    </div>
  );
}