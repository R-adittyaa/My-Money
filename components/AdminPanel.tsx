"use client";

import { useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  username: string;
  displayName: string;
  plainPassword?: string;
  createdAt: string;
};

type Props = {
  users: User[];
  onDelete: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
};

export default function AdminPanel({ users, onDelete, onEdit }: Props) {
  const [editUser, setEditUser] = useState<User | null>(null);

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    
    if (!confirm(`Hapus akun "${username}"? Data transaksinya gak bakal kehapus, tapi user gak bisa login lagi.`)) return;
    
    try {
      await onDelete(fd);
      toast.success("User dihapus");
    } catch {
      toast.error("Gagal hapus user");
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    try {
      await onEdit(fd);
      toast.success("Data user diupdate");
      setEditUser(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal update user");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-red-500">Admin Panel</h1>
        <p className="text-sm text-gray-400">Rahasia. Jangan disebar.</p>
      </div>

      <div className="grid gap-3">
        {users.map((u) => (
          <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-lg">{u.displayName}</p>
              <p className="text-sm text-gray-400">@{u.username}</p>
              <div className="mt-2 text-xs bg-gray-800 px-2 py-1 rounded inline-block">
                Pass: <span className="font-mono text-green-400">{u.plainPassword || "(Terenkripsi)"}</span>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => setEditUser(u)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition"
              >
                Edit
              </button>
              
              {u.username !== "Raditt" && (
                <form onSubmit={handleDelete}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="username" value={u.username} />
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition">
                    Hapus
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT USER */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Edit User: {editUser.displayName}</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="hidden" name="userId" value={editUser.id} />
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Username</label>
                <input 
                  name="username" 
                  defaultValue={editUser.username} 
                  required 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Password Baru (Opsional)</label>
                <input 
                  name="password" 
                  type="text" 
                  placeholder="Kosongkan kalau gak mau ganti"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-2 rounded-lg border border-gray-700 text-sm">Batal</button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}